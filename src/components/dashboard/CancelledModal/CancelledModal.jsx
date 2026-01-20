// ============================================
// 📁 src/components/dashboard/CancelledModal/CancelledModal.jsx
// Modal para exibir pacientes que cancelaram
// ============================================
import { createPortal } from 'react-dom';
import React from 'react';
import { X, CalendarX, Calendar, Clock } from 'lucide-react';
import { APPOINTMENT_STATUS } from '../../../constants/appointmentStatus';
import formatDate from '../../../utils/formatter/formatDate';
import { useModal } from '../../../hooks/common/useModal';
import { createPatientsMap } from '../../../utils/patients/createPatientsMap';
import { getPatientName } from '../../../utils/patients/getPatientName';
import './CancelledModal.css';

export default function CancelledModal({
  isOpen,
  onClose,
  appointments = [],
  patients = [],
}) {
  const { handleBackdropClick, handleKeyDown } = useModal(isOpen, onClose);

  // Criar mapa de pacientes por WhatsApp para buscar nomes atualizados
  const patientsMap = React.useMemo(() => 
    createPatientsMap(patients), 
    [patients]
  );

  // Filtrar apenas appointments cancelados
  const cancelledAppointments = React.useMemo(() => {
    return appointments
      .filter(apt => apt.status === APPOINTMENT_STATUS.CANCELLED)
      .map(apt => ({
        ...apt,
        patientName: getPatientName({ 
          patientData: patientsMap[apt.patientWhatsapp], 
          appointment: apt 
        }),
      }))
      .sort((a, b) => {
        // Ordena por data e depois por horário
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return (a.time || '').localeCompare(b.time || '');
      });
  }, [appointments, patientsMap]);

  const totalCancelled = cancelledAppointments.length;

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="cancelled-modal__overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancelled-modal-title"
    >
      <div className="cancelled-modal__container">
        {/* Header */}
        <div className="cancelled-modal__header">
          <button 
            className="cancelled-modal__close" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>

          <h2 id="cancelled-modal-title" className="cancelled-modal__title">
            Cancelados — {totalCancelled} consulta{totalCancelled !== 1 ? 's' : ''}
          </h2>
        </div>

        {/* Body - Lista de appointments */}
        <div className="cancelled-modal__body">
          {cancelledAppointments.length > 0 ? (
            <ul className="cancelled-modal__list">
              {cancelledAppointments.map((appointment, index) => (
                <li key={appointment.id || index} className="cancelled-item">
                  <div className="cancelled-item__icon">
                    <CalendarX size={20} />
                  </div>
                  <div className="cancelled-item__info">
                    <h3 className="cancelled-item__name">
                      {appointment.patientName}
                    </h3>
                    <div className="cancelled-item__datetime">
                      {appointment.date && (
                        <span className="cancelled-item__date">
                          <Calendar size={14} />
                          {formatDate(appointment.date)}
                        </span>
                      )}
                      {appointment.time && (
                        <span className="cancelled-item__time">
                          <Clock size={14} />
                          {appointment.time}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cancelled-empty">
              <p>Não há consultas canceladas no período selecionado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
