// ============================================
// 📁 src/services/appointments/limitValidation.service.js
// Service to validate appointment limits via Firebase Functions
// ============================================

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/config';
import { logError } from '../../utils/logger/logger';

/**
 * Validate if a doctor can create a new appointment (checks monthly limit)
 * @param {string} doctorId - ID of the doctor
 * @returns {Promise<{allowed: boolean, count: number, limit: number, plan: string}>}
 */
export async function validateAppointmentLimit(doctorId) {
  try {
    const functions = getFunctions(app);
    const validateLimitFunction = httpsCallable(functions, 'validateAppointmentLimit');

    const result = await validateLimitFunction({
      doctorId,
    });

    return {
      allowed: result.data.allowed,
      count: result.data.count,
      limit: result.data.limit,
      plan: result.data.plan,
    };
  } catch (error) {
    logError('Erro ao validar limite de agendamentos:', error);
    // On error, allow creation (fail open) but log the error
    // This prevents blocking users if the function is unavailable
    return {
      allowed: true,
      count: 0,
      limit: 10,
      plan: 'free',
      error: error.message,
    };
  }
}
