// ============================================
// 📁 src/utils/patients/calculatePatientStats.js
// ============================================

/**
 * Calcula estatísticas de um paciente específico
 * @param {Array} appointments - Lista de appointments
 * @param {string} whatsapp - WhatsApp do paciente
 * @returns {Object} Estatísticas do paciente
 * 
 * @example
 * const appointments = [
 *   { patientWhatsapp: "11987654321", value: 150, status: "Confirmado" },
 *   { patientWhatsapp: "11987654321", value: 150, status: "Pendente" },
 *   { patientWhatsapp: "11987654321", value: 150, status: "Confirmado" }
 * ];
 * 
 * calculatePatientStats(appointments, "11987654321")
 * // {
 * //   total: 3,
 * //   totalValue: 450,
 * //   confirmed: 2,
 * //   pending: 1,
 * //   noShow: 0
 * // }
 */
export function calculatePatientStats(appointments, whatsapp) {
  if (!Array.isArray(appointments)) {
    return {
      total: 0,
      totalValue: 0,
      confirmed: 0,
      pending: 0,
      noShow: 0
    };
  }

  const patientAppointments = appointments.filter(
    apt => apt.patientWhatsapp === whatsapp
  );

  const stats = {
    total: patientAppointments.length,
    totalValue: 0,
    confirmed: 0,
    pending: 0,
    noShow: 0
  };

  patientAppointments.forEach(apt => {
    stats.totalValue += apt.value || 0;
    
    switch(apt.status) {
      case "Confirmado":
        stats.confirmed++;
        break;
      case "Pendente":
        stats.pending++;
        break;
      case "Não Compareceu":
        stats.noShow++;
        break;
    }
  });

  return stats;
}