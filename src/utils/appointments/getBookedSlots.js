// ============================================
// 📁 src/utils/appointments/getBookedSlots.js
// ============================================

/**
 * Retorna horários já agendados em uma data específica
 * @param {Array} appointments - Lista de appointments
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {Array<string>} Horários agendados (ordenados)
 * 
 * @example
 * const appointments = [
 *   { date: "2026-01-15", time: "08:00" },
 *   { date: "2026-01-15", time: "09:00" },
 *   { date: "2026-01-16", time: "10:00" }
 * ];
 * 
 * getBookedSlotsForDate(appointments, "2026-01-15")
 * // ["08:00", "09:00"]
 * 
 * getBookedSlotsForDate(appointments, "2026-01-17")
 * // []
 */
export function getBookedSlotsForDate(appointments, date) {
  if (!Array.isArray(appointments)) return [];
  
  return appointments
    .filter(apt => apt.date === date && apt.time)
    .map(apt => apt.time)
    .sort();
}