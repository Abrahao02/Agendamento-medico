// ============================================
// 📁 src/utils/expenses/calculateExpenseStats.js
// Cálculos estatísticos de gastos
// ============================================

/**
 * Calcula estatísticas de gastos por período
 * @param {Array} expenses - Array de gastos
 * @returns {Object} { past, future, total }
 */
export function calculateExpenseStats(expenses) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const past = expenses
    .filter(expense => new Date(expense.date) < today)
    .reduce((sum, expense) => sum + Number(expense.value || 0), 0);

  const future = expenses
    .filter(expense => new Date(expense.date) >= today)
    .reduce((sum, expense) => sum + Number(expense.value || 0), 0);

  return {
    past,
    future,
    total: past + future,
  };
}

/**
 * Agrupa gastos por local
 * @param {Array} expenses - Array de gastos
 * @returns {Object} { [location]: totalValue }
 */
export function groupExpensesByLocation(expenses) {
  return expenses.reduce((acc, expense) => {
    const location = expense.location || "Sem local";
    acc[location] = (acc[location] || 0) + Number(expense.value || 0);
    return acc;
  }, {});
}

/**
 * Agrupa gastos por mês
 * @param {Array} expenses - Array de gastos
 * @returns {Array} [{ year, month, total }]
 */
export function groupExpensesByMonth(expenses) {
  const monthsMap = new Map();

  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${String(month).padStart(2, "0")}`;

    if (!monthsMap.has(key)) {
      monthsMap.set(key, { year, month, total: 0 });
    }

    const monthData = monthsMap.get(key);
    monthData.total += Number(expense.value || 0);
  });

  return Array.from(monthsMap.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}
