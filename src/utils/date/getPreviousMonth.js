/**
 * Calcula o mês e ano anterior
 * @param {number} month - Mês atual (1-12)
 * @param {number} year - Ano atual
 * @returns {{month: number, year: number}} Objeto com mês e ano anterior
 * @example
 * getPreviousMonth(1, 2026);
 * // ➜ { month: 12, year: 2025 }
 * 
 * getPreviousMonth(5, 2026);
 * // ➜ { month: 4, year: 2026 }
 */
export function getPreviousMonth(month, year) {
  if (month < 1 || month > 12) {
    throw new Error("Mês deve estar entre 1 e 12");
  }

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  return { month: prevMonth, year: prevYear };
}
