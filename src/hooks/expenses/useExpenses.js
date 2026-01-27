// ============================================
// 📁 src/hooks/expenses/useExpenses.js
// Hook para gerenciar gastos com real-time sync
// ============================================

import { useState, useEffect } from "react";
import { subscribeToExpenses } from "../../services/firebase/expenses.service";

/**
 * Hook para carregar e sincronizar gastos do médico em tempo real
 * @param {string} doctorId - ID do médico autenticado
 * @returns {{ expenses: Array, loading: boolean, error: string|null }}
 */
export function useExpenses(doctorId) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToExpenses(doctorId, (result) => {
      if (result.success) {
        setExpenses(result.data || []);
        setError(null);
      } else {
        setError(result.error || "Erro ao carregar gastos");
        setExpenses([]);
      }
      setLoading(false);
    });

    // Cleanup: unsubscribe when component unmounts or doctorId changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [doctorId]);

  return { expenses, loading, error };
}
