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

    // Build request payload - only include optional fields if they have values
    const requestData = {
      doctorSlug: data.doctorSlug,
      date: data.date,
      time: data.time,
      patientName: data.patientName,
      patientWhatsapp: data.patientWhatsapp,
    };

    // Only add appointmentType if it has a value
    if (data.appointmentType) {
      requestData.appointmentType = data.appointmentType;
    }

    // Only add location if it has a value
    if (data.location) {
      requestData.location = data.location;
    }

    const result = await createPublicAppointmentFunction(requestData);

    if (result.data?.success) {
      return {
        success: true,
        appointmentId: result.data.appointmentId,
        message: result.data.message,
        value: result.data.value || 0,
      };
    } else {
      return {
        success: false,
        error: result.data?.error || 'Erro ao criar agendamento',
      };
    }
  } catch (error) {
    // Handle Firebase Function errors
    // Firebase Functions v2 returns errors in error.details or error.message
    let errorMessage = 'Erro ao criar agendamento. Tente novamente.';
    
    if (error.details) {
      // Error from Cloud Function
      errorMessage = error.details.message || error.details.error || error.message || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.code) {
      // Firebase error codes
      errorMessage = `Erro ${error.code}: ${error.message || errorMessage}`;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}
