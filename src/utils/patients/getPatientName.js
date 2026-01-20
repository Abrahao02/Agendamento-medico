// ============================================
// 📁 src/utils/patients/getPatientName.js
// Utilitário para obter nome do paciente com fallback
// ============================================

import { DEFAULT_PATIENT_NAME } from '../../constants/formatters';

/**
 * Obtém o nome do paciente com fallback hierárquico
 * Prioridade: patientData.name > patientData.referenceName > appointment.referenceName > appointment.patientName > DEFAULT_PATIENT_NAME
 * 
 * @param {Object} options - Opções
 * @param {Object} [options.patientData] - Dados do paciente do array patients
 * @param {Object} [options.appointment] - Dados do appointment (fallback)
 * @param {string} [options.defaultName=DEFAULT_PATIENT_NAME] - Nome padrão se nenhum for encontrado
 * @returns {string} Nome do paciente
 * 
 * @example
 * const patientData = { name: 'João Silva', referenceName: 'João' };
 * const appointment = { referenceName: 'João', patientName: 'João Silva' };
 * getPatientName({ patientData, appointment });
 * // 'João Silva'
 * 
 * @example
 * // Sem patientData, usa dados do appointment
 * const appointment = { referenceName: 'Maria' };
 * getPatientName({ appointment });
 * // 'Maria'
 * 
 * @example
 * // Sem dados, retorna padrão
 * getPatientName({});
 * // DEFAULT_PATIENT_NAME
 */
export function getPatientName({ 
  patientData = null, 
  appointment = null, 
  defaultName = DEFAULT_PATIENT_NAME 
} = {}) {
  // Prioridade 1: Nome completo do paciente (mais atualizado)
  if (patientData?.name) {
    return patientData.name.trim();
  }
  
  // Prioridade 2: Nome de referência do paciente
  if (patientData?.referenceName) {
    return patientData.referenceName.trim();
  }
  
  // Prioridade 3: Nome de referência do appointment (fallback)
  if (appointment?.referenceName) {
    return appointment.referenceName.trim();
  }
  
  // Prioridade 4: Nome do appointment (fallback antigo)
  if (appointment?.patientName) {
    return appointment.patientName.trim();
  }
  
  // Prioridade 5: Nome padrão
  return defaultName;
}
