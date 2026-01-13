/**
 * Helpers para operações com Stripe e Firestore
 */

import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { DoctorPlanData } from './types';

/**
 * Obtém a instância do Firestore (lazy initialization)
 */
function getDb() {
  return admin.firestore();
}

/**
 * Atualiza o plano do médico no Firestore
 */
export async function updateDoctorPlan(
  userId: string,
  data: Partial<DoctorPlanData>
): Promise<void> {
  try {
    await getDb().collection('doctors').doc(userId).update({
      ...data,
      planUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    logger.info('Plano atualizado', { userId, plan: data.plan });
  } catch (error: any) {
    logger.error('Erro ao atualizar plano', { userId, error: error.message });
    throw error;
  }
}

/**
 * Obtém o userId de um evento do Stripe
 */
export function getUserIdFromEvent(event: any): string | null {
  if (event.client_reference_id) {
    return event.client_reference_id;
  }
  if (event.metadata?.userId) {
    return event.metadata.userId;
  }
  return null;
}

/**
 * Obtém o subscriptionId de uma referência do Stripe
 */
export function getSubscriptionId(subscriptionRef: string | { id: string } | null): string | null {
  if (!subscriptionRef) return null;
  if (typeof subscriptionRef === 'string') return subscriptionRef;
  return subscriptionRef.id || null;
}
