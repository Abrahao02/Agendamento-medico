import { useEffect } from "react";

/**
 * Hook genérico para gerenciar comportamento de modais
 * @param {Object} params - Parâmetros do hook
 * @param {boolean} params.isOpen - Estado de abertura do modal
 * @param {Function} params.onClose - Callback para fechar o modal
 * @returns {Object} Handlers para eventos do modal
 */
export const useModal = ({ isOpen, onClose }) => {
  // Gerencia overflow do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
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
    if (e.key === "Escape") {
      onClose();
    }
  };

  return {
    handlers: {
      handleBackdropClick,
      handleKeyDown,
    },
  };
};
