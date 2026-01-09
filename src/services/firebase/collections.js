// ============================================
// collections.js
// ============================================
export const COLLECTIONS = {
  DOCTORS: "doctors",
  APPOINTMENTS: "appointments",
  AVAILABILITY: "availability",
  PATIENTS: "patients",
};

/**
 * Gera ID para availability: doctorId_date
 */
export const getAvailabilityId = (doctorId, date) => {
  return `${doctorId}_${date}`;
};

/**
 * Gera ID para patient: doctorId_whatsapp
 */
export const getPatientId = (doctorId, whatsapp) => {
  const cleanWhatsapp = whatsapp.replace(/\D/g, "");
  return `${doctorId}_${cleanWhatsapp}`;
};

/**
 * Validações de formato
 */
export const validators = {
  date: (date) => /^\d{4}-\d{2}-\d{2}$/.test(date),
  time: (time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time),
  whatsapp: (whatsapp) => /^\d{10,15}$/.test(whatsapp),
};