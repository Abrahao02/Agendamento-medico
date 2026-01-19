// ============================================
// 📁 src/utils/appointments/hasConflict.js
// ============================================

import { STATUS_GROUPS, APPOINTMENT_STATUS } from "../../constants/appointmentStatus";

/**
 * Verifica se já existe um agendamento ATIVO no horário
 * ✅ Ignora appointments cancelados e não comparecidos
 * 
 * @param {Array} appointments - Lista de appointments
 * @param {string} date - Data no formato YYYY-MM-DD
 * @param {string} time - Horário no formato HH:mm
 * @returns {boolean} true se existe conflito
 * 
 * @example
 * const appointments = [
 *   { date: "2026-01-15", time: "08:00", status: "Confirmado" },
 *   { date: "2026-01-15", time: "09:00", status: "Cancelado" }
 * ];
 * 
 * hasAppointmentConflict(appointments, "2026-01-15", "08:00")
 * // true - horário ocupado
 * 
 * hasAppointmentConflict(appointments, "2026-01-15", "09:00")
 * // false - cancelado não bloqueia
 */
export function hasAppointmentConflict(appointments, date, time) {
  if (!Array.isArray(appointments)) return false;
  
  return appointments.some(apt => 
    apt.date === date && 
    apt.time === time &&
    apt.status !== APPOINTMENT_STATUS.CANCELLED && // ✅ Exclui explicitamente "Cancelado"
    STATUS_GROUPS.ACTIVE.includes(apt.status)
  );
}