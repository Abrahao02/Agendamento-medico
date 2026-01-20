// ============================================
// 📁 src/components/dashboard/NewPatientsModal/NewPatientsModal.jsx
// Modal para exibir lista de novos pacientes
// ============================================
import { createPortal } from 'react-dom';
import React from 'react';
import { X, UserPlus } from 'lucide-react';
import formatDate from '../../../utils/formatter/formatDate';
import { convertTimestampToDate } from '../../../utils/firebase/convertTimestamp';
import { DEFAULT_PATIENT_NAME } from '../../../constants/formatters';
import './NewPatientsModal.css';

export default function NewPatientsModal({
  isOpen,
  onClose,
  newPatients = [],
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

  const totalPatients = newPatients.length;

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="new-patients-modal__overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-patients-modal-title"
    >
      <div className="new-patients-modal__container">
        {/* Header */}
        <div className="new-patients-modal__header">
          <button 
            className="new-patients-modal__close" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>

          <h2 id="new-patients-modal-title" className="new-patients-modal__title">
            Novos pacientes — {totalPatients} paciente{totalPatients !== 1 ? 's' : ''}
          </h2>
        </div>

        {/* Body - Lista de pacientes */}
        <div className="new-patients-modal__body">
          {newPatients.length > 0 ? (
            <ul className="new-patients-modal__list">
              {newPatients.map((patient, index) => (
                <li key={patient.whatsapp || index} className="new-patient-item">
                  <div className="new-patient-item__icon">
                    <UserPlus size={20} />
                  </div>
                  <div className="new-patient-item__info">
                    <h3 className="new-patient-item__name">
                      {patient.name || patient.referenceName || DEFAULT_PATIENT_NAME}
                    </h3>
                    {patient.referenceName && patient.name && (
                      <span className="new-patient-item__reference">
                        {patient.referenceName}
                      </span>
                    )}
                    {patient.createdAt && (() => {
                      const createdAtDate = convertTimestampToDate(patient.createdAt);
                      return createdAtDate ? (
                        <span className="new-patient-item__date">
                          Cadastrado em {formatDate(createdAtDate)}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="new-patients-empty">
              <p>Não há novos pacientes no período selecionado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
