import { useState } from 'react';
import { createCheckoutSession, redirectToCheckout } from '../../services/stripe/stripe.service';
import { auth } from '../../services/firebase';

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    const user = auth.currentUser;
    
    if (!user) {
      setError('Você precisa estar logado para assinar o plano PRO');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkoutData = await createCheckoutSession(user.uid, user.email);
      await redirectToCheckout(checkoutData);
    } catch (err) {
      setError(err.message || 'Erro ao processar checkout');
      console.error('Erro no checkout:', err);
      setLoading(false);
    }
  };

  return {
    handleCheckout,
    loading,
    error,
  };
};
