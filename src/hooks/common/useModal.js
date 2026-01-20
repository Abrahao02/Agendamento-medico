// ============================================
// 📁 src/hooks/common/useModal.js
// Hook reutilizável para gerenciar estado e comportamento de modais
// ============================================

import { useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar estado e comportamento de modais
 * Controla overflow do body e fornece handlers padrão
 * 
 * @param {boolean} isOpen - Estado de abertura do modal
 * @param {Function} onClose - Função para fechar o modal
 * @returns {Object} Handlers e funções utilitárias
 * 
 * @example
 * function MyModal({ isOpen, onClose }) {
 *   const { handleBackdropClick, handleKeyDown } = useModal(isOpen, onClose);
 *   
 *   return (
 *     <div className="modal-overlay" onClick={handleBackdropClick} onKeyDown={handleKeyDown}>
 *       <div className="modal-content">...</div>
 *     </div>
 *   );
 * }
 */
export function useModal(isOpen, onClose) {
  // Controla overflow do body quando modal está aberto
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

  // Handler para fechar ao clicar no backdrop
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handler para fechar com tecla ESC
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  return {
    handleBackdropClick,
    handleKeyDown,
  };
}
