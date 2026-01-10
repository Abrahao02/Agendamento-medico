// ============================================
// 📁 src/utils/validators/formValidation.js
// ============================================

import { cleanWhatsapp } from "../whatsapp/cleanWhatsapp";
import { validateWhatsappLength } from "../whatsapp/validateWhatsappLength";

/**
 * Valida campo de formulário com múltiplas regras
 * @param {string} field - Nome do campo
 * @param {any} value - Valor do campo
 * @param {Object} rules - Regras de validação
 * @returns {Object} { valid: boolean, error?: string }
 * 
 * @example
 * // Nome obrigatório
 * validateFormField("name", "", { required: true })
 * // { valid: false, error: "Name é obrigatório." }
 * 
 * // Email válido
 * validateFormField("email", "user@example.com", { required: true, email: true })
 * // { valid: true }
 * 
 * // WhatsApp
 * validateFormField("whatsapp", "11987654321", { required: true, whatsapp: true })
 * // { valid: true }
 * 
 * // Senhas iguais
 * validateFormField("confirmPassword", "123", { 
 *   required: true, 
 *   match: { value: "456", message: "As senhas não coincidem." }
 * })
 * // { valid: false, error: "As senhas não coincidem." }
 */
export function validateFormField(field, value, rules = {}) {
  const {
    required = false,
    email = false,
    whatsapp = false,
    match = null,
    minLength = null,
    maxLength = null,
    pattern = null,
    custom = null
  } = rules;

  // Required
  if (required) {
    if (!value || (typeof value === "string" && !value.trim())) {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
      return { valid: false, error: `${fieldName} é obrigatório.` };
    }
  }

  // Se não for obrigatório e estiver vazio, é válido
  if (!value && !required) {
    return { valid: true };
  }

  // Email
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, error: "Email inválido." };
    }
  }

  // WhatsApp
  if (whatsapp) {
    const cleaned = cleanWhatsapp(value);
    const validation = validateWhatsappLength(cleaned);
    if (!validation.valid) {
      return { valid: false, error: validation.message };
    }
  }

  // Match (para confirmação de senha)
  if (match) {
    if (value !== match.value) {
      return { 
        valid: false, 
        error: match.message || "Os valores não coincidem." 
      };
    }
  }

  // Min Length
  if (minLength && value.length < minLength) {
    return { 
      valid: false, 
      error: `Mínimo de ${minLength} caracteres.` 
    };
  }

  // Max Length
  if (maxLength && value.length > maxLength) {
    return { 
      valid: false, 
      error: `Máximo de ${maxLength} caracteres.` 
    };
  }

  // Pattern
  if (pattern && !pattern.test(value)) {
    return { 
      valid: false, 
      error: "Formato inválido." 
    };
  }

  // Custom validator
  if (custom && typeof custom === "function") {
    const result = custom(value);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}