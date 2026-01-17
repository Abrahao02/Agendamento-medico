// ============================================
// 📁 src/utils/message/generateWhatsappMessage.js
// ============================================

/**
 * Gera mensagem formatada para WhatsApp
 * @param {Object} config - Configurações da mensagem
 * @param {string} config.intro - Introdução (ex: "Olá")
 * @param {string} config.body - Corpo principal
 * @param {string} config.footer - Rodapé
 * @param {string} config.patientName - Nome do paciente
 * @param {string} config.date - Data (DD/MM/YYYY)
 * @param {string} config.time - Horário (HH:mm)
 * @param {number} config.value - Valor da consulta
 * @param {boolean} config.showValue - Mostrar valor na mensagem
 * @returns {string} Mensagem formatada
 * 
 * @example
 * generateWhatsappMessage({
 *   intro: "Olá",
 *   body: "Sua sessão está agendada",
 *   footer: "Nos vemos em breve",
 *   patientName: "João",
 *   date: "15/01/2026",
 *   time: "14:00",
 *   value: 150,
 *   showValue: true
 * })
 * // "Olá João,
 * //  
 * //  Sua sessão está agendada
 * //  
 * //  Data: 15/01/2026
 * //  Horário: 14:00
 * //  Valor: R$ 150
 * //  
 * //  Nos vemos em breve"
 */
export function generateWhatsappMessage({
  intro = "Olá",
  body = "Sua sessão está agendada",
  footer = "",
  patientName = "",
  date = "",
  time = "",
  value = 0,
  showValue = true
}) {
  let message = "";
  
  // Introdução
  if (intro) {
    // Remove vírgula do final do intro se houver
    const cleanIntro = intro.trim().replace(/,\s*$/, '');
    message += patientName ? `${cleanIntro} ${patientName},` : cleanIntro;
    message += "\n\n";
  }
  
  // Corpo
  if (body) {
    message += `${body}\n\n`;
  }
  
  // Detalhes
  if (date) message += `Data: ${date}\n`;
  if (time) message += `Horário: ${time}\n`;
  if (showValue && (value !== null && value !== undefined && value !== '')) {
    const formattedValue = typeof value === 'number' ? value.toFixed(2).replace('.', ',') : value;
    message += `Valor: R$ ${formattedValue}\n`;
  }
  
  // Rodapé - apenas uma quebra de linha se houver conteúdo antes
  if (footer) {
    // Remove quebra de linha extra se não houver valor
    const hasDetails = date || time || (showValue && value);
    message += hasDetails ? `\n${footer}` : footer;
  }
  
  return message.trim();
}