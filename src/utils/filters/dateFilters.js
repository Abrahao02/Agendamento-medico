// ============================================
// 📁 src/utils/filters/dateFilters.js
// ============================================

/**
 * Formata uma data para o padrão YYYY-MM-DD
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data no formato YYYY-MM-DD
 */
export const formatDateToQuery = (date) => {
  if (!date || !(date instanceof Date)) return "";
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Obtém a data de hoje no formato YYYY-MM-DD
 * @returns {string} Data de hoje
 */
export const getTodayString = () => {
  return formatDateToQuery(new Date());
};

/**
 * Extrai ano e mês de uma string de data YYYY-MM-DD
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @returns {{year: number, month: number} | null}
 */
export const extractYearMonth = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;
  
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  
  return {
    year: Number(parts[0]),
    month: Number(parts[1])
  };
};

/**
 * Verifica se uma data está dentro de um range
 * @param {string} date - Data a verificar (YYYY-MM-DD)
 * @param {string} startDate - Data inicial (YYYY-MM-DD)
 * @param {string} endDate - Data final (YYYY-MM-DD)
 * @returns {boolean}
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date) return false;
  if (!startDate || !endDate) return true;
  
  return date >= startDate && date <= endDate;
};

/**
 * Verifica se uma data pertence a um mês/ano específico
 * @param {string} dateStr - Data a verificar (YYYY-MM-DD)
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano
 * @returns {boolean}
 */
export const isDateInMonthYear = (dateStr, month, year) => {
  if (!dateStr) return false;
  if (!month || !year) return true;
  
  const extracted = extractYearMonth(dateStr);
  if (!extracted) return false;
  
  return extracted.month === Number(month) && extracted.year === Number(year);
};

/**
 * Verifica se uma data é futura (>= hoje)
 * @param {string} dateStr - Data a verificar (YYYY-MM-DD)
 * @returns {boolean}
 */
export const isFutureDate = (dateStr) => {
  if (!dateStr) return false;
  return dateStr >= getTodayString();
};

/**
 * Verifica se uma data é passada (< hoje)
 * @param {string} dateStr - Data a verificar (YYYY-MM-DD)
 * @returns {boolean}
 */
export const isPastDate = (dateStr) => {
  if (!dateStr) return false;
  return dateStr < getTodayString();
};