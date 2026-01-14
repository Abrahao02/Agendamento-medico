// ============================================
// 📁 src/hooks/dashboard/useDashboard.js
// ============================================

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
} from "../../utils/stats/appointmentStats";
import { generateYearRange } from "../../utils/helpers/yearHelpers";
import { 
  calculateNewPatientsStats,
  calculateGroupedStats,
  calculateConversionRate,
  calculateMonthComparison 
} from "../../utils/stats/enhancedStats";
import { STATUS_GROUPS, isStatusInGroup, APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import { formatDateToQuery } from "../../utils/filters/dateFilters";
import {
  calculateMonthlyAppointmentsCount,
  checkLimitReached,
} from "../../utils/limits/calculateMonthlyLimit";
import { logError, logWarning } from "../../utils/logger/logger";
import { getMonthName } from "../../constants/months";
import { getPreviousMonth } from "../../utils/date/getPreviousMonth";
import { convertTimestampToDate } from "../../utils/firebase/convertTimestamp";

export const useDashboard = () => {
  const user = auth.currentUser;

  if (!user) {
    logWarning("useDashboard usado sem usuário autenticado");
  }

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  // Calcula primeiro e último dia do mês atual para estado inicial
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1);
  };
  
  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0);
  };
  
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const lastDayOfMonth = getLastDayOfMonth(currentYear, currentMonth);
  const defaultDateFrom = formatDateToQuery(firstDayOfMonth);
  const defaultDateTo = formatDateToQuery(lastDayOfMonth);

  const [doctorSlug, setDoctorSlug] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // Inicializa com o mês atual por padrão
  const [selectedDateFrom, setSelectedDateFrom] = useState(defaultDateFrom);
  const [selectedDateTo, setSelectedDateTo] = useState(defaultDateTo);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorPlan, setDoctorPlan] = useState("free");
  const [isLimitReached, setIsLimitReached] = useState(false);

  // FETCH DATA
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch doctor data and other data in parallel
        const [doctorSnapshot, appointmentsSnapshot, patientsSnapshot, availabilitySnapshot] = await Promise.all([
          getDoc(doc(db, "doctors", user.uid)),
          getDocs(query(collection(db, "appointments"), where("doctorId", "==", user.uid))),
          getDocs(query(collection(db, "patients"), where("doctorId", "==", user.uid))),
          getDocs(query(collection(db, "availability"), where("doctorId", "==", user.uid))),
        ]);

        // Update doctor data
        if (doctorSnapshot.exists()) {
          const doctorData = doctorSnapshot.data();
          setDoctorSlug(doctorData.slug || user.uid);
          setDoctorPlan(doctorData.plan || "free");
        }

        setAppointments(appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const patientsData = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(patientsData);

        const availabilityData = availabilitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAvailability(validateAvailability(availabilityData, true));

        // Calculate limit
        const appointmentsData = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const count = calculateMonthlyAppointmentsCount(appointmentsData);
        const plan = doctorSnapshot.exists() ? (doctorSnapshot.data().plan || "free") : "free";
        setIsLimitReached(checkLimitReached(plan, count));
      } catch (error) {
        logError("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  const priceMap = useMemo(() => {
    const prices = {};
    patients.forEach(patient => {
      prices[patient.whatsapp] = patient.price || 0;
    });
    return prices;
  }, [patients]);

  const filteredAppointments = useMemo(() =>
    filterAppointments(appointments, {
      startDate: selectedDateFrom,
      endDate: selectedDateTo,
      selectedMonth,
      selectedYear,
    }), [appointments, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear]
  );

  const filteredAvailability = useMemo(() => {
    const inPeriod = filterAppointments(availability.map(day => ({ date: day.date })), {
      startDate: selectedDateFrom,
      endDate: selectedDateTo,
      selectedMonth,
      selectedYear,
    });
    const filteredDates = new Set(inPeriod.map(day => day.date));
    
    return filterAvailableSlots(
      availability.filter(d => filteredDates.has(d.date)), 
      appointments
    );
  }, [availability, appointments, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear]);

  const slotsOpen = useMemo(() => countAvailableSlots(filteredAvailability), [filteredAvailability]);

  const totalPatients = useMemo(() => {
    const uniquePatients = new Set(
      appointments
        .filter(appointment => STATUS_GROUPS.ACTIVE.includes(appointment.status))
        .map(appointment => appointment.patientWhatsapp)
    );
    return uniquePatients.size;
  }, [appointments]);

  const revenueStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const confirmed = filteredAppointments.filter(appointment => 
      isStatusInGroup(appointment.status, 'CONFIRMED')
    );
    
    const realized = confirmed
      .filter(appointment => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time || "00:00"}:00`);
        return appointmentDate < today;
      })
      .reduce((sum, appointment) => {
        const price = appointment.value || priceMap[appointment.patientWhatsapp] || 0;
        return sum + Number(price);
      }, 0);
    
    const predicted = confirmed
      .filter(appointment => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time || "00:00"}:00`);
        return appointmentDate >= today;
      })
      .reduce((sum, appointment) => {
        const price = appointment.value || priceMap[appointment.patientWhatsapp] || 0;
        return sum + Number(price);
      }, 0);
    
    return { realized, predicted };
  }, [filteredAppointments, priceMap]);

  const newPatientsRevenue = useMemo(() => {
    const newPatientsSet = new Set();
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Identifica novos pacientes do período
    appointments
      .filter(appointment => STATUS_GROUPS.ACTIVE.includes(appointment.status))
      .forEach(appointment => {
        const appointmentDate = new Date(appointment.date);
        if (appointmentDate.getMonth() + 1 === currentMonth && 
            appointmentDate.getFullYear() === currentYear) {
          const firstAppointment = appointments
            .filter(apt => apt.patientWhatsapp === appointment.patientWhatsapp && 
                         STATUS_GROUPS.ACTIVE.includes(apt.status))
            .sort((apt1, apt2) => new Date(apt1.date) - new Date(apt2.date))[0];
          if (firstAppointment && firstAppointment.date === appointment.date) {
            newPatientsSet.add(appointment.patientWhatsapp);
          }
        }
      });
    
    // Calcula receita total de novos pacientes
    return filteredAppointments
      .filter(appointment => isStatusInGroup(appointment.status, 'CONFIRMED') && 
                   newPatientsSet.has(appointment.patientWhatsapp))
      .reduce((sum, appointment) => {
        const price = appointment.value || priceMap[appointment.patientWhatsapp] || 0;
        return sum + Number(price);
      }, 0);
  }, [appointments, filteredAppointments, priceMap]);

  const newPatientsRevenuePercent = useMemo(() => {
    const totalRevenue = revenueStats.realized + revenueStats.predicted;
    if (totalRevenue === 0) return 0;
    return Math.round((newPatientsRevenue / totalRevenue) * 100);
  }, [newPatientsRevenue, revenueStats]);

  const monthlyFinancialComparison = useMemo(() => {
    const { month: prevMonth, year: prevYear } = getPreviousMonth(selectedMonth, selectedYear);
    
    const currentRevenue = revenueStats.realized + revenueStats.predicted;
    
    const previousMonthAppointments = filterAppointments(appointments, {
      selectedMonth: prevMonth,
      selectedYear: prevYear,
    });
    
    const prevRevenue = previousMonthAppointments
      .filter(appointment => isStatusInGroup(appointment.status, 'CONFIRMED'))
      .reduce((sum, appointment) => {
        const price = appointment.value || priceMap[appointment.patientWhatsapp] || 0;
        return sum + Number(price);
      }, 0);
    
    if (prevRevenue === 0) return null;
    
    const percentChange = Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100);
    
    return {
      value: Math.abs(percentChange),
      trend: percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral"
    };
  }, [revenueStats, appointments, selectedMonth, selectedYear, priceMap]);

  const monthlyData = useMemo(() => {
    const months = [];
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    for (let i = 2; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      const monthAppointments = filterAppointments(appointments, {
        selectedMonth: month,
        selectedYear: year,
      });
      
      const revenue = monthAppointments
        .filter(appointment => isStatusInGroup(appointment.status, 'CONFIRMED'))
        .reduce((sum, appointment) => {
          const price = appointment.value || priceMap[appointment.patientWhatsapp] || 0;
          return sum + Number(price);
        }, 0);
      
      months.push({
        key: `${year}-${month}`,
        name: getMonthName(month),
        revenue,
        trend: i === 0 ? null : (revenue > months[months.length - 1]?.revenue ? 'up' : 
                                  revenue < months[months.length - 1]?.revenue ? 'down' : 'neutral')
      });
    }
    
    return months;
  }, [appointments, selectedMonth, selectedYear, priceMap]);

  const confirmedComparison = useMemo(() => {
    const { month: prevMonth, year: prevYear } = getPreviousMonth(selectedMonth, selectedYear);
    
    const currentConfirmed = filteredAppointments.filter(appointment => 
      isStatusInGroup(appointment.status, 'CONFIRMED')
    ).length;
    
    const previousMonthAppointments = filterAppointments(appointments, {
      selectedMonth: prevMonth,
      selectedYear: prevYear,
    });
    
    const prevConfirmed = previousMonthAppointments.filter(appointment => 
      isStatusInGroup(appointment.status, 'CONFIRMED')
    ).length;
    
    if (prevConfirmed === 0) return null;
    
    const percentChange = Math.round(((currentConfirmed - prevConfirmed) / prevConfirmed) * 100);
    
    return {
      value: Math.abs(percentChange),
      trend: percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral"
    };
  }, [filteredAppointments, appointments, selectedMonth, selectedYear]);

  const pendingComparison = useMemo(() => {
    const { month: prevMonth, year: prevYear } = getPreviousMonth(selectedMonth, selectedYear);
    
    const currentPending = filteredAppointments.filter(appointment => 
      isStatusInGroup(appointment.status, 'PENDING')
    ).length;
    
    const previousMonthAppointments = filterAppointments(appointments, {
      selectedMonth: prevMonth,
      selectedYear: prevYear,
    });
    
    const prevPending = previousMonthAppointments.filter(appointment => 
      isStatusInGroup(appointment.status, 'PENDING')
    ).length;
    
    if (prevPending === 0) return null;
    
    const percentChange = Math.round(((currentPending - prevPending) / prevPending) * 100);
    
    return {
      value: Math.abs(percentChange),
      trend: percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral"
    };
  }, [filteredAppointments, appointments, selectedMonth, selectedYear]);

  // ✅ ESTATÍSTICAS APRIMORADAS
  const enhancedStats = useMemo(() => {
    // calculateAppointmentStats já filtra por STATUS_GROUPS.ACTIVE internamente
    const basicStats = calculateAppointmentStats(filteredAppointments, priceMap);
    
    // Total de agendamentos (ACTIVE já inclui NO_SHOW)
    const totalAppointments = filteredAppointments.filter(appointment => 
      STATUS_GROUPS.ACTIVE.includes(appointment.status)
    ).length;
    
    // calculateGroupedStats mostra TODOS os status (incluindo cancelados)
    const groupedStats = calculateGroupedStats(filteredAppointments);
    
    // calculateNewPatientsStats considera apenas appointments ATIVOS
    const newPatientsStats = calculateNewPatientsStats(appointments, selectedMonth, selectedYear);
    
    // calculateConversionRate usa apenas appointments ATIVOS
    const conversionRate = calculateConversionRate(filteredAppointments);
    
    // Comparação com mês anterior
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    
    const previousMonthAppointments = filterAppointments(appointments, {
      selectedMonth: prevMonth,
      selectedYear: prevYear,
    });
    
    // calculateMonthComparison compara apenas appointments ATIVOS
    const appointmentsComparison = calculateMonthComparison(
      filteredAppointments,
      previousMonthAppointments
    );
    
    return {
      ...basicStats,
      totalAppointments, // Sobrescreve o totalAppointments para incluir NO_SHOW
      slotsOpen,
      groupedStats,
      newPatients: newPatientsStats.current,
      newPatientsComparison: newPatientsStats.comparison,
      appointmentsComparison,
      conversionRate,
      totalPatients,
      revenueRealized: revenueStats.realized,
      revenuePredicted: revenueStats.predicted,
      newPatientsRevenue,
      newPatientsRevenuePercent,
      monthlyFinancialComparison,
      confirmedComparison,
      pendingComparison,
    };
  }, [filteredAppointments, priceMap, slotsOpen, appointments, selectedMonth, selectedYear, totalPatients, revenueStats, newPatientsRevenue, newPatientsRevenuePercent, monthlyFinancialComparison, confirmedComparison, pendingComparison]);

  const statusSummary = useMemo(() => {
    const grouped = calculateGroupedStats(filteredAppointments);
    
    // Calcula no-show separadamente (já não está incluído em cancelled)
    const noShow = filteredAppointments.filter(appointment => 
      appointment.status === APPOINTMENT_STATUS.NO_SHOW
    ).length;
    
    const total = filteredAppointments.length;
    const noShowPercentage = total > 0 ? Math.round((noShow / total) * 100) : 0;
    
    return {
      confirmed: grouped.confirmed,
      pending: grouped.pending,
      cancelled: grouped.cancelled,
      noShow,
      percentages: {
        ...grouped.percentages,
        noShow: noShowPercentage,
      },
    };
  }, [filteredAppointments]);

  const detailsSummary = useMemo(() => {
    // Identifica pacientes únicos dos appointments filtrados
    const uniquePatientWhatsapps = new Set(
      filteredAppointments.map(appointment => appointment.patientWhatsapp).filter(Boolean)
    );
    const totalUniquePatients = uniquePatientWhatsapps.size;
    
    // Cria mapa de pacientes por WhatsApp para acesso rápido
    const patientsMap = {};
    patients.forEach(patient => {
      patientsMap[patient.whatsapp] = patient;
    });
    
    
    // Determina o mês/ano que está sendo visualizado
    let targetMonth = selectedMonth;
    let targetYear = selectedYear;
    
    // Se houver range de datas, usa o primeiro dia do range para determinar mês/ano
    if (selectedDateFrom) {
      const fromDate = new Date(selectedDateFrom + 'T00:00:00');
      targetMonth = fromDate.getMonth() + 1;
      targetYear = fromDate.getFullYear();
    }
    
    // Verifica se o paciente foi criado no mesmo mês/ano visualizado
    // Apenas comparação direta - se criado em janeiro e está olhando janeiro = novo paciente
    let newPatientsCurrent = 0;
    
    uniquePatientWhatsapps.forEach(whatsapp => {
      const patient = patientsMap[whatsapp];
      if (!patient || !patient.createdAt) return;
      
      const createdAtDate = convertTimestampToDate(patient.createdAt);
      
      // Se não conseguir converter, ignora (paciente sem data de criação não conta)
      if (!createdAtDate || isNaN(createdAtDate.getTime())) return;
      
      // Compara mês e ano do createdAt com o mês/ano visualizado
      const createdAtMonth = createdAtDate.getMonth() + 1; // getMonth() retorna 0-11
      const createdAtYear = createdAtDate.getFullYear();
      
      // Apenas conta se o mês e ano do createdAt baterem EXATAMENTE com o mês/ano visualizado
      if (createdAtMonth === targetMonth && createdAtYear === targetYear) {
        newPatientsCurrent++;
      }
    });
    
    // Mensagens enviadas
    const messagesSent = filteredAppointments.filter(appointment => 
      appointment.status === APPOINTMENT_STATUS.MESSAGE_SENT
    ).length;
    
    // Total de appointments do grupo PENDING (Pendente OU Msg enviada) - mesmo valor do card "Pendentes"
    const messagesSentTotal = filteredAppointments.filter(appointment => 
      isStatusInGroup(appointment.status, 'PENDING')
    ).length;
    
    // Não compareceu
    const noShow = filteredAppointments.filter(appointment => 
      appointment.status === APPOINTMENT_STATUS.NO_SHOW
    ).length;
    
    // Cancelados
    const cancelled = filteredAppointments.filter(appointment => 
      appointment.status === APPOINTMENT_STATUS.CANCELLED
    ).length;
    
    // Total de agendamentos (ACTIVE já inclui NO_SHOW) - mesmo valor do card "Total de agendamentos"
    const totalAppointmentsForDetails = filteredAppointments.filter(appointment => 
      STATUS_GROUPS.ACTIVE.includes(appointment.status)
    ).length;
    
    // Total de appointments (todos os status) - para usar como denominador de "Cancelados"
    const totalAppointmentsAllStatus = filteredAppointments.length;
    
    return {
      newPatients: newPatientsCurrent,
      newPatientsTotal: totalUniquePatients,
      messagesSent,
      messagesSentTotal,
      noShow,
      noShowTotal: totalAppointmentsForDetails,
      cancelled,
      cancelledTotal: totalAppointmentsAllStatus,
    };
  }, [filteredAppointments, patients, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    const byDay = {};
    filteredAppointments.forEach(appointment => {
      if (!byDay[appointment.date]) {
        byDay[appointment.date] = { 
          date: appointment.date, 
          Confirmado: 0, 
          Pendente: 0, 
          "Msg enviada": 0,
          Cancelado: 0,
          "Não Compareceu": 0 
        };
      }
      byDay[appointment.date][appointment.status]++;
    });
    return Object.values(byDay).sort((day1, day2) => day1.date.localeCompare(day2.date));
  }, [filteredAppointments]);

  const upcomingAppointments = useMemo(() => {
    // Filtra apenas appointments ATIVOS
    const activeAppointments = filteredAppointments.filter(appointment => 
      STATUS_GROUPS.ACTIVE.includes(appointment.status)
    );

    return activeAppointments
      .filter(appointment => new Date(`${appointment.date}T${appointment.time || "00:00"}:00`) >= today)
      .sort((apt1, apt2) => new Date(`${apt1.date}T${apt1.time || "00:00"}:00`) - new Date(`${apt2.date}T${apt2.time || "00:00"}:00`))
      .slice(0, 5);
  }, [filteredAppointments, today]);

  const financialChartData = useMemo(() => {
    const byDay = {};
    filteredAppointments.forEach(a => {
      // Apenas appointments confirmados contam para faturamento
      if (isStatusInGroup(a.status, 'CONFIRMED')) {
        if (!byDay[a.date]) {
          byDay[a.date] = { 
            date: a.date, 
            revenue: 0
          };
        }
        const price = a.value || priceMap[a.patientWhatsapp] || 0;
        byDay[a.date].revenue += Number(price);
      }
    });
    return Object.values(byDay)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        date: item.date,
        revenue: Number(item.revenue.toFixed(2))
      }));
  }, [filteredAppointments, priceMap]);

  const availableYears = useMemo(() => generateYearRange(1), []);

  const resetFilters = useCallback(() => {
    // Reseta para "Este mês" (primeiro e último dia do mês atual)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const lastDay = getLastDayOfMonth(currentYear, currentMonth);
    setSelectedDateFrom(formatDateToQuery(firstDay));
    setSelectedDateTo(formatDateToQuery(lastDay));
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, [currentMonth, currentYear]);

  return {
    loading: loadingData,
    doctorSlug,
    stats: enhancedStats,
    statusSummary,
    detailsSummary,
    chartData,
    upcomingAppointments,
    financialChartData,
    monthlyData,
    availableYears,
    selectedDateFrom,
    selectedDateTo,
    selectedMonth,
    selectedYear,
    setSelectedDateFrom,
    setSelectedDateTo,
    setSelectedMonth,
    setSelectedYear,
    resetFilters,
    isLimitReached,
  };
};