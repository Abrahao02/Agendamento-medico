
// ============================================
// 📁 src/utils/stats/enhancedStats.js - NOVO
// Estatísticas avançadas
// ============================================
import { APPOINTMENT_STATUS, STATUS_GROUPS, isStatusInGroup } from "../../constants/appointmentStatus";

/**
 * Calcula comparação com mês anterior
 */
export const calculateMonthComparison = (currentMonthData, previousMonthData) => {
  const current = currentMonthData.length;
  const previous = previousMonthData.length;
  
  if (previous === 0) {
    return {
      value: current > 0 ? 100 : 0,
      trend: current > 0 ? "up" : "neutral",
      isNew: true
    };
  }
  
  const percentChange = ((current - previous) / previous) * 100;
  
  return {
    value: Math.abs(Math.round(percentChange)),
    trend: percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral",
    isNew: false
  };
};

/**
 * Calcula estatísticas de novos pacientes
 */
export const calculateNewPatientsStats = (appointments, selectedMonth, selectedYear) => {
  // Agrupa por paciente
  const patientFirstAppointment = {};
  
  appointments.forEach(apt => {
    const key = apt.patientWhatsapp;
    if (!patientFirstAppointment[key] || apt.date < patientFirstAppointment[key]) {
      patientFirstAppointment[key] = apt.date;
    }
  });
  
  // Conta novos pacientes no mês selecionado
  const targetMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const newPatients = Object.values(patientFirstAppointment).filter(
    date => date.startsWith(targetMonth)
  ).length;
  
  // Compara com mês anterior
  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  
  const prevNewPatients = Object.values(patientFirstAppointment).filter(
    date => date.startsWith(prevMonthStr)
  ).length;
  
  return {
    current: newPatients,
    comparison: calculateMonthComparison(
      Array(newPatients).fill(0),
      Array(prevNewPatients).fill(0)
    )
  };
};

/**
 * Calcula estatísticas por grupo de status
 */
export const calculateGroupedStats = (appointments) => {
  const stats = {
    confirmed: appointments.filter(a => isStatusInGroup(a.status, 'CONFIRMED')).length,
    pending: appointments.filter(a => isStatusInGroup(a.status, 'PENDING')).length,
    cancelled: appointments.filter(a => isStatusInGroup(a.status, 'CANCELLED')).length,
  };
  
  const total = stats.confirmed + stats.pending + stats.cancelled;
  
  return {
    ...stats,
    total,
    percentages: {
      confirmed: total > 0 ? Math.round((stats.confirmed / total) * 100) : 0,
      pending: total > 0 ? Math.round((stats.pending / total) * 100) : 0,
      cancelled: total > 0 ? Math.round((stats.cancelled / total) * 100) : 0,
    }
  };
};

/**
 * Calcula taxa de conversão (confirmados / total)
 */
export const calculateConversionRate = (appointments) => {
  const total = appointments.length;
  const confirmed = appointments.filter(a => 
    a.status === APPOINTMENT_STATUS.CONFIRMED
  ).length;
  
  return total > 0 ? Math.round((confirmed / total) * 100) : 0;
};