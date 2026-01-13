import { useState } from 'react';
import { auth } from '../../services/firebase';
import { cancelSubscription } from '../../services/stripe/subscription.service';

export const useCancelSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = async () => {
    const user = auth.currentUser;

    if (!user) {
      setError('Você precisa estar logado para cancelar a assinatura');
      return { success: false, error: 'Usuário não autenticado' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await cancelSubscription(user.uid);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Erro ao cancelar assinatura');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    handleCancel,
    loading,
    error,
  };
};
