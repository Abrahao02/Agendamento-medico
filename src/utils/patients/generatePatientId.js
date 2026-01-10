// ============================================
// 📁 src/utils/patients/generatePatientId.js
// ============================================

import { cleanWhatsapp } from "../whatsapp/cleanWhatsapp";

/**
 * Gera ID único para paciente no formato: doctorId_whatsapp
 * @param {string} doctorId - ID do médico
 * @param {string} whatsapp - WhatsApp (com ou sem formatação)
 * @returns {string} ID único no formato "doctorId_whatsapp"
 * 
 * @example
 * generatePatientId("doc123", "(11) 98765-4321")
 * // "doc123_11987654321"
 * 
 * generatePatientId("doc123", "11 9 8765 4321")
 * // "doc123_11987654321"
 */
export function generatePatientId(doctorId, whatsapp) {
  const cleaned = cleanWhatsapp(whatsapp);
  return `${doctorId}_${cleaned}`;
}