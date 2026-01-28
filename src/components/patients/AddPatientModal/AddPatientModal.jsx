// ============================================
// 📁 src/components/patients/AddPatientModal/AddPatientModal.jsx
// Modal para cadastro de novo paciente
// ============================================
import { createPortal } from 'react-dom';
import React from 'react';
import { UserPlus, X } from 'lucide-react';
import { useModal } from '../../../hooks/common/useModal';
import './AddPatientModal.css';

export default function AddPatientModal({
  isOpen,
  onClose,
  onSubmit,
  newPatient,
  updateNewPatientField,
  handleWhatsappChange,
  isWhatsappDuplicate,
  error,
  loading = false,
}) {
  const { handleBackdropClick, handleKeyDown } = useModal(isOpen, onClose);

  // Handler de submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="add-patient-modal__overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-patient-modal-title"
    >
      <div className="add-patient-modal__container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="add-patient-modal__header">
          <button
            className="add-patient-modal__close"
            onClick={onClose}
            aria-label="Fechar modal"
            disabled={loading}
          >
            <X />
          </button>

          <div className="add-patient-modal__icon">
            <UserPlus />
          </div>

          <h2 id="add-patient-modal-title" className="add-patient-modal__title">
            Adicionar Novo Paciente
          </h2>
        </div>

        {/* Body - Formulário */}
        <form className="add-patient-modal__body" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="patient-name">
              Nome <span className="required">*</span>
            </label>
            <input
              id="patient-name"
              type="text"
              placeholder="Nome completo"
              value={newPatient.name}
              onChange={(e) => updateNewPatientField("name", e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="patient-reference-name">Nome de Referência</label>
            <input
              id="patient-reference-name"
              type="text"
              placeholder="Nome preferido"
              value={newPatient.referenceName}
              onChange={(e) => updateNewPatientField("referenceName", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="patient-whatsapp">
              WhatsApp (DDD + número) <span className="required">*</span>
            </label>
            <input
              id="patient-whatsapp"
              type="text"
              placeholder="(21) 98765-4321"
              value={newPatient.whatsapp}
              onChange={(e) => handleWhatsappChange(e.target.value)}
              className={isWhatsappDuplicate(newPatient.whatsapp) ? "input-error" : ""}
              disabled={loading}
              required
            />
            {isWhatsappDuplicate(newPatient.whatsapp) && (
              <span className="field-error">WhatsApp já cadastrado</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="patient-price">Valor da Consulta</label>
            <input
              id="patient-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={newPatient.price}
              onChange={(e) => updateNewPatientField("price", e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="add-patient-modal__error">
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Footer - Botões */}
        <div className="add-patient-modal__footer">
          <button
            type="button"
            className="add-patient-modal__button add-patient-modal__button--cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="add-patient-modal__button add-patient-modal__button--submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar Paciente"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
