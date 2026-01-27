// ============================================
// 📁 src/utils/date/dateHelpers.js
// Helpers de data timezone-safe
// ============================================

/**
 * Parse seguro de string YYYY-MM-DD para Date local (sem timezone)
 * Evita problema de off-by-one causado por new Date(stringDate)
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @returns {Date|null} Date local ou null se inválido
 */
export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  // new Date(year, month, day) usa timezone local
  // month é 0-indexed (0 = Janeiro)
  return new Date(year, month - 1, day);
}

/**
 * Formata Date local para string YYYY-MM-DD
 * @param {Date} date - Data a formatar
 * @returns {string} String no formato YYYY-MM-DD
 */
export function formatLocalDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Compara duas datas YYYY-MM-DD considerando timezone local
 * @param {string} date1 - Primeira data
 * @param {string} date2 - Segunda data
 * @returns {number} -1 se date1 < date2, 0 se igual, 1 se date1 > date2
 */
export function compareDates(date1, date2) {
  if (!date1 || !date2) return 0;

  // Comparação lexicográfica é segura para YYYY-MM-DD
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}

/**
 * Obtém o primeiro dia do mês
 * @param {number} year - Ano
 * @param {number} month - Mês (1-12)
 * @returns {Date} Primeiro dia do mês
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1);
}

/**
 * Obtém o último dia do mês
 * @param {number} year - Ano
 * @param {number} month - Mês (1-12)
 * @returns {Date} Último dia do mês
 */
export function getLastDayOfMonth(year, month) {
  // new Date(year, month, 0) retorna último dia do mês anterior (month - 1)
  return new Date(year, month, 0);
}

/**
 * Obtém a data de hoje no formato YYYY-MM-DD (timezone local)
 * @returns {string} Data de hoje
 */
export function getTodayLocal() {
  return formatLocalDate(new Date());
}

/**
 * Verifica se uma data está dentro de um range (comparação de strings)
 * @param {string} date - Data a verificar
 * @param {string} startDate - Data inicial
 * @param {string} endDate - Data final
 * @returns {boolean}
 */
export function isDateInRange(date, startDate, endDate) {
  if (!date) return false;
  if (!startDate || !endDate) return true;

  return date >= startDate && date <= endDate;
}

/**
 * Verifica se uma data é futura (>= hoje)
 * @param {string} dateStr - Data a verificar (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const today = getTodayLocal();
  return dateStr >= today;
}

/**
 * Verifica se uma data é passada (< hoje)
 * @param {string} dateStr - Data a verificar (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isPastDate(dateStr) {
  if (!dateStr) return false;
  const today = getTodayLocal();
  return dateStr < today;
}
