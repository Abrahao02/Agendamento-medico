// ============================================
// 📁 src/utils/whatsapp/validateWhatsappLength.js
// ============================================

/**
 * Valida se o WhatsApp tem comprimento válido (10-11 dígitos)
 * @param {string} whatsapp - Número apenas com dígitos
 * @returns {Object} { valid: boolean, length: number, message?: string }
 * 
 * @example
 * validateWhatsappLength("11987654321")
 * // { valid: true, length: 11 }
 * 
 * validateWhatsappLength("123456789")
 * // { valid: false, length: 9, message: "WhatsApp inválido..." }
 */
export function validateWhatsappLength(whatsapp) {
  const length = whatsapp.length;
  
  if (length < 10 || length > 11) {
    return {
      valid: false,
      length,
      message: "WhatsApp inválido. Digite DDD + número (10 a 11 dígitos)."
    };
  }
  
  return { valid: true, length };
}