// ============================================
// 📁 src/utils/appointments/hasConflict.js
// ============================================

/**
 * Verifica se já existe um agendamento no horário
 * @param {Array} appointments - Lista de appointments
 * @param {string} date - Data no formato YYYY-MM-DD
 * @param {string} time - Horário no formato HH:mm
 * @returns {boolean} true se existe conflito
 * 
 * @example
 * const appointments = [
 *   { date: "2026-01-15", time: "08:00" }
 * ];
 * 
 * hasAppointmentConflict(appointments, "2026-01-15", "08:00")
 * // true
 * 
 * hasAppointmentConflict(appointments, "2026-01-15", "09:00")
 * // false
 */
export function hasAppointmentConflict(appointments, date, time) {
  if (!Array.isArray(appointments)) return false;
  
  return appointments.some(
    apt => apt.date === date && apt.time === time
  );
}