// ============================================
// 📁 src/components/agenda/AppointmentItem.jsx - VERSÃO FINAL
// ============================================
import { useState } from "react";
import { FiSmartphone, FiUserPlus } from "react-icons/fi";
import { Lock } from "lucide-react";
import { APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import "./AppointmentItem.css";

export default function AppointmentItem({
  appt,
  status,
  patientName,
  patientStatus,
  isLocked, // ✅ NOVO
  onStatusChange,
  onAddPatient,
  onSendWhatsapp
}) {
  const [showLockedMessage, setShowLockedMessage] = useState(false);

  // ✅ NOVO: Handler que valida bloqueio
  const handleStatusChange = (e) => {
    if (isLocked) {
      setShowLockedMessage(true);
      setTimeout(() => setShowLockedMessage(false), 3000);
      // Não permite mudança
      e.target.value = status; // Reverte select
      return;
    }
    
    onStatusChange(appt.id, e.target.value);
  };

  return (
    <li 
      className={`slot-item ${isLocked ? 'locked-item' : ''}`}
      data-status={status}
    >
      <span className="time">{appt.time}</span>
      
      <div className="patient-info">
        <span className="patient-name">{patientName}</span>
        <span className="patient-whatsapp">{appt.patientWhatsapp}</span>
      </div>

      {patientStatus === "new" && (
        <span className="new-patient-badge">Novo paciente</span>
      )}

      {/* ✅ SELECT COM WRAPPER E ÍCONE */}
      <div className="status-select-wrapper">
        <select
          className={`status-select ${isLocked ? 'locked-select' : ''}`}
          value={status}
          onChange={handleStatusChange}
          disabled={isLocked}
          title={isLocked ? "Status bloqueado - Horário reagendado" : ""}
        >
          <option value={APPOINTMENT_STATUS.PENDING}>Pendente</option>
          <option value={APPOINTMENT_STATUS.MESSAGE_SENT}>Msg enviada</option>
          <option value={APPOINTMENT_STATUS.CONFIRMED}>Confirmado</option>
          <option value={APPOINTMENT_STATUS.NO_SHOW}>Não Compareceu</option>
          <option value={APPOINTMENT_STATUS.CANCELLED}>Cancelado</option>
        </select>
        
        {/* ✅ ÍCONE DE CADEADO */}
        {isLocked && (
          <span className="lock-icon" title="Horário reagendado - Status bloqueado">
            <Lock size={16} />
          </span>
        )}
      </div>

      {/* ✅ MENSAGEM TEMPORÁRIA DE BLOQUEIO */}
      {showLockedMessage && (
        <div className="locked-message">
          ⚠️ Horário reagendado - Status não pode ser alterado
        </div>
      )}

      <div className="slot-actions">
        <button 
          className="btn-primary" 
          onClick={() => onSendWhatsapp(appt)}
          disabled={isLocked}
        >
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