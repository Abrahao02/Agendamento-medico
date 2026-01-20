// ============================================
// 📁 src/utils/formatter/formatCurrency.js
// ============================================

/**
 * Formata um valor numérico como moeda brasileira (R$)
 * @param {number|string} value - Valor a ser formatado
 * @returns {string} Valor formatado como "R$ X.XXX,XX"
 * 
 * @example
 * formatCurrency(180)      // "R$ 180,00"
 * formatCurrency(1500.5)   // "R$ 1.500,50"
 * formatCurrency("200")    // "R$ 200,00"
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value);
  
  if (isNaN(numValue)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}
