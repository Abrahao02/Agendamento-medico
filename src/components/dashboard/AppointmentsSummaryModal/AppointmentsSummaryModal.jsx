// ============================================
// 📁 src/components/dashboard/AppointmentsSummaryModal/AppointmentsSummaryModal.jsx
// Modal para exibir resumo simples de agendamentos ocupados
// ============================================
import { createPortal } from 'react-dom';
import React from 'react';
import { X } from 'lucide-react';
import { APPOINTMENT_STATUS } from '../../../constants/appointmentStatus';
import './AppointmentsSummaryModal.css';

export default function AppointmentsSummaryModal({
  isOpen,
  onClose,
  appointments = [],
}) {
  React.useEffect(() => {
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

  // Calcular contagens
  const counts = React.useMemo(() => {
    const confirmed = appointments.filter(
      apt => apt.status === APPOINTMENT_STATUS.CONFIRMED
    ).length;
    
    const pending = appointments.filter(
      apt => apt.status === APPOINTMENT_STATUS.PENDING
    ).length;
    
    const msgEnviada = appointments.filter(
      apt => apt.status === APPOINTMENT_STATUS.MESSAGE_SENT
    ).length;
    
    const noShow = appointments.filter(
      apt => apt.status === APPOINTMENT_STATUS.NO_SHOW
    ).length;

    return { confirmed, pending, msgEnviada, noShow };
  }, [appointments]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="appointments-summary-modal__overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointments-summary-modal-title"
    >
      <div className="appointments-summary-modal__container">
        {/* Header */}
        <div className="appointments-summary-modal__header">
          <button 
            className="appointments-summary-modal__close" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>

          <h2 id="appointments-summary-modal-title" className="appointments-summary-modal__title">
            Agendamentos ocupados
          </h2>
        </div>

        {/* Body - Lista simples */}
        <div className="appointments-summary-modal__body">
          <div className="appointments-summary-modal__item">
            <span className="appointments-summary-modal__label">Confirmados:</span>
            <span className="appointments-summary-modal__value">{counts.confirmed}</span>
          </div>
          <div className="appointments-summary-modal__item">
            <span className="appointments-summary-modal__label">Pendentes:</span>
            <span className="appointments-summary-modal__value">{counts.pending}</span>
          </div>
          <div className="appointments-summary-modal__item">
            <span className="appointments-summary-modal__label">Msg enviada:</span>
            <span className="appointments-summary-modal__value">{counts.msgEnviada}</span>
          </div>
          <div className="appointments-summary-modal__item">
            <span className="appointments-summary-modal__label">Não comparecimento:</span>
            <span className="appointments-summary-modal__value">{counts.noShow}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
