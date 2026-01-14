/**
 * Firebase Function to validate appointment limit for Free plan users
 */

import { onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const FREE_PLAN_MONTHLY_LIMIT = 10;
const APPOINTMENT_STATUS_CONFIRMED = 'Confirmado';

/**
 * Validate if a free plan user can create a new appointment
 * Checks if they've reached the monthly limit of confirmed appointments
 */
export const validateAppointmentLimit = onCall(
  {
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { doctorId } = request.data;

      if (!doctorId) {
        throw new Error('doctorId é obrigatório');
      }

      const db = admin.firestore();

      // Get doctor's plan
      const doctorDoc = await db.collection('doctors').doc(doctorId).get();

      if (!doctorDoc.exists) {
        throw new Error('Médico não encontrado');
      }

      const doctorData = doctorDoc.data();
      const plan = doctorData?.plan || 'free';

      // PRO users have no limit
      if (plan === 'pro') {
        return {
          allowed: true,
          count: 0,
          limit: 0,
          plan: 'pro',
        };
      }

      // Calculate current month range
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;

      // Query confirmed appointments for current month
      const appointmentsSnapshot = await db
        .collection('appointments')
        .where('doctorId', '==', doctorId)
        .where('status', '==', APPOINTMENT_STATUS_CONFIRMED)
        .get();

      const appointments = appointmentsSnapshot.docs.map((doc) => doc.data());
      const confirmedThisMonth = appointments.filter(
        (appointment) =>
          appointment.date >= startDate && appointment.date <= endDate
      ).length;

      const allowed = confirmedThisMonth < FREE_PLAN_MONTHLY_LIMIT;

      logger.info('Validação de limite', {
        doctorId,
        plan,
        count: confirmedThisMonth,
        limit: FREE_PLAN_MONTHLY_LIMIT,
        allowed,
      });

      return {
        allowed,
        count: confirmedThisMonth,
        limit: FREE_PLAN_MONTHLY_LIMIT,
        plan: 'free',
      };
    } catch (error: any) {
      logger.error('Erro ao validar limite de agendamentos', {
        message: error.message,
        doctorId: request.data?.doctorId,
      });
      throw new Error(error.message || 'Erro ao validar limite de agendamentos');
    }
  }
);
