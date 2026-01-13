// ============================================
// 📁 src/utils/appointments/getStatusOptions.js
// Helper para obter opções de status para selects
// ============================================

import { APPOINTMENT_STATUS, STATUS_CONFIG } from "../../constants/appointmentStatus";

/**
 * Retorna array de opções de status para selects
 * @param {boolean} includeAll - Se deve incluir opção "Todos"
 * @returns {Array<{value: string, label: string}>}
 * 
 * @example
 * getStatusOptions()
 * // [{ value: "Confirmado", label: "Confirmado" }, ...]
 * 
 * getStatusOptions(true)
 * // [{ value: "Todos", label: "Todos" }, { value: "Confirmado", label: "Confirmado" }, ...]
 */
export function getStatusOptions(includeAll = false) {
  const options = Object.values(APPOINTMENT_STATUS).map(status => ({
    value: status,
    label: STATUS_CONFIG[status]?.label || status
  }));

  if (includeAll) {
    return [{ value: "Todos", label: "Todos" }, ...options];
  }

  return options;
}

/**
 * Retorna opções de status com cores para badges
 * @returns {Array<{value: string, label: string, color: string}>}
 * 
 * @example
 * getStatusOptionsWithColors()
 * // [{ value: "Confirmado", label: "Confirmado", color: "success" }, ...]
 */
export function getStatusOptionsWithColors() {
  return Object.values(APPOINTMENT_STATUS).map(status => ({
    value: status,
    label: STATUS_CONFIG[status]?.label || status,
    color: STATUS_CONFIG[status]?.color || "gray"
  }));
}
