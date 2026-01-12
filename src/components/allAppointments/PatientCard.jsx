// src/components/allAppointments/PatientCard.jsx
import React from "react";
import formatDate from "../../utils/formatter/formatDate";
import { getStatusOptions } from "../../utils/appointments/getStatusOptions";
import "./PatientCard.css";

export default function PatientCard({
  patient,
  isExpanded,
  changedIds,
  lockedAppointments, // ✅ NOVO
  onToggle,
  onStatusChange,
  onSendWhatsapp,
}) {
  // ✅ MIGRADO: Usa getStatusOptions helper com constants centralizadas
  const statusOptions = getStatusOptions();
  const handleSendReport = (e) => {
    e.stopPropagation();
    const messages = patient.appointments.map(
      (app) =>
        `${formatDate(app.date)} às ${app.time} - R$ ${(app.value || 0).toFixed(2)}`
    );
    const text = `Seguem as datas e valores de suas consultas:\n${messages.join("\n")}`;
    onSendWhatsapp(patient.whatsapp, text);
  };

  return (
    <div className="patient-card">
      <div className="patient-header-container">
        <button className="patient-header" onClick={onToggle}>
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
            <span className="expand-icon">{isExpanded ? "▲" : "▼"}</span>
          </div>
        </button>

        <button
          className="btn btn-ghost btn-whatsapp"
          onClick={handleSendReport}
          title="Enviar relatório por WhatsApp"
        >
          📤
        </button>
      </div>

      {isExpanded && (
        <div className="appointments-list">
          {patient.appointments.map((app) => {
            const isLocked = lockedAppointments.has(app.id); // ✅ NOVO
            
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
                    <span>📱 {app.patientWhatsapp}</span>
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
                      🔒
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