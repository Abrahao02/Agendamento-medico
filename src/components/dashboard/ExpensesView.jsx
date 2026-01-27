import React, { useState } from "react";
import { Plus, Edit } from "lucide-react";
import { auth } from "../../services/firebase";

import ExpenseFormModal from "./ExpenseFormModal/ExpenseFormModal";
import { formatCurrency } from "../../utils/formatter/formatCurrency";
import { parseLocalDate } from "../../utils/date/dateHelpers";
import Filters from "../common/Filters";

import "./ExpensesView.css";

export default function ExpensesView({
  expenses: propExpenses = [],
  availableLocations = [],
  selectedDateFrom,
  selectedDateTo,
  selectedLocation,
  setSelectedDateFrom,
  setSelectedDateTo,
  setSelectedMonth,
  setSelectedYear,
  setSelectedLocation,
  resetFilters,
}) {
  const user = auth.currentUser;
  const expenses = propExpenses;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const handleNew = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const total = expenses.reduce(
    (sum, exp) => sum + Number(exp.value || 0),
    0
  );

  return (
    <div className="expenses-view">
      <div className="expenses-header">
        <h2>Gastos (Despesas)</h2>
        <button className="btn-new-expense" onClick={handleNew}>
          <Plus size={20} />
          Novo Gasto
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum gasto cadastrado</p>
          <button onClick={handleNew}>Cadastrar primeiro gasto</button>
        </div>
      ) : (
        <>
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Local</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    {parseLocalDate(expense.date)?.toLocaleDateString("pt-BR") || expense.date}
                  </td>
                  <td>{expense.description}</td>
                  <td>{expense.location || "Sem local"}</td>
                  <td>{formatCurrency(expense.value)}</td>
                  <td>
                    <button onClick={() => handleEdit(expense)}>
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="expenses-total">
            <strong>Total de Gastos:</strong>{" "}
            {formatCurrency(total)}
          </div>
        </>
      )}

      {isModalOpen && (
        <ExpenseFormModal
          isOpen={isModalOpen}
          onClose={handleClose}
          expense={selectedExpense}
          doctorId={user?.uid}
          locations={availableLocations}
        />
      )}
    </div>
  );
}
