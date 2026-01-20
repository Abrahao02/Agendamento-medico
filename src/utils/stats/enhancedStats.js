// ============================================
// 📁 src/utils/stats/enhancedStats.js
// ============================================

import { STATUS_GROUPS, isStatusInGroup, APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import { getPreviousMonth } from "../date/getPreviousMonth";

/**
 * Calcula estatísticas agrupadas por status
 */
export const calculateGroupedStats = (appointments) => {
  if (!Array.isArray(appointments) || appointments.length === 0) {
    return {
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      total: 0,
      percentages: { confirmed: 0, pending: 0, cancelled: 0 },
    };
  }

  const confirmed = appointments.filter(appointment => 
    isStatusInGroup(appointment.status, 'CONFIRMED')
  ).length;

  const pending = appointments.filter(appointment => 
    isStatusInGroup(appointment.status, 'PENDING')
  ).length;

  const cancelled = appointments.filter(appointment => 
    appointment.status === APPOINTMENT_STATUS.CANCELLED
  ).length;

  const total = appointments.length;

  const percentages = {
    confirmed: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    pending: total > 0 ? Math.round((pending / total) * 100) : 0,
    cancelled: total > 0 ? Math.round((cancelled / total) * 100) : 0,
  };

  return {
    confirmed,
    pending,
    cancelled,
    total,
    percentages,
  };
};

/**
 * Calcula novos pacientes no período
 * ✅ ATUALIZADO: Considera apenas appointments ATIVOS
 */
export const calculateNewPatientsStats = (allAppointments, month, year) => {
  if (!Array.isArray(allAppointments)) {
    return { current: 0, comparison: null };
  }

  const activeAppointments = allAppointments.filter(appointment => 
    STATUS_GROUPS.ACTIVE.includes(appointment.status)
  );

  // Agrupa por paciente (whatsapp) e pega primeiro appointment
  const patientFirstAppointment = {};
  
  activeAppointments.forEach(appointment => {
    const key = appointment.patientWhatsapp;
    const appointmentDate = new Date(appointment.date);
    
    if (!patientFirstAppointment[key] || new Date(patientFirstAppointment[key]) > appointmentDate) {
      patientFirstAppointment[key] = appointment.date;
    }
  });

  // Conta quantos tiveram primeiro appointment no mês/ano selecionado
  const currentMonthNew = Object.values(patientFirstAppointment).filter(date => {
    const d = new Date(date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  }).length;

  // Mês anterior
  const { month: prevMonth, year: prevYear } = getPreviousMonth(month, year);

  const prevMonthNew = Object.values(patientFirstAppointment).filter(date => {
    const d = new Date(date);
    return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
  }).length;

  const comparison = prevMonthNew > 0
    ? {
        value: Math.round(((currentMonthNew - prevMonthNew) / prevMonthNew) * 100),
        trend: currentMonthNew > prevMonthNew ? "up" : currentMonthNew < prevMonthNew ? "down" : "neutral"
      }
    : null;

  return {
    current: currentMonthNew,
    comparison,
  };
};

/**
 * Calcula taxa de conversão (confirmados / total ativos)
 * ✅ ATUALIZADO: Usa apenas appointments ATIVOS
 */
export const calculateConversionRate = (appointments) => {
  if (!Array.isArray(appointments)) return 0;

  const activeAppointments = appointments.filter(appointment => 
    STATUS_GROUPS.ACTIVE.includes(appointment.status)
  );

  if (activeAppointments.length === 0) return 0;

  const confirmed = activeAppointments.filter(appointment => 
    isStatusInGroup(appointment.status, 'CONFIRMED')
  ).length;

  return Math.round((confirmed / activeAppointments.length) * 100);
};

/**
 * Compara appointments entre dois períodos
 * ✅ ATUALIZADO: Compara apenas appointments ATIVOS
 */
export const calculateMonthComparison = (currentPeriod, previousPeriod) => {
  if (!Array.isArray(currentPeriod) || !Array.isArray(previousPeriod)) {
    return null;
  }

  const currentActive = currentPeriod.filter(appointment => 
    STATUS_GROUPS.ACTIVE.includes(appointment.status)
  ).length;

  const previousActive = previousPeriod.filter(appointment => 
    STATUS_GROUPS.ACTIVE.includes(appointment.status)
  ).length;

  if (previousActive === 0) return null;

  const percentChange = Math.round(((currentActive - previousActive) / previousActive) * 100);

  return {
    value: Math.abs(percentChange),
    trend: percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral"
  };
};