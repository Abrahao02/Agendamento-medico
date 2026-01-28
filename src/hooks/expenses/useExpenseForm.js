// ============================================
// 📁 src/hooks/expenses/useExpenseForm.js
// Hook para gerenciar formulário de gastos
// ============================================

import { useState, useCallback } from "react";
import { createExpense, updateExpense, deleteExpense } from "../../services/firebase/expenses.service";
import { formatDateToQuery } from "../../utils/filters/dateFilters";

/**
 * Hook para gerenciar estado e validação do formulário de gastos
 * @param {Object} options - { expense, doctorId, locations, onSuccess, onError }
 * @returns {Object} Form state and handlers
 */
export function useExpenseForm({ expense = null, doctorId, locations = [], onSuccess, onError }) {
  // Determinar local padrão
  const defaultLocation = locations.length === 1 ? locations[0].name : "";
  
  const [formData, setFormData] = useState({
    description: expense?.description || "",
    value: expense?.value?.toString() || "",
    date: expense?.date || formatDateToQuery(new Date()),
    location: expense?.location || defaultLocation,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Validação
  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.description || formData.description.trim().length === 0) {
      newErrors.description = "Descrição é obrigatória";
    }

    const valueNumber = Number(formData.value);
    if (!formData.value || isNaN(valueNumber) || valueNumber < 0) {
      newErrors.value = "Valor deve ser um número maior ou igual a zero";
    }

    if (!formData.date) {
      newErrors.date = "Data é obrigatória";
    }

    if (!formData.location || formData.location.trim().length === 0) {
      newErrors.location = "Local é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Atualizar campo
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Submit (create ou update)
  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      return;
    }

    setSubmitting(true);

    const expenseData = {
      doctorId,
      description: formData.description.trim(),
      value: Number(formData.value),
      date: formData.date,
      location: formData.location.trim(),
    };

    let result;
    if (expense) {
      // Update existing expense
      result = await updateExpense(expense.id, expenseData);
    } else {
      // Create new expense
      result = await createExpense(expenseData);
    }

    setSubmitting(false);

    if (result.success) {
      if (onSuccess) {
        onSuccess(result);
      }
    } else {
      if (onError) {
        onError(result.error || "Erro ao salvar gasto");
      }
      setErrors({ submit: result.error || "Erro ao salvar gasto" });
    }
  }, [expense, doctorId, formData, validate, onSuccess, onError]);

  // Delete expense
  const handleDelete = useCallback(async () => {
    if (!expense) return;

    setSubmitting(true);
    const result = await deleteExpense(expense.id);
    setSubmitting(false);

    if (result.success) {
      if (onSuccess) {
        onSuccess(result);
      }
    } else {
      if (onError) {
        onError(result.error || "Erro ao deletar gasto");
      }
    }
  }, [expense, onSuccess, onError]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      description: "",
      value: "",
      date: formatDateToQuery(new Date()),
      location: defaultLocation,
    });
    setErrors({});
  }, [defaultLocation]);

  return {
    formData,
    errors,
    submitting,
    updateField,
    handleSubmit,
    handleDelete,
    resetForm,
    isEditMode: !!expense,
  };
}
