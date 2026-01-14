// ============================================
// 📁 src/components/patients/AddPatientModal/AddPatientModal.jsx
// Modal para cadastro de novo paciente
// ============================================
import { createPortal } from 'react-dom';
import React, { useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
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
  // Gerencia overflow do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fecha modal ao clicar no backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fecha modal com tecla ESC
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handler de submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="add-patient-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar modal"
            disabled={loading}
          >
            <X />
          </button>

          <div className="modal-icon">
            <UserPlus />
          </div>

          <h2 id="modal-title" className="modal-title">
            Adicionar Novo Paciente
          </h2>
        </div>

        {/* Body - Formulário */}
        <form className="modal-body" onSubmit={handleSubmit}>
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
            <div className="modal-error">
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Footer - Botões */}
        <div className="modal-footer">
          <button
            type="button"
            className="modal-button cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="modal-button submit"
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
