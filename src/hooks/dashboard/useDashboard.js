// src/hooks/dashboard/useDashboard.js
import { useEffect, useState, useMemo, useCallback } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";

export const useDashboard = (user) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Doctor data
  const [doctorSlug, setDoctorSlug] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // Filters
  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Data
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [priceMap, setPriceMap] = useState({});

  /* ==============================
     FETCH DOCTOR DATA
  ============================== */
  useEffect(() => {
    if (!user) return;

    const fetchDoctor = async () => {
      try {
        const snap = await getDoc(doc(db, "doctors", user.uid));
        if (snap.exists()) {
          setDoctorSlug(snap.data().slug || user.uid);
        }
      } catch (error) {
        console.error("Erro ao buscar médico:", error);
      }
    };

    fetchDoctor();
  }, [user]);

  /* ==============================
     FETCH ALL DATA
  ============================== */
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // 1. Fetch appointments
        const appSnap = await getDocs(
          query(collection(db, "appointments"), where("doctorId", "==", user.uid))
        );
        const appointmentsData = appSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setAppointments(appointmentsData);

        // 2. Fetch patients (for prices)
        const patientSnap = await getDocs(
          query(collection(db, "patients"), where("doctorId", "==", user.uid))
        );
        const prices = {};
        patientSnap.docs.forEach((d) => {
          prices[d.data().whatsapp] = d.data().price || 0;
        });
        setPriceMap(prices);

        // 3. Fetch availability (mesma lógica do PublicSchedule)
        const availSnap = await getDocs(
          query(collection(db, "availability"), where("doctorId", "==", user.uid))
        );
        
        const availabilityData = availSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const todayStr = new Date().toISOString().split("T")[0];
        
        // Filtra apenas datas futuras e com slots válidos
        const validAvailability = availabilityData
          .filter(day => 
            day.date &&
            typeof day.date === "string" &&
            Array.isArray(day.slots) &&
            day.slots.length > 0 &&
            day.date >= todayStr
          )
          .sort((a, b) => a.date.localeCompare(b.date));

        setAvailability(validAvailability);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  /* ==============================
     FILTERED AVAILABILITY
     Remove horários já agendados
  ============================== */
  const filteredAvailability = useMemo(() => {
    return availability.map(day => {
      // Busca horários já agendados nessa data
      const bookedSlots = appointments
        .filter(a => a.date === day.date)
        .map(a => a.time);

      // Retorna apenas slots livres
      return {
        ...day,
        slots: day.slots.filter(slot => !bookedSlots.includes(slot)),
      };
    }).filter(day => day.slots.length > 0);
  }, [availability, appointments]);

  /* ==============================
     SLOTS OPEN COUNT
     Conta apenas slots realmente disponíveis
  ============================== */
  const slotsOpen = useMemo(() => {
    return filteredAvailability.reduce(
      (sum, day) => sum + (day.slots?.length || 0), 
      0
    );
  }, [filteredAvailability]);

  /* ==============================
     FILTERED APPOINTMENTS
  ============================== */
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    if (selectedDateFrom && selectedDateTo) {
      filtered = filtered.filter(
        (a) => a.date >= selectedDateFrom && a.date <= selectedDateTo
      );
    } else if (selectedMonth && selectedYear) {
      filtered = filtered.filter((a) => {
        const [year, month] = a.date.split("-").map(Number);
        return month === Number(selectedMonth) && year === Number(selectedYear);
      });
    }

    return filtered;
  }, [appointments, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear]);

  /* ==============================
     STATS CALCULATION
  ============================== */
  const stats = useMemo(() => {
    let revenue = 0;
    let attended = 0;

    filteredAppointments.forEach((a) => {
      const appointmentDate = new Date(a.date);
      if (a.status === "Confirmado" && appointmentDate <= today) {
        attended++;
        const value =
          a.value !== undefined ? a.value : priceMap[a.patientWhatsapp] || 0;
        revenue += value;
      }
    });

    const totalValue = Object.values(priceMap).reduce((sum, price) => sum + price, 0);
    const patientCount = Object.keys(priceMap).length;

    return {
      slotsOpen,
      totalAppointments: filteredAppointments.length,
      attendedAppointments: attended,
      totalRevenue: revenue,
      averageTicket: patientCount ? Math.round(totalValue / patientCount) : 0,
    };
  }, [filteredAppointments, priceMap, slotsOpen, today]);

  /* ==============================
     STATUS SUMMARY
  ============================== */
  const statusSummary = useMemo(() => {
    const summary = { Confirmado: 0, Pendente: 0, "Não Compareceu": 0 };
    filteredAppointments.forEach((a) => {
      if (summary.hasOwnProperty(a.status)) {
        summary[a.status]++;
      }
    });
    return summary;
  }, [filteredAppointments]);

  /* ==============================
     CHART DATA
  ============================== */
  const chartData = useMemo(() => {
    const byDay = {};
    filteredAppointments.forEach((a) => {
      if (!byDay[a.date]) {
        byDay[a.date] = {
          date: a.date,
          Confirmado: 0,
          Pendente: 0,
          "Não Compareceu": 0,
        };
      }
      byDay[a.date][a.status]++;
    });
    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredAppointments]);

  /* ==============================
     UPCOMING APPOINTMENTS
  ============================== */
  const upcomingAppointments = useMemo(() => {
    return filteredAppointments
      .filter((a) => new Date(`${a.date}T${a.time || "00:00"}:00`) >= today)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || "00:00"}:00`);
        const dateB = new Date(`${b.date}T${b.time || "00:00"}:00`);
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [filteredAppointments, today]);

  /* ==============================
     RESET FILTERS
  ============================== */
  const handleResetFilters = useCallback(() => {
    setSelectedDateFrom("");
    setSelectedDateTo("");
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, [currentMonth, currentYear]);

  /* ==============================
     AVAILABLE YEARS
  ============================== */
  const availableYears = useMemo(() => {
    const years = new Set();
    years.add(currentYear);
    years.add(currentYear - 1);
    years.add(currentYear + 1);
    return Array.from(years).sort((a, b) => b - a);
  }, [currentYear]);

  /* ==============================
     RETURN
  ============================== */
  return {
    // Doctor
    doctorSlug,
    
    // Loading
    loadingData,
    
    // Filters
    selectedDateFrom,
    selectedDateTo,
    selectedMonth,
    selectedYear,
    setSelectedDateFrom,
    setSelectedDateTo,
    setSelectedMonth,
    setSelectedYear,
    handleResetFilters,
    availableYears,
    
    // Stats
    stats,
    statusSummary,
    
    // Charts
    chartData,
    upcomingAppointments,
  };
};