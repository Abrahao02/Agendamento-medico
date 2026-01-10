// ============================================
// 📁 src/utils/dates/isDateInFuture.js
// ============================================

import { getTodayString } from "../filters/dateFilters";

/**
 * Verifica se uma data é futura ou hoje (>= hoje)
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @returns {boolean} true se >= hoje
 * 
 * @example
 * // Assumindo hoje = 2026-01-10
 * isDateInFuture("2026-01-15")  // true
 * isDateInFuture("2026-01-10")  // true (hoje é futuro)
 * isDateInFuture("2026-01-05")  // false
 */
export function isDateInFuture(dateStr) {
  if (!dateStr) return false;
  return dateStr >= getTodayString();
}