// ============================================
// 📁 src/utils/whatsapp/cleanWhatsapp.js
// ============================================

/**
 * Remove toda formatação do WhatsApp, retornando apenas números
 * @param {string} value - Número com ou sem formatação
 * @returns {string} Apenas números (sem limite de tamanho)
 * 
 * @example
 * cleanWhatsapp("(11) 98765-4321")  // "11987654321"
 * cleanWhatsapp("11 9 8765 4321")   // "11987654321"
 * cleanWhatsapp("abc11987xyz")      // "11987"
 */
export function cleanWhatsapp(value) {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
}