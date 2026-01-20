// ============================================
// 📁 src/components/dashboard/PendingAppointmentsModal/PendingAppointmentsModal.jsx
// Modal para exibir appointments pendentes agrupados por tipo
// ============================================
import { createPortal } from 'react-dom';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, MessageCircle, Calendar } from 'lucide-react';
import { APPOINTMENT_STATUS } from '../../../constants/appointmentStatus';
import formatDate from '../../../utils/formatter/formatDate';
import { useModal } from '../../../hooks/common/useModal';
import { createPatientsMap } from '../../../utils/patients/createPatientsMap';
import { getPatientName } from '../../../utils/patients/getPatientName';
import './PendingAppointmentsModal.css';

export default function PendingAppointmentsModal({
  isOpen,
  onClose,
  appointments = [],
  patients = [],
}) {
  const navigate = useNavigate();
  const { handleBackdropClick, handleKeyDown } = useModal(isOpen, onClose);
  
  const handleItemClick = (appointment) => {
    if (appointment.date) {
      onClose(); // Fecha o modal primeiro
      navigate("/dashboard/appointments", {
        state: { date: appointment.date }
      });
    }
  };

  // Criar mapa de pacientes por WhatsApp para buscar nomes atualizados
  const patientsMap = React.useMemo(() => 
    createPatientsMap(patients), 
    [patients]
  );

  // Agrupar appointments por tipo
  const groupedAppointments = React.useMemo(() => {
    const pendentes = appointments.filter(
      apt => apt.status === APPOINTMENT_STATUS.PENDING
    );
    const msgEnviadas = appointments.filter(
      apt => apt.status === APPOINTMENT_STATUS.MESSAGE_SENT
    );

    return {
      pendentes: pendentes.map(apt => ({
        ...apt,
        patientName: getPatientName({ 
          patientData: patientsMap[apt.patientWhatsapp], 
          appointment: apt 
        }),
        date: apt.date || '',
        time: apt.time || '',
      })),
      msgEnviadas: msgEnviadas.map(apt => ({
        ...apt,
        patientName: getPatientName({ 
          patientData: patientsMap[apt.patientWhatsapp], 
          appointment: apt 
        }),
        date: apt.date || '',
        time: apt.time || '',
      })),
    };
  }, [appointments, patientsMap]);

  const totalCount = groupedAppointments.pendentes.length + groupedAppointments.msgEnviadas.length;

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="pending-appointments-modal__overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pending-appointments-modal-title"
    >
      <div className="pending-appointments-modal__container">
        {/* Header */}
        <div className="pending-appointments-modal__header">
          <button 
            className="pending-appointments-modal__close" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>

          <h2 id="pending-appointments-modal-title" className="pending-appointments-modal__title">
            Pendentes — Ação necessária ({totalCount})
          </h2>
        </div>

        {/* Body - Grupos */}
        <div className="pending-appointments-modal__body">
          {/* Primeiro contato não realizado */}
          {groupedAppointments.pendentes.length > 0 && (
            <div className="pending-group">
              <div className="pending-group__header">
                <div className="pending-group__icon pending-group__icon--red">
                  <Clock size={20} />
                </div>
                <h3 className="pending-group__title">
                  Primeiro contato não realizado ({groupedAppointments.pendentes.length})
                </h3>
              </div>
              <ul className="pending-group__list">
                {groupedAppointments.pendentes.map((appointment, index) => (
                  <li 
                    key={appointment.id || index} 
                    className="pending-item clickable"
                    onClick={() => handleItemClick(appointment)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleItemClick(appointment);
                      }
                    }}
                    aria-label={`Ir para agenda do dia ${formatDate(appointment.date)}`}
                  >
                    <span className="pending-item__bullet">•</span>
                    <div className="pending-item__content">
                      <span className="pending-item__name">{appointment.patientName}</span>
                      <div className="pending-item__datetime">
                        {appointment.date && (
                          <span className="pending-item__date">
                            <Calendar size={14} />
                            {formatDate(appointment.date)}
                          </span>
                        )}
                        {appointment.time && (
                          <span className="pending-item__time">
                            <Clock size={14} />
                            {appointment.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Aguardando retorno do paciente */}
          {groupedAppointments.msgEnviadas.length > 0 && (
            <div className="pending-group">
              <div className="pending-group__header">
                <div className="pending-group__icon pending-group__icon--yellow">
                  <MessageCircle size={20} />
                </div>
                <h3 className="pending-group__title">
                  Aguardando retorno do paciente ({groupedAppointments.msgEnviadas.length})
                </h3>
              </div>
              <ul className="pending-group__list">
                {groupedAppointments.msgEnviadas.map((appointment, index) => (
                  <li 
                    key={appointment.id || index} 
                    className="pending-item clickable"
                    onClick={() => handleItemClick(appointment)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleItemClick(appointment);
                      }
                    }}
                    aria-label={`Ir para agenda do dia ${formatDate(appointment.date)}`}
                  >
                    <span className="pending-item__bullet">•</span>
                    <div className="pending-item__content">
                      <div className="pending-item__header">
                        <span className="pending-item__name">{appointment.patientName}</span>
                        <span className="pending-item__badge">msg enviada</span>
                      </div>
                      <div className="pending-item__datetime">
                        {appointment.date && (
                          <span className="pending-item__date">
                            <Calendar size={14} />
                            {formatDate(appointment.date)}
                          </span>
                        )}
                        {appointment.time && (
                          <span className="pending-item__time">
                            <Clock size={14} />
                            {appointment.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mensagem quando não há pendentes */}
          {totalCount === 0 && (
            <div className="pending-empty">
              <p>Não há consultas pendentes no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
