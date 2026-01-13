import { useState } from 'react';
import { auth } from '../../services/firebase';
import { reactivateSubscription } from '../../services/stripe/subscription.service';

export const useReactivateSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReactivate = async () => {
    const user = auth.currentUser;

    if (!user) {
      setError('Você precisa estar logado para reativar a assinatura');
      return { success: false, error: 'Usuário não autenticado' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await reactivateSubscription(user.uid);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Erro ao reativar assinatura');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    handleReactivate,
    loading,
    error,
  };
};
