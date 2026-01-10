// ============================================
// 📁 src/hooks/useDashboard.js - REFATORADO
// ============================================
import { useEffect, useState, useMemo, useCallback } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { filterAppointments } from "../../utils/filters/appointmentFilters";
import { validateAvailability, filterAvailableSlots, countAvailableSlots } from "../../utils/filters/availabilityFilters";
import { calculateAppointmentStats, calculateStatusSummary } from "../../utils/stats/appointmentStats";
import { generateYearRange } from "../../utils/helpers/yearHelpers";

export const useDashboard = (user) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [doctorSlug, setDoctorSlug] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [priceMap, setPriceMap] = useState({});

  // FETCH DOCTOR
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

  // FETCH ALL DATA
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [appSnap, patientSnap, availSnap] = await Promise.all([
          getDocs(query(collection(db, "appointments"), where("doctorId", "==", user.uid))),
          getDocs(query(collection(db, "patients"), where("doctorId", "==", user.uid))),
          getDocs(query(collection(db, "availability"), where("doctorId", "==", user.uid)))
        ]);

        // Appointments
        const appointmentsData = appSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAppointments(appointmentsData);

        // Patients (prices)
        const prices = {};
        patientSnap.docs.forEach((d) => {
          prices[d.data().whatsapp] = d.data().price || 0;
        });
        setPriceMap(prices);

        // Availability - ✅ Usa util para validar
        const availabilityData = availSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const validated = validateAvailability(availabilityData, true);
        setAvailability(validated);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  // ✅ FILTERED APPOINTMENTS - Usa util
  const filteredAppointments = useMemo(() => {
    return filterAppointments(appointments, {
      startDate: selectedDateFrom,
      endDate: selectedDateTo,
      selectedMonth,
      selectedYear
    });
  }, [appointments, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear]);

  // ✅ FILTERED AVAILABILITY - Usa utils
  const filteredAvailability = useMemo(() => {
    // Primeiro filtra por período
    const inPeriod = filterAppointments(availability.map(day => ({ date: day.date })), {
      startDate: selectedDateFrom,
      endDate: selectedDateTo,
      selectedMonth,
      selectedYear
    });

    const filteredDates = new Set(inPeriod.map(d => d.date));
    const availInPeriod = availability.filter(day => filteredDates.has(day.date));

    // Depois remove slots agendados
    return filterAvailableSlots(availInPeriod, appointments);
  }, [availability, appointments, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear]);

  // ✅ SLOTS OPEN - Usa util
  const slotsOpen = useMemo(() => {
    return countAvailableSlots(filteredAvailability);
  }, [filteredAvailability]);

  // ✅ STATS - Usa util
  const stats = useMemo(() => {
    const calculated = calculateAppointmentStats(filteredAppointments, priceMap);
    return { ...calculated, slotsOpen };
  }, [filteredAppointments, priceMap, slotsOpen]);

  // ✅ STATUS SUMMARY - Usa util
  const statusSummary = useMemo(() => {
    return calculateStatusSummary(filteredAppointments);
  }, [filteredAppointments]);

  // CHART DATA
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

  // UPCOMING APPOINTMENTS
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

  const handleResetFilters = useCallback(() => {
    setSelectedDateFrom("");
    setSelectedDateTo("");
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, [currentMonth, currentYear]);

  // ✅ YEARS - Usa util
  const availableYears = useMemo(() => generateYearRange(1), []);

  return {
    doctorSlug,
    loadingData,
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
    stats,
    statusSummary,
    chartData,
    upcomingAppointments,
  };
};