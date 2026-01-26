// ============================================
// 📁 src/components/agenda/AgendaActionsModal/AgendaActionsModal.jsx
// Modal com opções para marcar consulta ou adicionar horário
// ============================================
import { createPortal } from 'react-dom';
import React from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { useModal } from '../../../hooks/common/useModal';
import './AgendaActionsModal.css';

export default function AgendaActionsModal({
  isOpen,
  onClose,
  onSelectBook,
  onSelectAddSlot,
  isLimitReached = false,
}) {
  const { handleBackdropClick, handleKeyDown } = useModal(isOpen, onClose);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="agenda-actions-modal__overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="agenda-actions-modal-title"
    >
      <div className="agenda-actions-modal__container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="agenda-actions-modal__header">
          <button
            className="agenda-actions-modal__close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X />
          </button>

          <h2 id="agenda-actions-modal-title" className="agenda-actions-modal__title">
            Nova Ação
          </h2>
        </div>

        {/* Body - Opções */}
        <div className="agenda-actions-modal__body">
          <button
            type="button"
            className="agenda-actions-modal__option"
            onClick={() => {
              onSelectBook();
              onClose();
            }}
            disabled={isLimitReached}
            title={isLimitReached ? "Limite do plano atingido" : "Marcar uma nova consulta"}
          >
            <div className="agenda-actions-modal__option-icon">
              <Calendar size={24} />
            </div>
            <div className="agenda-actions-modal__option-content">
              <h3>Marcar Consulta</h3>
              <p>Agendar uma consulta para este dia</p>
            </div>
          </button>

          <button
            type="button"
            className="agenda-actions-modal__option"
            onClick={() => {
              onSelectAddSlot();
              onClose();
            }}
            disabled={isLimitReached}
            title={isLimitReached ? "Limite do plano atingido" : "Adicionar um novo horário disponível"}
          >
            <div className="agenda-actions-modal__option-icon">
              <Clock size={24} />
            </div>
            <div className="agenda-actions-modal__option-content">
              <h3>Adicionar Horário Disponível</h3>
              <p>Criar um novo horário de disponibilidade</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
