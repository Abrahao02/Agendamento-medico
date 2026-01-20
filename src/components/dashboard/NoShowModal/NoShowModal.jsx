// ============================================
// 📁 src/components/dashboard/NoShowModal/NoShowModal.jsx
// Modal para exibir pacientes que não compareceram
// ============================================
import { createPortal } from 'react-dom';
import React from 'react';
import { X, XCircle, Calendar, Clock } from 'lucide-react';
import { APPOINTMENT_STATUS } from '../../../constants/appointmentStatus';
import formatDate from '../../../utils/formatter/formatDate';
import { useModal } from '../../../hooks/common/useModal';
import { createPatientsMap } from '../../../utils/patients/createPatientsMap';
import { getPatientName } from '../../../utils/patients/getPatientName';
import './NoShowModal.css';

export default function NoShowModal({
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

  // Filtrar apenas appointments que não compareceram
  const noShowAppointments = React.useMemo(() => {
    return appointments
      .filter(apt => apt.status === APPOINTMENT_STATUS.NO_SHOW)
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

  const totalNoShow = noShowAppointments.length;

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="no-show-modal__overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="no-show-modal-title"
    >
      <div className="no-show-modal__container">
        {/* Header */}
        <div className="no-show-modal__header">
          <button 
            className="no-show-modal__close" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>

          <h2 id="no-show-modal-title" className="no-show-modal__title">
            Não compareceram — {totalNoShow} consulta{totalNoShow !== 1 ? 's' : ''}
          </h2>
        </div>

        {/* Body - Lista de appointments */}
        <div className="no-show-modal__body">
          {noShowAppointments.length > 0 ? (
            <ul className="no-show-modal__list">
              {noShowAppointments.map((appointment, index) => (
                <li key={appointment.id || index} className="no-show-item">
                  <div className="no-show-item__icon">
                    <XCircle size={20} />
                  </div>
                  <div className="no-show-item__info">
                    <h3 className="no-show-item__name">
                      {appointment.patientName}
                    </h3>
                    <div className="no-show-item__datetime">
                      {appointment.date && (
                        <span className="no-show-item__date">
                          <Calendar size={14} />
                          {formatDate(appointment.date)}
                        </span>
                      )}
                      {appointment.time && (
                        <span className="no-show-item__time">
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
            <div className="no-show-empty">
              <p>Não há consultas sem comparecimento no período selecionado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
