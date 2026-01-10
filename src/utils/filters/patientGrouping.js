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

  appointments.forEach((app) => {
    const whatsapp = app.patientWhatsapp;
    const patientName = app.referenceName?.trim() || app.patientName;

    if (!patients[whatsapp]) {
      patients[whatsapp] = {
        name: patientName,
        whatsapp,
        appointments: [],
        totalValue: 0,
        statusCounts: {},
      };
    }

    patients[whatsapp].appointments.push(app);
    patients[whatsapp].totalValue += app.value || 0;
    
    const status = app.status || "Pendente";
    patients[whatsapp].statusCounts[status] = 
      (patients[whatsapp].statusCounts[status] || 0) + 1;
  });

  return Object.values(patients).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};