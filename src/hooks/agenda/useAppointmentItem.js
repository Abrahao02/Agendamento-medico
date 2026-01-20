import { useState } from "react";

/**
 * Hook para gerenciar lógica de item de agendamento
 * @param {Object} params - Parâmetros do hook
 * @param {boolean} params.isLocked - Se o agendamento está bloqueado
 * @param {Function} params.onStatusChange - Callback para mudança de status
 * @param {Object} params.appt - Dados do agendamento
 * @returns {Object} Estado e handlers
 */
export const useAppointmentItem = ({ isLocked, onStatusChange, appt }) => {
  const [showLockedMessage, setShowLockedMessage] = useState(false);

  const handleStatusChange = (e) => {
    if (isLocked) {
      setShowLockedMessage(true);
      setTimeout(() => setShowLockedMessage(false), 3000);
      // Não permite mudança
      e.target.value = e.target.defaultValue; // Reverte select
      return;
    }
    
    onStatusChange(appt.id, e.target.value);
  };

  return {
    state: {
      showLockedMessage,
    },
    handlers: {
      handleStatusChange,
    },
  };
};
