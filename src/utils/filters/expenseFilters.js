// ============================================
// 📁 src/utils/filters/expenseFilters.js
// Funções de filtro para gastos (espelha appointmentFilters)
// ============================================

/**
 * Filtra gastos por data e local
 * @param {Array} expenses - Lista de gastos
 * @param {Object} filterOptions - { startDate, endDate, selectedLocation }
 * @returns {Array} Gastos filtrados
 */
export function filterExpenses(expenses, filterOptions = {}) {
  if (!expenses || expenses.length === 0) {
    return [];
  }

  const { startDate, endDate, selectedLocation } = filterOptions;

  return expenses.filter((expense) => {
    // Filtro por data de início (comparação direta de strings YYYY-MM-DD)
    if (startDate) {
      if (expense.date < startDate) {
        return false;
      }
    }

    // Filtro por data de fim (comparação direta de strings YYYY-MM-DD)
    if (endDate) {
      if (expense.date > endDate) {
        return false;
      }
    }

    // Filtro por local (padronizado com "all")
    if (selectedLocation && selectedLocation !== "all") {
      // Se expense não tem location, EXCLUIR quando filtro ativo
      if (!expense.location || expense.location !== selectedLocation) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Agrupa gastos por local
 * @param {Array} expenses - Lista de gastos
 * @returns {Object} { location1: total1, location2: total2, ... }
 */
export function groupByLocation(expenses) {
  if (!expenses || expenses.length === 0) {
    return {};
  }

  return expenses.reduce((acc, expense) => {
    const location = expense.location || "Sem local";
    if (!acc[location]) {
      acc[location] = 0;
    }
    acc[location] += Number(expense.value || 0);
    return acc;
  }, {});
}
