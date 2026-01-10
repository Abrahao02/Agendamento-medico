// ========================================
// PatientCard.jsx
// ========================================
import React from "react";
import formatDate from "../../utils/formatter/formatDate";
import "./PatientCard.css";

export default function PatientCard({
  patient,
  isExpanded,
  changedIds,
  onToggle,
  onStatusChange,
  onSendWhatsapp,
}) {
  const handleSendReport = () => {
    const messages = patient.appointments.map(
      (app) => `${formatDate(app.date)} às ${app.time} - R$ ${(app.value || 0).toFixed(2)}`
    );
    const text = `Seguem as datas e valores de suas consultas:\n${messages.join("\n")}`;
    onSendWhatsapp(patient.whatsapp, text);
  };

  return (
    <div className="patient-card">
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
          <span className="patient-total">
            R$ {patient.totalValue.toFixed(2)}
          </span>
          <button
            className="btn btn-ghost btn-small"
            onClick={(e) => {
              e.stopPropagation();
              handleSendReport();
            }}
            title="Enviar relatório por WhatsApp"
          >
            📤
          </button>
          <span className="expand-icon">{isExpanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="appointments-list">
          {patient.appointments.map((app) => (
            <div
              key={app.id}
              className={`appointment-card ${changedIds.has(app.id) ? "changed" : ""}`}
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
                <div className="appointment-value">
                  R$ {(app.value || 0).toFixed(2)}
                </div>
              </div>

              <div className="status-select-wrapper">
                <select
                  value={app.status}
                  onChange={(e) => onStatusChange(app.id, e.target.value)}
                  className="status-select"
                  data-status={app.status}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Não Compareceu">Não Compareceu</option>
                  <option value="Msg enviada">Msg enviada</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}