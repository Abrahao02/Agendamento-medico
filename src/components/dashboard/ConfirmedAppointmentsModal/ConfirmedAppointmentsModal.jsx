// ============================================
// 📁 src/components/dashboard/ConfirmedAppointmentsModal/ConfirmedAppointmentsModal.jsx
// Modal para exibir appointments confirmados agrupados por paciente
// ============================================
import { createPortal } from 'react-dom';
import React from 'react';
import { X, CheckCircle, Calendar, Clock } from 'lucide-react';
import { APPOINTMENT_STATUS } from '../../../constants/appointmentStatus';
import formatDate from '../../../utils/formatter/formatDate';
import { useModal } from '../../../hooks/common/useModal';
import { createPatientsMap } from '../../../utils/patients/createPatientsMap';
import { getPatientName } from '../../../utils/patients/getPatientName';
import './ConfirmedAppointmentsModal.css';

export default function ConfirmedAppointmentsModal({
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

  // Agrupar appointments confirmados por paciente
  const groupedByPatient = React.useMemo(() => {
    const groupedMap = {};
    
    appointments.forEach(apt => {
      if (apt.status !== APPOINTMENT_STATUS.CONFIRMED) return;
      
      const patientWhatsapp = apt.patientWhatsapp;
      if (!patientWhatsapp) return;
      
      // Buscar nome atualizado do paciente no array patients
      const patientName = getPatientName({ 
        patientData: patientsMap[patientWhatsapp], 
        appointment: apt 
      });
      
      if (!groupedMap[patientWhatsapp]) {
        groupedMap[patientWhatsapp] = {
          patientKey: patientWhatsapp,
          patientName,
          appointments: [],
        };
      }
      
      groupedMap[patientWhatsapp].appointments.push({
        id: apt.id,
        date: apt.date || '',
        time: apt.time || '',
      });
    });
    
    // Ordenar pacientes por número de consultas (decrescente) e depois por nome
    return Object.values(groupedMap)
      .map(patient => ({
        ...patient,
        count: patient.appointments.length,
        appointments: patient.appointments.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return (a.time || '').localeCompare(b.time || '');
        }),
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.patientName.localeCompare(b.patientName);
      });
  }, [appointments, patientsMap]);

  const totalAppointments = groupedByPatient.reduce((sum, patient) => sum + patient.count, 0);
  const totalPatients = groupedByPatient.length;

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="confirmed-appointments-modal__overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmed-appointments-modal-title"
    >
      <div className="confirmed-appointments-modal__container">
        {/* Header */}
        <div className="confirmed-appointments-modal__header">
          <button 
            className="confirmed-appointments-modal__close" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>

          <h2 id="confirmed-appointments-modal-title" className="confirmed-appointments-modal__title">
            Confirmados — {totalAppointments} consulta{totalAppointments !== 1 ? 's' : ''} ({totalPatients} paciente{totalPatients !== 1 ? 's' : ''})
          </h2>
        </div>

        {/* Body - Lista de pacientes */}
        <div className="confirmed-appointments-modal__body">
          {groupedByPatient.length > 0 ? (
            groupedByPatient.map((patient, index) => (
              <div key={patient.patientKey || index} className="patient-group">
                <div className="patient-group__header">
                  <div className="patient-group__icon">
                    <CheckCircle size={20} />
                  </div>
                  <div className="patient-group__info">
                    <h3 className="patient-group__name">{patient.patientName}</h3>
                    <span className="patient-group__count">
                      {patient.count} consulta{patient.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <ul className="patient-group__appointments">
                  {patient.appointments.map((appointment, aptIndex) => (
                    <li key={appointment.id || aptIndex} className="appointment-item">
                      <span className="appointment-item__bullet">•</span>
                      <div className="appointment-item__content">
                        {appointment.date && (
                          <span className="appointment-item__date">
                            <Calendar size={14} />
                            {formatDate(appointment.date)}
                          </span>
                        )}
                        {appointment.time && (
                          <span className="appointment-item__time">
                            <Clock size={14} />
                            {appointment.time}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="confirmed-empty">
              <p>Não há consultas confirmadas no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
