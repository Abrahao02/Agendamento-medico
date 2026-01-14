/**
 * Gera link do WhatsApp com número formatado e mensagem codificada
 * @param {string} phoneNumber - Número de telefone (com ou sem formatação)
 * @param {string} message - Mensagem a ser enviada
 * @returns {string} URL completa do WhatsApp
 * @example
 * generateWhatsappLink("11987654321", "Olá");
 * // ➜ "https://wa.me/5511987654321?text=Ol%C3%A1"
 * 
 * generateWhatsappLink("(11) 98765-4321", "Teste");
 * // ➜ "https://wa.me/5511987654321?text=Teste"
 */
export function generateWhatsappLink(phoneNumber, message) {
  if (!phoneNumber || !message) {
    throw new Error("phoneNumber e message são obrigatórios");
  }

  const isInternational = phoneNumber.trim().startsWith("+");
  let cleanNumber = phoneNumber.replace(/\D/g, "");

  if (!isInternational && !cleanNumber.startsWith("55")) {
    cleanNumber = "55" + cleanNumber;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Abre WhatsApp em nova aba com número e mensagem
 * @param {string} phoneNumber - Número de telefone
 * @param {string} message - Mensagem a ser enviada
 */
export function sendWhatsappMessage(phoneNumber, message) {
  const url = generateWhatsappLink(phoneNumber, message);
  window.open(url, "_blank");
}
