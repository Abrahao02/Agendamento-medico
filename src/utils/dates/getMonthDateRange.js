// ============================================
// 📁 src/utils/dates/getMonthDateRange.js
// ============================================

/**
 * Retorna o range de datas de um mês específico
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano
 * @returns {Object} { startDate: string, endDate: string }
 * 
 * @example
 * getMonthDateRange(1, 2026)
 * // { startDate: "2026-01-01", endDate: "2026-01-31" }
 * 
 * getMonthDateRange(2, 2024)  // Ano bissexto
 * // { startDate: "2024-02-01", endDate: "2024-02-29" }
 */
export function getMonthDateRange(month, year) {
  // Primeiro dia do mês
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  
  // Último dia do mês (Date com dia 0 = último dia do mês anterior)
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  
  return { startDate, endDate };
}