// ============================================
// 📁 src/services/appointments/publicAppointment.service.js
// Secure public appointment creation via Cloud Function
// ============================================

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/config';

/**
 * Create public appointment via Cloud Function
 * This ensures all validation happens server-side
 * 
 * @param {Object} data - Appointment data
 * @param {string} data.doctorSlug - Doctor's public slug
 * @param {string} data.date - Date (YYYY-MM-DD)
 * @param {string} data.time - Time (HH:mm)
 * @param {string} data.patientName - Patient's full name
 * @param {string} data.patientWhatsapp - Patient's WhatsApp (with or without formatting)
 * @param {string} [data.appointmentType] - Appointment type (online/presencial)
 * @param {string} [data.location] - Location name (for presencial appointments)
 * @returns {Promise<{success: boolean, appointmentId?: string, error?: string}>}
 */
export async function createPublicAppointment(data) {
  try {
    const functions = getFunctions(app);
    const createPublicAppointmentFunction = httpsCallable(functions, 'createPublicAppointment');

    const result = await createPublicAppointmentFunction({
      doctorSlug: data.doctorSlug,
      date: data.date,
      time: data.time,
      patientName: data.patientName,
      patientWhatsapp: data.patientWhatsapp,
      appointmentType: data.appointmentType || null,
      location: data.location || null,
    });

    if (result.data?.success) {
      return {
        success: true,
        appointmentId: result.data.appointmentId,
        message: result.data.message,
      };
    } else {
      return {
        success: false,
        error: result.data?.error || 'Erro ao criar agendamento',
      };
    }
  } catch (error) {
    // Handle Firebase Function errors
    const errorMessage = error.message || 'Erro ao criar agendamento. Tente novamente.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
