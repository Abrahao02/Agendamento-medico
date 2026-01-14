// ============================================
// 📁 src/utils/appointments/getBookedSlots.js
// ============================================

import { STATUS_GROUPS } from "../../constants/appointmentStatus";

/**
 * Retorna horários OCUPADOS em uma data específica
 * Ignora appointments cancelados e não comparecidos
 * 
 * @param {Array} appointments - Lista de appointments
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {Array<string>} Horários ocupados (ordenados)
 * 
 * @example
 * const appointments = [
 *   { date: "2026-01-15", time: "08:00", status: "Confirmado" },
 *   { date: "2026-01-15", time: "09:00", status: "Cancelado" },
 *   { date: "2026-01-15", time: "10:00", status: "Pendente" }
 * ];
 * 
 * getBookedSlotsForDate(appointments, "2026-01-15")
 * // ["08:00", "10:00"] - "09:00" não aparece pois está cancelado
 */
export function getBookedSlotsForDate(appointments, date) {
  if (!Array.isArray(appointments)) return [];
  
  return appointments
    .filter(apt => 
      apt.date === date && 
      apt.time &&
      STATUS_GROUPS.ACTIVE.includes(apt.status)
    )
    .map(apt => apt.time)
    .sort();
}