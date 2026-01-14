// ========================================
// PatientsList.jsx
// ========================================
import React, { useCallback } from "react";
import PatientCard from "./PatientCard";
import "./PatientsList.css";

function PatientsList({
  patientsData,
  expandedPatients,
  changedIds,
  lockedAppointments,
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

  const handleToggle = useCallback((patientName) => {
    onTogglePatient(patientName);
  }, [onTogglePatient]);

  return (
    <div className="patients-list">
      {patientsData.map((patient) => (
        <PatientCard
          key={patient.whatsapp}
          patient={patient}
          isExpanded={expandedPatients.has(patient.name)}
          changedIds={changedIds}
          lockedAppointments={lockedAppointments}
          onToggle={handleToggle}
          onStatusChange={onStatusChange}
          onSendWhatsapp={onSendWhatsapp}
        />
      ))}
    </div>
  );
}

export default React.memo(PatientsList);