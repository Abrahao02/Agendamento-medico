import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { getStatusConfig } from '../../../constants/appointmentStatus';
import './SlotItem.css';

export default function SlotItem({ 
  slot, 
  isBooked, 
  patientName,
  status,
  onRemove, 
  onDelete 
}) {
  const statusConfig = status ? getStatusConfig(status) : null;

  return (
    <div className={`slot-item ${isBooked ? 'booked' : 'free'} ${statusConfig?.cssClass || ''}`}>
      <div className="slot-time">
        <span className="slot-time-text">{slot}</span>
        
        {isBooked && patientName && (
          <div className="slot-details">
            <span className="slot-name">{patientName}</span>
            {statusConfig && (
              <span className={`slot-status ${statusConfig.cssClass}`}>
                {statusConfig.label}
              </span>
            )}
          </div>
        )}
      </div>

      {isBooked ? (
        <button 
          className="slot-action slot-delete"
          onClick={() => onDelete(slot)}
          title="Excluir ou cancelar"
        >
          <Trash2 size={16} />
        </button>
      ) : (
        <button 
          className="slot-action slot-remove"
          onClick={() => onRemove(slot)}
          title="Remover horário"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}