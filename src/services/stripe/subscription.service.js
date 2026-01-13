import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/config';

/**
 * Cancela a assinatura do usuário
 * A assinatura será cancelada no final do período pago
 * @param {string} userId - ID do usuário
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const cancelSubscription = async (userId) => {
  try {
    const functions = getFunctions(app);
    const cancelSubscriptionFunction = httpsCallable(functions, 'cancelSubscription');

    const result = await cancelSubscriptionFunction({
      userId,
    });

    if (result.data.success) {
      return { success: true, message: result.data.message };
    } else {
      return { success: false, error: result.data.error };
    }
  } catch (error) {
    return { success: false, error: error.message || 'Erro ao cancelar assinatura' };
  }
};

/**
 * Reativa a assinatura do usuário
 * Remove o cancelamento agendado e mantém a assinatura ativa
 * @param {string} userId - ID do usuário
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const reactivateSubscription = async (userId) => {
  try {
    const functions = getFunctions(app);
    const reactivateSubscriptionFunction = httpsCallable(functions, 'reactivateSubscription');

    const result = await reactivateSubscriptionFunction({
      userId,
    });

    if (result.data.success) {
      return { success: true, message: result.data.message };
    } else {
      return { success: false, error: result.data.error };
    }
  } catch (error) {
    return { success: false, error: error.message || 'Erro ao reativar assinatura' };
  }
};
