import { FiSmartphone, FiUserPlus } from "react-icons/fi";
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
      <span className="patient-name">{patientName}</span>
      <span className="patient-whatsapp">{appt.patientWhatsapp}</span>

      {patientStatus === "new" && (
        <span style={{color: "#f59e0b", fontWeight: "600", marginLeft: "0.5rem"}}>Novo paciente</span>
      )}

      <select
        className="status-select"
        value={status}
        onChange={(e) => onStatusChange(appt.id, e.target.value)}
      >
        <option value="Pendente">Pendente</option>
        <option value="Msg enviada">Msg enviada</option>
        <option value="Confirmado">Confirmado</option>
        <option value="Não Compareceu">Não Compareceu</option>
        <option value="Cancelado">Cancelado</option>
      </select>

      <button className="btn-primary" onClick={() => onSendWhatsapp(appt)}>
        <FiSmartphone /> WhatsApp
      </button>

      {patientStatus === "new" && (
        <button className="btn-secondary" onClick={() => onAddPatient(appt)}>
          <FiUserPlus /> Adicionar
        </button>
      )}
    </li>
  );
}
