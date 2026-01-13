import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { updateDoctorPlan, getUserIdFromEvent, getSubscriptionId } from './helpers';

if (!admin.apps.length) {
  admin.initializeApp();
}

// Usa a nova API de params (defineSecret) - recomendado para Firebase Functions v2
// Configure usando: firebase functions:secrets:set STRIPE_SECRET_KEY
// OU configure variáveis de ambiente: STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET
// Se usar variáveis de ambiente, não precisa incluir nos secrets do onRequest
let stripeSecretKey: ReturnType<typeof defineSecret> | null = null;
let webhookSecretKey: ReturnType<typeof defineSecret> | null = null;

try {
  stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
  webhookSecretKey = defineSecret('STRIPE_WEBHOOK_SECRET');
} catch (error) {
  // Se não conseguir definir secrets, usará variáveis de ambiente
  logger.warn('Secrets não configurados, usando variáveis de ambiente como fallback');
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

const getWebhookSecret = (): string => {
  if (webhookSecretKey) {
    try {
      return webhookSecretKey.value();
    } catch {
      // Se secret não estiver disponível, usa env
    }
  }
  return process.env.STRIPE_WEBHOOK_SECRET || '';
};

export const stripeWebhook = onRequest(
  {
    cors: true,
    maxInstances: 10,
    secrets: stripeSecretKey && webhookSecretKey 
      ? [stripeSecretKey, webhookSecretKey] 
      : [], // Só inclui secrets se estiverem configurados
  },
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      logger.error('Stripe signature não encontrada');
      res.status(400).send('Stripe signature não encontrada');
      return;
    }

    // Inicializa Stripe com o segredo (secret ou env)
    const stripe = new Stripe(getStripeSecret(), {
      apiVersion: '2025-12-15.clover',
    });

    let event: Stripe.Event;

    try {
      // Simplificado: usar rawBody (padrão Firebase Functions v2) com fallback mínimo
      let bodyString: string;
      
      if ((req as any).rawBody) {
        const rawBody = (req as any).rawBody;
        bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
      } else if (typeof req.body === 'string') {
        bodyString = req.body;
      } else if (Buffer.isBuffer(req.body)) {
        bodyString = req.body.toString('utf8');
      } else {
        throw new Error('Body não disponível em formato raw. Verifique configuração do webhook.');
      }
      
      event = stripe.webhooks.constructEvent(bodyString, sig, getWebhookSecret());
    } catch (err: any) {
      logger.error('Erro ao verificar webhook', { message: err.message });
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    logger.info('Webhook recebido', { type: event.type });

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = getUserIdFromEvent(session);

          if (userId && session.subscription) {
            const subscriptionId = getSubscriptionId(session.subscription);

            await updateDoctorPlan(userId, {
              plan: 'pro',
              stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
              stripeSubscriptionId: subscriptionId,
              stripeSubscriptionStatus: 'active',
            });
          } else {
            logger.warn('userId ou subscription não encontrado', {
              userId: !!userId,
              hasSubscription: !!session.subscription,
            });
          }
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = getUserIdFromEvent(subscription);

          if (userId) {
            const updateData: any = {
              stripeSubscriptionId: subscription.id,
              stripeSubscriptionStatus: subscription.status,
            };

            // Se está cancelado no final do período, manter como PRO até o cancelamento
            if (subscription.cancel_at_period_end) {
              updateData.plan = 'pro';
              updateData.subscriptionCancelAt = subscription.cancel_at
                ? admin.firestore.Timestamp.fromMillis(subscription.cancel_at * 1000)
                : null;
            } else if (subscription.status === 'active') {
              updateData.plan = 'pro';
            } else {
              updateData.plan = 'free';
            }

            await updateDoctorPlan(userId, updateData);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = getUserIdFromEvent(subscription);

          if (userId) {
            await updateDoctorPlan(userId, {
              plan: 'free',
              stripeSubscriptionId: null,
              stripeSubscriptionStatus: 'canceled',
              subscriptionCancelAt: null,
            });
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionId = getSubscriptionId((invoice as any).subscription);

          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const userId = getUserIdFromEvent(subscription);

            if (userId) {
              await updateDoctorPlan(userId, {
                plan: 'pro',
                lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
                stripeSubscriptionStatus: subscription.status,
              });
            }
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionId = getSubscriptionId((invoice as any).subscription);

          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const userId = getUserIdFromEvent(subscription);

            if (userId) {
              logger.warn('Pagamento falhou', { userId, invoiceId: invoice.id });
            }
          }
          break;
        }

        default:
          // Eventos não tratados são ignorados silenciosamente
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      logger.error('Erro ao processar webhook', error);
      res.status(500).send('Erro ao processar webhook');
    }
  }
);
