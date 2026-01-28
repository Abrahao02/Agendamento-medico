import AppointmentItem from "./AppointmentItem";
import "./AppointmentList.css";

export default function AppointmentList({ appointments, lockedAppointments, statusUpdates, referenceNames, patientStatus, onStatusChange, onAddPatient, onSendWhatsapp, onDeleteAppointment }) {
  if (appointments.length === 0) return <p>Nenhum paciente agendado para este dia.</p>;

  return (
    <ul className="appointments-list">
      {appointments.map(appt => (
        <AppointmentItem
          key={appt.id}
          appt={appt}
          status={statusUpdates[appt.id]}
          patientName={referenceNames[appt.id]}
          patientStatus={patientStatus[appt.id]}
          isLocked={lockedAppointments.has(appt.id)}
          onStatusChange={onStatusChange}
          onAddPatient={onAddPatient}
          onSendWhatsapp={onSendWhatsapp}
          onDeleteAppointment={onDeleteAppointment}
        />
      ))}
    </ul>
  );
}
