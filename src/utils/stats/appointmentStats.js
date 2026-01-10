// ============================================
// 📁 src/utils/stats/appointmentStats.js
// ============================================

/**
 * Calcula estatísticas de appointments
 * @param {Array} appointments - Lista de appointments
 * @param {Object} priceMap - Mapa de preços por whatsapp
 * @returns {Object} Estatísticas calculadas
 */
export const calculateAppointmentStats = (appointments, priceMap = {}) => {
  if (!Array.isArray(appointments)) {
    return {
      totalAppointments: 0,
      attendedAppointments: 0,
      totalRevenue: 0,
      averageTicket: 0
    };
  }

  const today = new Date();
  let revenue = 0;
  let attended = 0;

  appointments.forEach((a) => {
    const appointmentDate = new Date(a.date);
    
    if (a.status === "Confirmado" && appointmentDate <= today) {
      attended++;
      const value = a.value !== undefined 
        ? a.value 
        : priceMap[a.patientWhatsapp] || 0;
      revenue += value;
    }
  });

  const totalValue = Object.values(priceMap).reduce((sum, price) => sum + price, 0);
  const patientCount = Object.keys(priceMap).length;

  return {
    totalAppointments: appointments.length,
    attendedAppointments: attended,
    totalRevenue: revenue,
    averageTicket: patientCount ? Math.round(totalValue / patientCount) : 0
  };
};

/**
 * Calcula resumo por status
 * @param {Array} appointments - Lista de appointments
 * @returns {Object} Contagem por status
 */
export const calculateStatusSummary = (appointments) => {
  if (!Array.isArray(appointments)) return {};

  const summary = { 
    Confirmado: 0, 
    Pendente: 0, 
    "Não Compareceu": 0 
  };

  appointments.forEach((a) => {
    if (summary.hasOwnProperty(a.status)) {
      summary[a.status]++;
    }
  });

  return summary;
};