import { loadStripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../../services/firebase/config';
import { STRIPE_CONFIG } from './stripe.config';

let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise && STRIPE_CONFIG.publishableKey) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  return stripePromise;
};

export const createCheckoutSession = async (userId, userEmail) => {
  try {
    const functions = getFunctions(app);
    const createCheckoutSessionFunction = httpsCallable(functions, 'createCheckoutSession');

    const result = await createCheckoutSessionFunction({
      userId,
      userEmail,
      priceId: STRIPE_CONFIG.priceId,
      successUrl: STRIPE_CONFIG.successUrl,
      cancelUrl: STRIPE_CONFIG.cancelUrl,
    });

    console.log('Resultado completo da função:', result);
    console.log('Dados retornados:', result.data);
    console.log('URL disponível?', !!result.data?.url);

    if (!result.data?.url) {
      console.error('URL não retornada pela função!', result.data);
      throw new Error('URL de checkout não foi retornada pela função');
    }

    return {
      sessionId: result.data.sessionId,
      url: result.data.url,
    };
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    throw new Error(error.message || 'Erro ao criar sessão de checkout');
  }
};

export const redirectToCheckout = async (checkoutData) => {
  if (!checkoutData || !checkoutData.url) {
    throw new Error('URL de checkout não disponível');
  }

  // Redireciona diretamente para a URL da sessão de checkout
  window.location.href = checkoutData.url;
};
