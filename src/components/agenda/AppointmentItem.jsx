import { FiSmartphone, FiUserPlus } from "react-icons/fi";
import { APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import "./AppointmentItem.css";

export default function AppointmentItem({
  appt,
  status,
  patientName,
  patientStatus,
  onStatusChange,
  onAddPatient,
  onSendWhatsapp
}) {
  return (
    <li className="slot-item" data-status={status}>
      <span className="time">{appt.time}</span>
      
      <div className="patient-info">
        <span className="patient-name">{patientName}</span>
        <span className="patient-whatsapp">{appt.patientWhatsapp}</span>
      </div>

      {patientStatus === "new" && (
        <span className="new-patient-badge">Novo paciente</span>
      )}

      <select
        className="status-select"
        value={status}
        onChange={(e) => onStatusChange(appt.id, e.target.value)}
      >
        <option value={APPOINTMENT_STATUS.PENDING}>Pendente</option>
        <option value={APPOINTMENT_STATUS.MESSAGE_SENT}>Msg enviada</option>
        <option value={APPOINTMENT_STATUS.CONFIRMED}>Confirmado</option>
        <option value={APPOINTMENT_STATUS.NO_SHOW}>Não Compareceu</option>
        <option value={APPOINTMENT_STATUS.CANCELLED}>Cancelado</option>
      </select>

      <div className="slot-actions">
        <button className="btn-primary" onClick={() => onSendWhatsapp(appt)}>
          <FiSmartphone /> WhatsApp
        </button>

        {patientStatus === "new" && (
          <button className="btn-secondary" onClick={() => onAddPatient(appt)}>
            <FiUserPlus /> Adicionar
          </button>
        )}
      </div>
    </li>
  );
}