// ============================================
// 📁 src/utils/helpers/yearHelpers.js
// ============================================

/**
 * Gera lista de anos disponíveis (ano atual ± range)
 * @param {number} range - Quantos anos antes e depois
 * @returns {Array<number>} Lista de anos em ordem decrescente
 */
export const generateYearRange = (range = 1) => {
  const currentYear = new Date().getFullYear();
  const years = new Set();

  for (let i = -range; i <= range; i++) {
    years.add(currentYear + i);
  }

  return Array.from(years).sort((a, b) => b - a);
};