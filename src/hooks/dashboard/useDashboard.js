import { useEffect, useState, useMemo, useCallback } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../services/firebase";

import { filterAppointments } from "../../utils/filters/appointmentFilters";
import {
  validateAvailability,
  filterAvailableSlots,
  countAvailableSlots,
} from "../../utils/filters/availabilityFilters";
import {
  calculateAppointmentStats,
  calculateStatusSummary,
} from "../../utils/stats/appointmentStats";
import { generateYearRange } from "../../utils/helpers/yearHelpers";

export const useDashboard = () => {
  // ==============================
  // AUTH (garantido pelo PrivateRoute)
  // ==============================
  const user = auth.currentUser;

  if (!user) {
    console.warn("useDashboard usado sem usuário autenticado");
  }

  // ==============================
  // CONSTANTES
  // ==============================
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // ==============================
  // ESTADO
  // ==============================
  const [doctorSlug, setDoctorSlug] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [priceMap, setPriceMap] = useState({});

  // ==============================
  // FETCH DOCTOR
  // ==============================
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

  // ==============================
  // FETCH APPOINTMENTS, PATIENTS, AVAILABILITY
  // ==============================
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [appSnap, patientSnap, availSnap] = await Promise.all([
          getDocs(query(collection(db, "appointments"), where("doctorId", "==", user.uid))),
          getDocs(query(collection(db, "patients"), where("doctorId", "==", user.uid))),
          getDocs(query(collection(db, "availability"), where("doctorId", "==", user.uid))),
        ]);

        setAppointments(appSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const prices = {};
        patientSnap.docs.forEach(d => {
          prices[d.data().whatsapp] = d.data().price || 0;
        });
        setPriceMap(prices);

        const availabilityData = availSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAvailability(validateAvailability(availabilityData, true));
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  // ==============================
  // COMPUTED VALUES
  // ==============================
  const filteredAppointments = useMemo(() =>
    filterAppointments(appointments, {
      startDate: selectedDateFrom,
      endDate: selectedDateTo,
      selectedMonth,
      selectedYear,
    }), [appointments, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear]
  );

  const filteredAvailability = useMemo(() => {
    const inPeriod = filterAppointments(availability.map(d => ({ date: d.date })), {
      startDate: selectedDateFrom,
      endDate: selectedDateTo,
      selectedMonth,
      selectedYear,
    });
    const filteredDates = new Set(inPeriod.map(d => d.date));
    return filterAvailableSlots(availability.filter(d => filteredDates.has(d.date)), appointments);
  }, [availability, appointments, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear]);

  const slotsOpen = useMemo(() => countAvailableSlots(filteredAvailability), [filteredAvailability]);

  const stats = useMemo(() => ({ 
    ...calculateAppointmentStats(filteredAppointments, priceMap), 
    slotsOpen 
  }), [filteredAppointments, priceMap, slotsOpen]);

  const statusSummary = useMemo(() => 
    calculateStatusSummary(filteredAppointments), 
    [filteredAppointments]
  );

  const chartData = useMemo(() => {
    const byDay = {};
    filteredAppointments.forEach(a => {
      if (!byDay[a.date]) byDay[a.date] = { date: a.date, Confirmado: 0, Pendente: 0, "Não Compareceu": 0 };
      byDay[a.date][a.status]++;
    });
    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredAppointments]);

  const upcomingAppointments = useMemo(() =>
    filteredAppointments
      .filter(a => new Date(`${a.date}T${a.time || "00:00"}:00`) >= today)
      .sort((a, b) => new Date(`${a.date}T${a.time || "00:00"}:00`) - new Date(`${b.date}T${b.time || "00:00"}:00`))
      .slice(0, 5)
  , [filteredAppointments, today]);

  const availableYears = useMemo(() => generateYearRange(1), []);

  // ==============================
  // ACTIONS
  // ==============================
  const resetFilters = useCallback(() => {
    setSelectedDateFrom("");
    setSelectedDateTo("");
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, [currentMonth, currentYear]);

  // ==============================
  // RETURN
  // ==============================
  return {
    // Estado
    loading: loadingData,
    doctorSlug,
    
    // Computed
    stats,
    statusSummary,
    chartData,
    upcomingAppointments,
    availableYears,
    
    // Filtros (estado)
    selectedDateFrom,
    selectedDateTo,
    selectedMonth,
    selectedYear,
    
    // Actions
    setSelectedDateFrom,
    setSelectedDateTo,
    setSelectedMonth,
    setSelectedYear,
    resetFilters,
  };
};