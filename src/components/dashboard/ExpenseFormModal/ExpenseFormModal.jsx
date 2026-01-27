// ============================================
// 📁 src/components/dashboard/ExpenseFormModal/ExpenseFormModal.jsx
// Modal para criar/editar gastos
// ============================================

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { DollarSign, X, Trash2 } from "lucide-react";
import { useExpenseForm } from "../../../hooks/expenses/useExpenseForm";
import { useModal } from "../../../hooks/common/useModal";
import "./ExpenseFormModal.css";

export default function ExpenseFormModal({
  isOpen,
  onClose,
  expense = null,
  doctorId,
  locations = [],
  onSuccess,
  onError,
}) {
  const { handleBackdropClick, handleKeyDown } = useModal(isOpen, onClose);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    formData,
    errors,
    submitting,
    updateField,
    handleSubmit,
    handleDelete,
    isEditMode,
  } = useExpenseForm({
    expense,
    doctorId,
    locations,
    onSuccess: (result) => {
      onClose();
      if (onSuccess) onSuccess(result);
    },
    onError,
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit();
  };

  const confirmDelete = async () => {
    await handleDelete();
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="expense-form-modal__overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div className="expense-form-modal__container" onClick={(e) => e.stopPropagation()}>
        <div className="expense-form-modal__header">
          <button className="expense-form-modal__close" onClick={onClose} disabled={submitting}>
            <X />
          </button>
          <div className="expense-form-modal__icon">
            <DollarSign />
          </div>
          <h2 className="expense-form-modal__title">
            {isEditMode ? "Editar Gasto" : "Novo Gasto"}
          </h2>
        </div>

        <form className="expense-form-modal__body" onSubmit={handleFormSubmit}>
          <div className="form-field">
            <label htmlFor="expense-description">
              Descrição <span className="required">*</span>
            </label>
            <input
              id="expense-description"
              type="text"
              placeholder="Ex: Aluguel, Material, Energia..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              disabled={submitting}
              required
              autoFocus
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="expense-value">
              Valor (R$) <span className="required">*</span>
            </label>
            <input
              id="expense-value"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.value}
              onChange={(e) => updateField("value", e.target.value)}
              disabled={submitting}
              required
            />
            {errors.value && <span className="field-error">{errors.value}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="expense-date">
              Data <span className="required">*</span>
            </label>
            <input
              id="expense-date"
              type="date"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              disabled={submitting}
              required
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="expense-location">
              Local <span className="required">*</span>
            </label>
            {locations.length > 1 ? (
              <select
                id="expense-location"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                disabled={submitting}
                required
              >
                <option value="">Selecione um local</option>
                {locations.map((loc) => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            ) : (
              <input
                id="expense-location"
                type="text"
                value={formData.location}
                disabled
                className="input-disabled"
              />
            )}
            {errors.location && <span className="field-error">{errors.location}</span>}
          </div>

          {errors.submit && <div className="expense-form-modal__error"><span>{errors.submit}</span></div>}
        </form>

        <div className="expense-form-modal__footer">
          {isEditMode && !showDeleteConfirm && (
            <button
              type="button"
              className="expense-form-modal__button expense-form-modal__button--delete"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={submitting}
            >
              <Trash2 size={16} />
              Deletar
            </button>
          )}

          {showDeleteConfirm ? (
            <>
              <p className="expense-form-modal__delete-confirm">
                Tem certeza que deseja deletar este gasto?
              </p>
              <div className="expense-form-modal__delete-actions">
                <button
                  type="button"
                  className="expense-form-modal__button expense-form-modal__button--cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="expense-form-modal__button expense-form-modal__button--delete-confirm"
                  onClick={confirmDelete}
                  disabled={submitting}
                >
                  {submitting ? "Deletando..." : "Confirmar Exclusão"}
                </button>
              </div>
            </>
          ) : (
            <div className="expense-form-modal__actions">
              <button
                type="button"
                className="expense-form-modal__button expense-form-modal__button--cancel"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="expense-form-modal__button expense-form-modal__button--submit"
                onClick={handleFormSubmit}
                disabled={submitting}
              >
                {submitting ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Criar Gasto"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
