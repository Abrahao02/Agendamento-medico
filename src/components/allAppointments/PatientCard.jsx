// src/components/allAppointments/PatientCard.jsx
import React from "react";
import formatDate from "../../utils/formatter/formatDate";
import { getStatusOptions } from "../../utils/appointments/getStatusOptions";
import { ChevronDown, ChevronUp, Lock, Phone, Send } from "lucide-react";
import Button from "../common/Button";
import { usePatientCard } from "../../hooks/allAppointments/usePatientCard";
import "./PatientCard.css";

function PatientCard({
  patient,
  isExpanded,
  changedIds,
  lockedAppointments,
  onToggle,
  onStatusChange,
  onSendWhatsapp,
}) {
  const statusOptions = getStatusOptions();
  const { handlers } = usePatientCard({ patient, onToggle, onSendWhatsapp });

  return (
    <div className="patient-card">
      <div className="patient-header-container" onClick={handlers.handleContainerClick}>
        <button className="patient-header" onClick={handlers.handleToggle}>
          <div className="patient-info">
            <div className="patient-details">
              <h3>{patient.name}</h3>
              <p className="patient-stats-text">
                {patient.appointments.length} consulta
                {patient.appointments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="patient-meta">
            <span className="patient-total">R$ {patient.totalValue.toFixed(2)}</span>
          </div>
        </button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="btn-whatsapp"
          onClick={handlers.handleSendReport}
          title="Enviar relatório por WhatsApp"
          aria-label="Enviar relatório por WhatsApp"
          leftIcon={<Send size={16} />}
        >
          Enviar
        </Button>

        <span className="expand-icon" aria-hidden="true">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </div>

      {isExpanded && (
        <div className="appointments-list">
          {patient.appointments.map((app) => {
            const isLocked = lockedAppointments.has(app.id);
            
            return (
              <div
                key={app.id}
                className={`appointment-card ${changedIds.has(app.id) ? "changed" : ""} ${isLocked ? "locked" : ""}`}
                data-status={app.status}
              >
                <div className="appointment-date">
                  <span className="day">{formatDate(app.date, "day")}</span>
                  <span className="month">{formatDate(app.date, "month")}</span>
                  <span className="time">{app.time}</span>
                </div>

                <div className="appointment-details">
                  <div className="appointment-contact">
                    <span className="appointment-contact-item">
                      <Phone size={14} aria-hidden="true" />
                      {app.patientWhatsapp}
                    </span>
                  </div>
                  <div className="appointment-value">R$ {(app.value || 0).toFixed(2)}</div>
                </div>

                <div className="status-select-wrapper">
                  {/* ✅ ATUALIZADO: Adiciona disabled e título quando bloqueado */}
                  <select
                    value={app.status}
                    onChange={(e) => onStatusChange(app.id, e.target.value)}
                    className="status-select"
                    data-status={app.status}
                    disabled={isLocked}
                    title={isLocked ? "Horário reagendado - Status bloqueado" : ""}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  {/* ✅ NOVO: Indicador visual de bloqueio */}
                  {isLocked && (
                    <span className="locked-indicator" title="Horário reagendado">
                      <Lock size={14} aria-hidden="true" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default React.memo(PatientCard);