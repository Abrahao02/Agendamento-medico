import { onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';

// Usa a nova API de params (defineSecret) - recomendado para Firebase Functions v2
// Configure usando: firebase functions:secrets:set STRIPE_SECRET_KEY
// OU configure variável de ambiente: STRIPE_SECRET_KEY
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

export const createCheckoutSession = onCall(
  {
    cors: true,
    maxInstances: 10,
    secrets: stripeSecretKey ? [stripeSecretKey] : [], // Só inclui secret se estiver configurado
  },
  async (request) => {
    // Inicializa Stripe com o segredo (secret ou env)
    const stripe = new Stripe(getStripeSecret(), {
      apiVersion: '2025-12-15.clover',
    });
    try {
      const { userId, userEmail, priceId, successUrl, cancelUrl } = request.data;

      if (!userId || !userEmail || !priceId) {
        throw new Error('Dados incompletos: userId, userEmail e priceId são obrigatórios');
      }

      const origin = request.rawRequest?.headers?.origin || 'http://localhost:5173';
      
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: userEmail,
        client_reference_id: userId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl || `${origin}/settings?success=true`,
        cancel_url: cancelUrl || `${origin}/settings?canceled=true`,
        metadata: {
          userId,
        },
      });

      if (!session.url) {
        throw new Error('URL de checkout não foi gerada pelo Stripe');
      }

      logger.info('Sessão de checkout criada', { sessionId: session.id, userId });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error: any) {
      logger.error('Erro ao criar sessão de checkout', {
        message: error.message,
        userId: request.data?.userId,
      });
      throw new Error(error.message || 'Erro ao criar sessão de checkout');
    }
  }
);
