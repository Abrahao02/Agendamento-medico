import { createPortal } from 'react-dom';
import React from 'react';
import { AlertTriangle, Trash2, Ban, X } from 'lucide-react';
import './DeleteConfirmationModal.css';

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirmDelete,
  onConfirmCancel,
  patientName,
  time,
  loading = false,
}) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Always cleanup on unmount or when modal closes
    // This ensures body scroll is restored even if user navigates away
    return () => {
      document.body.style.overflow = '';
      // Alternative approach: document.body.style.removeProperty('overflow');
    };
  }, [isOpen]);

  if (!isOpen) return null;

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

  const modalContent = (
    <div 
      className="modal-overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="delete-modal">
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
            <AlertTriangle />
          </div>

          <h2 id="modal-title" className="modal-title">
            O que deseja fazer?
          </h2>

          <p className="modal-subtitle">
            Consulta de <strong>{patientName}</strong> às <strong>{time}</strong>
          </p>
        </div>

        {/* Body - Options */}
        <div className="modal-body">
          {/* Opção 1: Excluir */}
          <div 
            className="modal-option delete"
            onClick={() => !loading && onConfirmDelete()}
            role="button"
            tabIndex={0}
          >
            <div className="option-header">
              <div className="option-icon-title">
                <div className="option-icon">
                  <Trash2 />
                </div>
                <h3 className="option-title">Excluir consulta</h3>
              </div>
            </div>

            <p className="option-description">
              Ao excluir esta consulta:
            </p>

            <ul className="option-list">
              <li>O horário será liberado automaticamente</li>
              <li>O atendimento não será contabilizado como cancelamento</li>
              <li>Não será possível recuperar essas informações futuramente</li>
            </ul>
          </div>

          {/* Opção 2: Cancelar (Recomendado) */}
          <div 
            className="modal-option cancel"
            onClick={() => !loading && onConfirmCancel()}
            role="button"
            tabIndex={0}
          >
            <div className="option-header">
              <div className="option-icon-title">
                <div className="option-icon">
                  <Ban />
                </div>
                <h3 className="option-title">Marcar como cancelado</h3>
              </div>
              <span className="recommended-badge">✓ Recomendado</span>
            </div>

            <p className="option-description">
              Para manter métricas e histórico:
            </p>

            <ul className="option-list">
              <li>O horário será liberado automaticamente</li>
              <li>Será contabilizado nas estatísticas</li>
              <li>Manterá o histórico do paciente</li>
            </ul>
          </div>
        </div>

        {/* Footer - Buttons */}
        <div className="modal-footer">
          <button
            className="modal-button delete"
            onClick={onConfirmDelete}
            disabled={loading}
          >
            <Trash2 />
            {loading ? 'Excluindo...' : 'Excluir permanentemente'}
          </button>

          <button
            className="modal-button cancel"
            onClick={onConfirmCancel}
            disabled={loading}
          >
            <Ban />
            {loading ? 'Marcando...' : 'Marcar como cancelado'}
          </button>
        </div>
      </div>
    </div>
  );

  // ✨ USAR PORTAL para renderizar fora da hierarquia
  return createPortal(modalContent, document.body);
}