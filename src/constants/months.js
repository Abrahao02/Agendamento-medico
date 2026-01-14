/**
 * Constantes de nomes de meses em português
 */

export const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

/**
 * Retorna o nome do mês em português
 * @param {number} month - Número do mês (1-12)
 * @returns {string} Nome do mês
 * @example
 * getMonthName(1); // ➜ "Janeiro"
 * getMonthName(12); // ➜ "Dezembro"
 */
export function getMonthName(month) {
  if (month < 1 || month > 12) {
    throw new Error("Mês deve estar entre 1 e 12");
  }
  return MONTH_NAMES_PT[month - 1];
}
