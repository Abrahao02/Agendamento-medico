// src/components/dashboard/UpcomingAppointments/UpcomingAppointments.jsx
import React from "react";
import { Calendar, Clock } from "lucide-react";
import formatDate from "../../../utils/formatDate";
import "./UpcomingAppointments.css";

export default function UpcomingAppointments({ appointments = [] }) {
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmado":
        return "confirmed";
      case "Pendente":
        return "pending";
      case "Não Compareceu":
        return "missed";
      default:
        return "pending";
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="upcoming-card">
        <h3 className="upcoming-title">Próximas consultas</h3>
        <div className="upcoming-empty">
          <span className="empty-icon">📅</span>
          <p>Nenhuma consulta agendada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="upcoming-card">
      <h3 className="upcoming-title">
        Próximas consultas
        <span className="upcoming-count">{appointments.length}</span>
      </h3>
      <div className="upcoming-list">
        {appointments.map((appointment, index) => (
          <div
            key={appointment.id || index}
            className="upcoming-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="upcoming-avatar">
              {getInitials(appointment.referenceName || appointment.patientName)}
            </div>
            <div className="upcoming-info">
              <h4 className="patient-name">
                {appointment.referenceName || appointment.patientName}
              </h4>
              <div className="appointment-details">
                <span className="detail-item">
                  <Calendar size={14} />
                  {formatDate(appointment.date)}
                </span>
                <span className="detail-item">
                  <Clock size={14} />
                  {appointment.time}
                </span>
              </div>
            </div>
            <span className={`upcoming-status ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}