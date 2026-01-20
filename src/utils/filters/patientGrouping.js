// ============================================
// 📁 src/utils/filters/patientGrouping.js
// ============================================

/**
 * Agrupa appointments por paciente (whatsapp)
 * @param {Array} appointments - Lista de appointments
 * @returns {Array} Lista de pacientes com seus appointments
 */
export const groupAppointmentsByPatient = (appointments) => {
  if (!Array.isArray(appointments)) return [];

  const patients = {};

  appointments.forEach((appointment) => {
    const whatsapp = appointment.patientWhatsapp;
    const patientName = appointment.referenceName?.trim() || appointment.patientName;

    if (!patients[whatsapp]) {
      patients[whatsapp] = {
        name: patientName,
        whatsapp,
        appointments: [],
        totalValue: 0,
        statusCounts: {},
      };
    }

    patients[whatsapp].appointments.push(appointment);
    patients[whatsapp].totalValue += appointment.value || 0;
    
    const status = appointment.status || "Pendente";
    patients[whatsapp].statusCounts[status] = 
      (patients[whatsapp].statusCounts[status] || 0) + 1;
  });

  return Object.values(patients).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};