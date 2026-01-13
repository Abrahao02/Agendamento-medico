export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  priceId: import.meta.env.VITE_STRIPE_PRICE_ID || '', // Price ID do produto PRO
  successUrl: `${window.location.origin}/settings?success=true`,
  cancelUrl: `${window.location.origin}/settings?canceled=true`,
  
};

export const STRIPE_PLAN = {
  name: 'Plano PRO',
  price: 49.00,
  currency: 'BRL',
  interval: 'month',
  
};
