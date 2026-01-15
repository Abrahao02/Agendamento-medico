// ========================================
// PatientsList.jsx
// ========================================
import React, { useCallback } from "react";
import { Inbox } from "lucide-react";
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
  const handleToggle = useCallback((patientName) => {
    onTogglePatient(patientName);
  }, [onTogglePatient]);

  if (patientsData.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon" aria-hidden="true">
          <Inbox size={56} />
        </div>
        <h3>Nenhum agendamento encontrado</h3>
        <p>Limpe os filtros para tentar novamente.</p>
      </div>
    );
  }

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