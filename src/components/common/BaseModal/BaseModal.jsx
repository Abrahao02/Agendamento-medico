// ============================================
// 📁 src/components/common/BaseModal/BaseModal.jsx
// Componente base reutilizável para modais
// ============================================
import { createPortal } from 'react-dom';
import React from 'react';
import { X } from 'lucide-react';
import { useModal } from '../../../hooks/common/useModal';
import './BaseModal.css';

/**
 * Componente base para modais que encapsula estrutura comum
 * @param {Object} props - Propriedades do modal
 * @param {boolean} props.isOpen - Estado de abertura do modal
 * @param {function} props.onClose - Função para fechar o modal
 * @param {string} [props.title] - Título do modal
 * @param {React.ReactNode} props.children - Conteúdo do modal
 * @param {string} [props.className=''] - Classes CSS adicionais
 * @param {boolean} [props.showCloseButton=true] - Mostrar botão de fechar
 * @param {string} [props.maxWidth='600px'] - Largura máxima do modal
 * @param {string} [props.ariaLabelledBy] - ID do elemento que rotula o modal
 * @returns {React.ReactNode|null} Modal renderizado ou null
 */
export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true,
  maxWidth = '600px',
  ariaLabelledBy,
}) {
  const { handleBackdropClick, handleKeyDown } = useModal(isOpen, onClose);

  if (!isOpen) return null;

  const modalId = ariaLabelledBy || 'base-modal-title';

  const modalContent = (
    <div
      className={`base-modal__overlay ${className}`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? modalId : undefined}
    >
      <div className="base-modal__container" style={{ maxWidth }}>
        {showCloseButton && (
          <div className="base-modal__header">
            <button
              className="base-modal__close"
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>
            {title && (
              <h2 id={modalId} className="base-modal__title">
                {title}
              </h2>
            )}
          </div>
        )}
        <div className="base-modal__body">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
