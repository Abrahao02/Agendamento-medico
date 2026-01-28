// ============================================
// 📁 src/hooks/expenses/useExpenseStats.js
// Hook para calcular estatísticas de gastos
// ============================================

import { useMemo } from "react";
import { filterExpenses, groupByLocation } from "../../utils/filters/expenseFilters";

/**
 * Hook para calcular estatísticas de gastos filtrados
 * @param {Array} expenses - Lista de gastos
 * @param {Object} filterOptions - Opções de filtro (startDate, endDate, selectedLocation)
 * @returns {Object} { total, byLocation, filtered }
 */
export function useExpenseStats(expenses, filterOptions) {
  return useMemo(() => {
    // Filtrar gastos por data e local
    const filtered = filterExpenses(expenses, filterOptions);

    // Calcular total
    const total = filtered.reduce((sum, expense) => {
      return sum + Number(expense.value || 0);
    }, 0);

    // Agrupar por local
    const byLocation = groupByLocation(filtered);

    return {
      total,
      byLocation,
      filtered,
    };
  }, [expenses, filterOptions]);
}
