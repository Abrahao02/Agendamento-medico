// ============================================
// 📁 src/hooks/dashboard/useDashboardStats.js
// Responsabilidade: Cálculos de estatísticas
// ============================================

import { useMemo } from "react";
import { filterAppointments } from "../../utils/filters/appointmentFilters";
import {
  filterAvailableSlots,
  countAvailableSlots,
} from "../../utils/filters/availabilityFilters";
import {
  calculateAppointmentStats,
} from "../../utils/stats/appointmentStats";
import { 
  calculateNewPatientsStats,
  calculateGroupedStats,
  calculateConversionRate,
  calculateMonthComparison 
} from "../../utils/stats/enhancedStats";
import { STATUS_GROUPS, isStatusInGroup, APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import { getPreviousMonth } from "../../utils/date/getPreviousMonth";
import { convertTimestampToDate } from "../../utils/firebase/convertTimestamp";

export const useDashboardStats = ({
  appointments,
  availability,
  patients,
  filterOptions,
}) => {
  const priceMap = useMemo(() => {
    const prices = {};
    patients.forEach(patient => {
      prices[patient.whatsapp] = patient.price || 0;
    });
    return prices;
  }, [patients]);

  const filteredAppointments = useMemo(() =>
    filterAppointments(appointments, filterOptions), 
    [appointments, filterOptions]
  );

  const filteredAvailability = useMemo(() => {
    const inPeriod = filterAppointments(availability.map(day => ({ date: day.date })), filterOptions);
    const filteredDates = new Set(inPeriod.map(day => day.date));
    
    return filterAvailableSlots(
      availability.filter(d => filteredDates.has(d.date)), 
      appointments
    );
  }, [availability, appointments, filterOptions]);

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
    const { month: prevMonth, year: prevYear } = getPreviousMonth(filterOptions.selectedMonth, filterOptions.selectedYear);
    
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
  }, [revenueStats, appointments, filterOptions.selectedMonth, filterOptions.selectedYear, priceMap]);

  const confirmedComparison = useMemo(() => {
    const { month: prevMonth, year: prevYear } = getPreviousMonth(filterOptions.selectedMonth, filterOptions.selectedYear);
    
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
  }, [filteredAppointments, appointments, filterOptions.selectedMonth, filterOptions.selectedYear]);

  const pendingComparison = useMemo(() => {
    const { month: prevMonth, year: prevYear } = getPreviousMonth(filterOptions.selectedMonth, filterOptions.selectedYear);
    
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
  }, [filteredAppointments, appointments, filterOptions.selectedMonth, filterOptions.selectedYear]);

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
    const newPatientsStats = calculateNewPatientsStats(appointments, filterOptions.selectedMonth, filterOptions.selectedYear);
    
    // calculateConversionRate usa apenas appointments ATIVOS
    const conversionRate = calculateConversionRate(filteredAppointments);
    
    // Comparação com mês anterior
    const prevMonth = filterOptions.selectedMonth === 1 ? 12 : filterOptions.selectedMonth - 1;
    const prevYear = filterOptions.selectedMonth === 1 ? filterOptions.selectedYear - 1 : filterOptions.selectedYear;
    
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
  }, [filteredAppointments, priceMap, slotsOpen, appointments, filterOptions, totalPatients, revenueStats, newPatientsRevenue, newPatientsRevenuePercent, monthlyFinancialComparison, confirmedComparison, pendingComparison]);

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
    let targetMonth = filterOptions.selectedMonth;
    let targetYear = filterOptions.selectedYear;
    
    // Se houver range de datas, usa o primeiro dia do range para determinar mês/ano
    if (filterOptions.startDate) {
      const fromDate = new Date(filterOptions.startDate + 'T00:00:00');
      targetMonth = fromDate.getMonth() + 1;
      targetYear = fromDate.getFullYear();
    }
    
    // Verifica se o paciente foi criado no mesmo mês/ano visualizado
    let newPatientsCurrent = 0;
    
    uniquePatientWhatsapps.forEach(whatsapp => {
      const patient = patientsMap[whatsapp];
      if (!patient || !patient.createdAt) return;
      
      const createdAtDate = convertTimestampToDate(patient.createdAt);
      
      if (!createdAtDate || isNaN(createdAtDate.getTime())) return;
      
      const createdAtMonth = createdAtDate.getMonth() + 1;
      const createdAtYear = createdAtDate.getFullYear();
      
      if (createdAtMonth === targetMonth && createdAtYear === targetYear) {
        newPatientsCurrent++;
      }
    });
    
    // Mensagens enviadas
    const messagesSent = filteredAppointments.filter(appointment => 
      appointment.status === APPOINTMENT_STATUS.MESSAGE_SENT
    ).length;
    
    // Total de appointments do grupo PENDING
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
    
    // Total de agendamentos (ACTIVE já inclui NO_SHOW)
    const totalAppointmentsForDetails = filteredAppointments.filter(appointment => 
      STATUS_GROUPS.ACTIVE.includes(appointment.status)
    ).length;
    
    // Total de appointments (todos os status)
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
  }, [filteredAppointments, patients, filterOptions]);

  return {
    stats: enhancedStats,
    statusSummary,
    detailsSummary,
    filteredAppointments,
  };
};
