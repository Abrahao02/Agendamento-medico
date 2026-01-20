// ============================================
// 📁 src/utils/patients/createPatientsMap.js
// Utilitário para criar mapa de pacientes por WhatsApp
// ============================================

/**
 * Cria um mapa de pacientes indexado por WhatsApp para busca rápida
 * @param {Array} patients - Array de objetos paciente
 * @returns {Object} Mapa { [whatsapp]: patient }
 * 
 * @example
 * const patients = [
 *   { whatsapp: '5511999999999', name: 'João', referenceName: 'João Silva' },
 *   { whatsapp: '5511888888888', name: 'Maria', referenceName: 'Maria Santos' }
 * ];
 * const map = createPatientsMap(patients);
 * // { '5511999999999': { ... }, '5511888888888': { ... } }
 */
export function createPatientsMap(patients = []) {
  if (!Array.isArray(patients)) return {};
  
  const map = {};
  patients.forEach(patient => {
    if (patient && patient.whatsapp) {
      map[patient.whatsapp] = patient;
    }
  });
  return map;
}
