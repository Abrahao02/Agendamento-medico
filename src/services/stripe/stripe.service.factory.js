// ============================================
// 📁 src/services/stripe/stripe.service.factory.js
// Factory para criar stripe service com injeção de dependências (DIP)
// ============================================

import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from './stripe.config';
import { log, logError } from '../../utils/logger/logger';

let stripePromise = null;

/**
 * Cria um serviço de Stripe com injeção de dependências
 * @param {Object} dependencies - Dependências injetadas
 * @param {Object} dependencies.functions - Serviço de functions
 * @returns {Object} Serviço de Stripe
 */
export const createStripeService = ({ functions }) => {
  const getStripe = () => {
    if (!stripePromise && STRIPE_CONFIG.publishableKey) {
      stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
    }
    return stripePromise;
  };

  const createCheckoutSession = async (userId, userEmail) => {
    try {
      const result = await functions.call('createCheckoutSession', {
        userId,
        userEmail,
        priceId: STRIPE_CONFIG.priceId,
        successUrl: STRIPE_CONFIG.successUrl,
        cancelUrl: STRIPE_CONFIG.cancelUrl,
      });

      log('Resultado completo da função:', result);
      log('Dados retornados:', result.data);
      log('URL disponível?', !!result.data?.url);

      if (!result.data?.url) {
        logError('URL não retornada pela função!', result.data);
        throw new Error('URL de checkout não foi retornada pela função');
      }

      return {
        sessionId: result.data.sessionId,
        url: result.data.url,
      };
    } catch (error) {
      logError('Erro ao criar sessão de checkout:', error);
      throw new Error(error.message || 'Erro ao criar sessão de checkout');
    }
  };

  const redirectToCheckout = async (checkoutData) => {
    if (!checkoutData || !checkoutData.url) {
      throw new Error('URL de checkout não disponível');
    }

    // Redireciona diretamente para a URL da sessão de checkout
    window.location.href = checkoutData.url;
  };

  return {
    getStripe,
    createCheckoutSession,
    redirectToCheckout,
  };
};
