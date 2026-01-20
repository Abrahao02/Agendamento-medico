// ============================================
// 📁 src/utils/stats/appointmentStats.js
// ============================================

import { STATUS_GROUPS, isStatusInGroup, APPOINTMENT_STATUS } from "../../constants/appointmentStatus";

/**
 * Calcula estatísticas básicas de appointments
 */
export const calculateAppointmentStats = (appointments, priceMap = {}) => {
  if (!Array.isArray(appointments)) {
    return {
      totalAppointments: 0,
      totalRevenue: 0,
      averageTicket: "0.00",
    };
  }

  const activeAppointments = appointments.filter(a => 
    STATUS_GROUPS.ACTIVE.includes(a.status)
  );

  const totalAppointments = activeAppointments.length;

  // Calcula faturamento total (apenas confirmados)
  const totalRevenue = appointments
    .filter(a => isStatusInGroup(a.status, 'CONFIRMED'))
    .reduce((sum, a) => {
      const price = a.value || priceMap[a.patientWhatsapp] || 0;
      return sum + Number(price);
    }, 0);

  // Ticket médio
  const confirmedCount = appointments.filter(a => 
    isStatusInGroup(a.status, 'CONFIRMED')
  ).length;
  
  const averageTicket = confirmedCount > 0 
    ? (totalRevenue / confirmedCount).toFixed(2) 
    : "0.00";

  return {
    totalAppointments,
    totalRevenue,
    averageTicket,
  };
};

/**
 * Calcula resumo por status
 * ✅ Agrupa appointments em CONFIRMED, PENDING e CANCELLED
 */
export const calculateStatusSummary = (appointments) => {
  if (!Array.isArray(appointments)) {
    return {
      confirmed: 0,
      pending: 0,
      cancelled: 0,
    };
  }

  const confirmed = appointments.filter(a => 
    isStatusInGroup(a.status, 'CONFIRMED')
  ).length;

  const pending = appointments.filter(a => 
    isStatusInGroup(a.status, 'PENDING')
  ).length;

  const cancelled = appointments.filter(a => 
    a.status === APPOINTMENT_STATUS.CANCELLED
  ).length;

  return {
    confirmed,
    pending,
    cancelled,
  };
};