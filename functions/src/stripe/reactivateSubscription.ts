import { onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { updateDoctorPlan } from './helpers';

if (!admin.apps.length) {
  admin.initializeApp();
}

// Usa a nova API de params (defineSecret) - recomendado para Firebase Functions v2
let stripeSecretKey: ReturnType<typeof defineSecret> | null = null;

try {
  stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
} catch (error) {
  // Se não conseguir definir secret, usará variável de ambiente
}

// Helper para obter o valor (secret ou env)
const getStripeSecret = (): string => {
  if (stripeSecretKey) {
    try {
      return stripeSecretKey.value();
    } catch {
      // Se secret não estiver disponível, usa env
    }
  }
  return process.env.STRIPE_SECRET_KEY || '';
};

export const reactivateSubscription = onCall(
  {
    cors: true,
    maxInstances: 10,
    secrets: stripeSecretKey ? [stripeSecretKey] : [],
  },
  async (request) => {
    // Inicializa Stripe com o segredo (secret ou env)
    const stripe = new Stripe(getStripeSecret(), {
      apiVersion: '2025-12-15.clover',
    });

    try {
      const { userId } = request.data;

      if (!userId) {
        throw new Error('userId é obrigatório');
      }

      // Buscar dados do médico
      const db = admin.firestore();
      const doctorDoc = await db.collection('doctors').doc(userId).get();

      if (!doctorDoc.exists) {
        throw new Error('Médico não encontrado');
      }

      const subscriptionId = doctorDoc.data()?.stripeSubscriptionId;

      if (!subscriptionId) {
        throw new Error('Assinatura não encontrada');
      }

      // Reativar assinatura no Stripe (remove cancel_at_period_end)
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      // Atualizar status no Firestore
      await updateDoctorPlan(userId, {
        stripeSubscriptionStatus: subscription.status,
        subscriptionCancelAt: null, // Remove data de cancelamento
      });

      logger.info('Assinatura reativada', { userId, subscriptionId });

      return {
        success: true,
        message: 'Assinatura reativada com sucesso!',
      };
    } catch (error: any) {
      logger.error('Erro ao reativar assinatura', {
        message: error.message,
        userId: request.data?.userId,
      });
      throw new Error(error.message || 'Erro ao reativar assinatura');
    }
  }
);
