// ============================================
// 📁 src/components/agenda/AppointmentItem.jsx - VERSÃO FINAL
// ============================================
import React from "react";
import { Lock, MessageCircle, UserPlus, Trash2 } from "lucide-react";
import Button from "../common/Button";
import { APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import { useAppointmentItem } from "../../hooks/agenda/useAppointmentItem";
import "./AppointmentItem.css";

function AppointmentItem({
  appt,
  status,
  patientName,
  patientStatus,
  isLocked,
  onStatusChange,
  onAddPatient,
  onSendWhatsapp,
  onDeleteAppointment,
}) {
  const { state, handlers } = useAppointmentItem({ 
    isLocked, 
    onStatusChange, 
    appt 
  });

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
          onChange={handlers.handleStatusChange}
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
      {state.showLockedMessage && (
        <div className="locked-message">
          Horário reagendado — status não pode ser alterado
        </div>
      )}

      <div className="slot-actions">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => onSendWhatsapp(appt)}
          disabled={isLocked}
          leftIcon={<MessageCircle size={16} />}
        >
          WhatsApp
        </Button>

        {patientStatus === "new" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAddPatient(appt)}
            leftIcon={<UserPlus size={16} />}
          >
            Adicionar
          </Button>
        )}

        {onDeleteAppointment && (
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={() => onDeleteAppointment(appt.id)}
            disabled={isLocked}
            leftIcon={<Trash2 size={16} />}
            title={isLocked ? "Não é possível excluir consulta bloqueada" : "Excluir consulta"}
          >
            Excluir
          </Button>
        )}
      </div>
    </li>
  );
}

export default React.memo(AppointmentItem);