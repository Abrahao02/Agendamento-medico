// src/components/availability/SlotItem/SlotItem.jsx
import React from 'react';
import { X, UserX } from 'lucide-react';
import './SlotItem.css';

export default function SlotItem({ 
  slot, 
  isBooked, 
  patientName, 
  onRemove, 
  onCancel 
}) {
  return (
    <div className={`slot-item ${isBooked ? 'booked' : 'free'}`}>
      <div className="slot-time">
        <span className="slot-time-text">{slot}</span>
        
        {isBooked && patientName && (
          <span className="slot-name">{patientName}</span>
        )}
      </div>

      {isBooked ? (
        <button 
          className="slot-action"
          onClick={() => onCancel(slot)}
          title="Cancelar agendamento"
        >
          <UserX size={16} />
        </button>
      ) : (
        <button 
          className="slot-action slot-item-remove"
          onClick={() => onRemove(slot)}
          title="Remover horário"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}