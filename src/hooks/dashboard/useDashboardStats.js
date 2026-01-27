// ============================================
// 📁 src/hooks/dashboard/useDashboardStats.js
// Responsabilidade: Cálculos de estatísticas
// ============================================

import { useMemo } from "react";
import { filterAppointments } from "../../utils/filters/appointmentFilters";
import {
  countAvailableSlotsIncludingCancelled,
  getAvailableSlotsIncludingCancelled,
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
import { DEFAULT_PATIENT_NAME } from "../../constants/formatters";
import { getPreviousMonth } from "../../utils/date/getPreviousMonth";
import { convertTimestampToDate } from "../../utils/firebase/convertTimestamp";
import { createPatientsMap } from "../../utils/patients/createPatientsMap";
import { useExpenseStats } from "../expenses/useExpenseStats";
import { getTodayLocal } from "../../utils/date/dateHelpers";

export const useDashboardStats = ({
  appointments,
  availability,
  patients,
  expenses = [],
  filterOptions,
}) => {
  const filteredAppointments = useMemo(() =>
    filterAppointments(appointments, filterOptions), 
    [appointments, filterOptions]
  );

  const filteredAvailability = useMemo(() => {
    const inPeriod = filterAppointments(availability.map(day => ({ date: day.date })), filterOptions);
    const filteredDates = new Set(inPeriod.map(day => day.date));
    const filteredAvailabilityForPeriod = availability.filter(d => filteredDates.has(d.date));
    
    // Usa filteredAppointments ao invés de appointments para respeitar o filtro de mês
    return getAvailableSlotsIncludingCancelled(
      filteredAvailabilityForPeriod,
      filteredAppointments,
      new Date()
    );
  }, [availability, filteredAppointments, filterOptions]);

  // ✅ Conta slots disponíveis incluindo cancelados (similar ao publicSchedule)
  const slotsOpen = useMemo(() => {
    const filteredDates = filterAppointments(
      availability.map(day => ({ date: day.date })), 
      filterOptions
    ).map(day => day.date);
    
    const filteredAvailabilityForPeriod = availability.filter(d => 
      filteredDates.includes(d.date)
    );
    
    // Usa filteredAppointments ao invés de appointments para respeitar o filtro de mês
    return countAvailableSlotsIncludingCancelled(
      filteredAvailabilityForPeriod,
      filteredAppointments,
      new Date()
    );
  }, [availability, filteredAppointments, filterOptions]);

  const totalPatients = useMemo(() => {
    const uniquePatients = new Set(
      appointments
        .filter(appointment => STATUS_GROUPS.ACTIVE.includes(appointment.status))
        .map(appointment => appointment.patientWhatsapp)
    );
    return uniquePatients.size;
  }, [appointments]);

  const revenueStats = useMemo(() => {
    const today = getTodayLocal(); // "2026-01-26" - timezone-safe

    const confirmed = filteredAppointments.filter(appointment =>
      isStatusInGroup(appointment.status, 'CONFIRMED')
    );

    const realized = confirmed
      .filter(appointment => {
        // Comparação direta de strings YYYY-MM-DD (evita timezone issues)
        return appointment.date < today;
      })
      .reduce((sum, appointment) => {
        const price = appointment.value || 0;
        return sum + Number(price);
      }, 0);

    const predicted = confirmed
      .filter(appointment => {
        // Comparação direta de strings YYYY-MM-DD (evita timezone issues)
        return appointment.date >= today;
      })
      .reduce((sum, appointment) => {
        const price = appointment.value || 0;
        return sum + Number(price);
      }, 0);

    // Em risco: Pendentes (PENDING + MESSAGE_SENT) + Não compareceu (NO_SHOW)
    const atRisk = filteredAppointments
      .filter(appointment => {
        return STATUS_GROUPS.PENDING.includes(appointment.status) ||
               appointment.status === APPOINTMENT_STATUS.NO_SHOW;
      })
      .reduce((sum, appointment) => {
        const price = appointment.value || 0;
        return sum + Number(price);
      }, 0);

    return { realized, predicted, atRisk };
  }, [filteredAppointments]);

  // Expense Stats - Calculate expenses filtered by date
  const expenseStats = useExpenseStats(expenses, filterOptions);

  // Net Income - Revenue Realized minus Total Expenses
  const netIncome = useMemo(() => {
    return revenueStats.realized - expenseStats.total;
  }, [revenueStats.realized, expenseStats.total]);

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
        const price = appointment.value || 0;
        return sum + Number(price);
      }, 0);
  }, [appointments, filteredAppointments]);

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
        const price = appointment.value || 0;
        return sum + Number(price);
      }, 0);
    
    if (prevRevenue === 0) return null;
    
    const percentChange = Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100);
    
    return {
      value: Math.abs(percentChange),
      trend: percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral"
    };
  }, [revenueStats, appointments, filterOptions.selectedMonth, filterOptions.selectedYear]);

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
    const basicStats = calculateAppointmentStats(filteredAppointments);
    
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
      revenueAtRisk: revenueStats.atRisk,
      newPatientsRevenue,
      newPatientsRevenuePercent,
      monthlyFinancialComparison,
      confirmedComparison,
      pendingComparison,
      totalExpenses: expenseStats.total,
      netIncome,
      expensesByLocation: expenseStats.byLocation,
    };
  }, [filteredAppointments, slotsOpen, appointments, filterOptions, totalPatients, revenueStats, newPatientsRevenue, newPatientsRevenuePercent, monthlyFinancialComparison, confirmedComparison, pendingComparison, expenseStats, netIncome]);

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
    const patientsMap = createPatientsMap(patients);
    
    // Console.log para debug: mostrar nomes dos pacientes únicos
    const uniquePatientsList = Array.from(uniquePatientWhatsapps).map(whatsapp => {
      const patient = patientsMap[whatsapp];
      return {
        whatsapp,
        name: patient?.name || patient?.referenceName || DEFAULT_PATIENT_NAME,
        referenceName: patient?.referenceName || null,
      };
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
    const newPatientsList = [];
    
    uniquePatientWhatsapps.forEach(whatsapp => {
      const patient = patientsMap[whatsapp];
      if (!patient || !patient.createdAt) return;
      
      const createdAtDate = convertTimestampToDate(patient.createdAt);
      
      if (!createdAtDate || isNaN(createdAtDate.getTime())) return;
      
      const createdAtMonth = createdAtDate.getMonth() + 1;
      const createdAtYear = createdAtDate.getFullYear();
      
      if (createdAtMonth === targetMonth && createdAtYear === targetYear) {
        newPatientsCurrent++;
        newPatientsList.push({
          whatsapp: patient.whatsapp,
          name: patient.name || null,
          referenceName: patient.referenceName || null,
          createdAt: patient.createdAt,
        });
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
      newPatientsList: newPatientsList.sort((a, b) => {
        // Ordena por nome
        const nameA = a.name || a.referenceName || '';
        const nameB = b.name || b.referenceName || '';
        return nameA.localeCompare(nameB);
      }),
      messagesSent,
      messagesSentTotal,
      noShow,
      noShowTotal: totalAppointmentsForDetails,
      cancelled,
      cancelledTotal: totalAppointmentsAllStatus,
    };
  }, [filteredAppointments, patients, filterOptions]);

  // Financial Forecast - Breakdown por status
  const financialForecast = useMemo(() => {
    const confirmedTotal = revenueStats.realized + revenueStats.predicted;
    
    const pendingTotal = filteredAppointments
      .filter(appointment => STATUS_GROUPS.PENDING.includes(appointment.status))
      .reduce((sum, appointment) => {
        const price = appointment.value || 0;
        return sum + Number(price);
      }, 0);
    
    const noShowTotal = filteredAppointments
      .filter(appointment => appointment.status === APPOINTMENT_STATUS.NO_SHOW)
      .reduce((sum, appointment) => {
        const price = appointment.value || 0;
        return sum + Number(price);
      }, 0);
    
    const total = confirmedTotal + pendingTotal + noShowTotal;
    
    return {
      confirmed: confirmedTotal,
      pending: pendingTotal,
      noShow: noShowTotal,
      total,
    };
  }, [filteredAppointments, revenueStats]);

  // Financial Breakdown - Detalhamento por status
  const financialBreakdown = useMemo(() => {
    return {
      confirmed: {
        realized: revenueStats.realized,
        future: revenueStats.predicted,
      },
      pending: {
        total: filteredAppointments
          .filter(appointment => STATUS_GROUPS.PENDING.includes(appointment.status))
          .reduce((sum, appointment) => {
            const price = appointment.value || 0;
            return sum + Number(price);
          }, 0),
      },
      noShow: {
        total: filteredAppointments
          .filter(appointment => appointment.status === APPOINTMENT_STATUS.NO_SHOW)
          .reduce((sum, appointment) => {
            const price = appointment.value || 0;
            return sum + Number(price);
          }, 0),
      },
    };
  }, [filteredAppointments, revenueStats]);

  // Previous Months Summary - Agrupado por mês (Recebido + Pendentes + Não compareceu)
  // Filtra apenas o ano atual (inclui meses anteriores e o mês atual do ano atual)
  const previousMonthsSummary = useMemo(() => {
    const today = getTodayLocal(); // "2026-01-26" - timezone-safe
    const todayDate = new Date(); // Usar apenas para extrair mês/ano
    const currentMonth = todayDate.getMonth() + 1; // 1-12
    const currentYear = todayDate.getFullYear();
    
    // Filtrar appointments apenas do ano atual (meses anteriores e o mês atual)
    const allMonthsAppointments = appointments.filter(appointment => {
      if (!appointment.date) return false;
      
      const appointmentDate = new Date(appointment.date);
      const appointmentMonth = appointmentDate.getMonth() + 1;
      const appointmentYear = appointmentDate.getFullYear();
      
      // Apenas ano atual, incluindo meses anteriores e o mês atual
      return appointmentYear === currentYear && appointmentMonth <= currentMonth;
    });
    
    // Agrupar por mês/ano
    const monthsMap = new Map();
    
    allMonthsAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      const month = appointmentDate.getMonth() + 1;
      const year = appointmentDate.getFullYear();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      if (!monthsMap.has(key)) {
        monthsMap.set(key, {
          year,
          month,
          received: 0,
          noShow: 0,
        });
      }
      
      const monthData = monthsMap.get(key);
      const price = appointment.value || 0;
      
      // Recebido (Confirmados realizados)
      if (isStatusInGroup(appointment.status, 'CONFIRMED')) {
        // Comparação direta de strings YYYY-MM-DD (evita timezone issues)
        if (appointment.date < today) {
          monthData.received += Number(price);
        }
      }
      
      // Não compareceu
      if (appointment.status === APPOINTMENT_STATUS.NO_SHOW) {
        monthData.noShow += Number(price);
      }
    });
    
    // Converter para array e ordenar (mais recente primeiro)
    const monthsArray = Array.from(monthsMap.values())
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    
    // Calcular totais
    const totals = monthsArray.reduce((acc, month) => ({
      received: acc.received + month.received,
      noShow: acc.noShow + month.noShow,
    }), { received: 0, noShow: 0 });
    
    totals.total = totals.received + totals.noShow;
    
    return {
      months: monthsArray,
      totals,
    };
  }, [appointments]);

  // Future Months Comparison - Meses atuais e futuros com appointments (previsão)
  const futureMonthsComparison = useMemo(() => {
    const today = getTodayLocal(); // "2026-01-26" - timezone-safe
    const todayDate = new Date(); // Usar apenas para extrair mês/ano
    const currentMonth = todayDate.getMonth() + 1; // 1-12
    const currentYear = todayDate.getFullYear();
    
    // Filtrar appointments do mês atual e futuros do ano atual
    const futureMonthsAppointments = appointments.filter(appointment => {
      if (!appointment.date) return false;
      
      const appointmentDate = new Date(appointment.date);
      const appointmentMonth = appointmentDate.getMonth() + 1;
      const appointmentYear = appointmentDate.getFullYear();
      
      // Mês atual e futuros do ano atual
      return appointmentYear === currentYear && appointmentMonth >= currentMonth;
    });
    
    // Agrupar por mês/ano
    const monthsMap = new Map();
    
    futureMonthsAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      const month = appointmentDate.getMonth() + 1;
      const year = appointmentDate.getFullYear();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      if (!monthsMap.has(key)) {
        monthsMap.set(key, {
          year,
          month,
          confirmed: 0, // Confirmados futuros
          pending: 0,     // Pendentes
        });
      }
      
      const monthData = monthsMap.get(key);
      const price = appointment.value || 0;
      
      // Confirmados futuros (status confirmado E data futura)
      if (isStatusInGroup(appointment.status, 'CONFIRMED')) {
        // Comparação direta de strings YYYY-MM-DD (evita timezone issues)
        // Apenas appointments com data futura (não passada)
        if (appointment.date >= today) {
          monthData.confirmed += Number(price);
        }
      }
      
      // Pendentes
      if (isStatusInGroup(appointment.status, 'PENDING')) {
        monthData.pending += Number(price);
      }
    });
    
    // Converter para array e ordenar (mais próximo primeiro)
    const monthsArray = Array.from(monthsMap.values())
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
    
    // Calcular totais
    const totals = monthsArray.reduce((acc, month) => ({
      confirmed: acc.confirmed + month.confirmed,
      pending: acc.pending + month.pending,
    }), { confirmed: 0, pending: 0 });
    
    totals.total = totals.confirmed + totals.pending;
    
    return {
      months: monthsArray,
      totals,
    };
  }, [appointments]);

  // Extract filtered expenses from expenseStats
  const filteredExpenses = useMemo(() => expenseStats.filtered, [expenseStats]);

  return {
    stats: enhancedStats,
    statusSummary,
    detailsSummary,
    filteredAppointments,
    filteredAvailability,
    filteredExpenses,
    financialForecast,
    financialBreakdown,
    previousMonthsSummary,
    futureMonthsComparison,
  };
};
