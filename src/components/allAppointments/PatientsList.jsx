// ========================================
// PatientsList.jsx
// ========================================
import React from "react";
import PatientCard from "./PatientCard";
import "./PatientsList.css";

export default function PatientsList({
  patientsData,
  expandedPatients,
  changedIds,
  onTogglePatient,
  onStatusChange,
  onSendWhatsapp,
}) {
  if (patientsData.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>Nenhum agendamento encontrado</h3>
        <p>Limpe os filtros para tentar novamente.</p>
      </div>
    );
  }

  return (
    <div className="patients-list">
      {patientsData.map((patient) => (
        <PatientCard
          key={patient.name}
          patient={patient}
          isExpanded={expandedPatients.has(patient.name)}
          changedIds={changedIds}
          onToggle={() => onTogglePatient(patient.name)}
          onStatusChange={onStatusChange}
          onSendWhatsapp={onSendWhatsapp}
        />
      ))}
    </div>
  );
}