// ============================================
// 📁 src/components/agenda/AvailableSlotsList/AvailableSlotsList.jsx
// Lista de horários disponíveis do dia
// ============================================
import React, { useState } from "react";
import { Clock, X } from "lucide-react";
import "./AvailableSlotsList.css";

export default function AvailableSlotsList({ slots = [], onRemoveSlot }) {
  const [removingSlot, setRemovingSlot] = useState(null);

  const handleRemove = async (e, slotTime) => {
    e.stopPropagation();
    if (!onRemoveSlot) return;

    setRemovingSlot(slotTime);
    try {
      const result = await onRemoveSlot(slotTime);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      alert("Erro ao remover horário: " + error.message);
    } finally {
      setRemovingSlot(null);
    }
  };

  if (!slots || slots.length === 0) {
    return (
      <div className="available-slots-list">
        <div className="available-slots-header">
          <Clock size={20} />
          <h3>Horários Disponíveis</h3>
        </div>
        <div className="available-slots-empty">
          <p>Nenhum horário disponível para este dia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="available-slots-list">
      <div className="available-slots-header">
        <Clock size={20} />
        <h3>Horários Disponíveis</h3>
        <span className="available-slots-count">{slots.length}</span>
      </div>
      <div className="available-slots-grid">
        {slots.map((slot, index) => (
          <div key={index} className="available-slot-item">
            <span className="slot-time">{slot}</span>
            {onRemoveSlot && (
              <button
                className="available-slot-remove"
                onClick={(e) => handleRemove(e, slot)}
                disabled={removingSlot === slot}
                title="Remover horário"
                aria-label="Remover horário"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
