// src/components/publicSchedule/DayCard/DayCard.jsx
import React from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import formatDate from "../../../utils/formatter/formatDate";
import "./DayCard.css";

export default function DayCard({
  day,
  isSelected,
  isDisabled,
  onDayClick,
  onSlotClick,
  selectedSlotTime,
}) {
  return (
    <div className="day-card">
      <button
        className={`day-btn ${isSelected ? "selected" : ""}`}
        disabled={isDisabled}
        onClick={() => onDayClick(day)}
        aria-expanded={isSelected}
      >
        <div className="day-info">
          <Calendar size={18} />
          <span className="day-date">{formatDate(day.date)}</span>
          <span className="slots-count">{day.slots.length} horário(s)</span>
        </div>
        <span className="arrow">
          {isSelected ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>

      {isSelected && (
        <div className="slots-list">
          {day.slots.map((slot, idx) => (
            <button
              key={idx}
              className={`slot-btn ${
                selectedSlotTime === slot ? "selected" : ""
              }`}
              onClick={() => onSlotClick(day, slot)}
            >
              {/* ✅ CORREÇÃO: passa day (objeto completo) e slot (horário)
                  day = { id: "...", date: "2026-01-15", slots: [...] }
                  slot = "12:00"
              */}
              <span className="slot-time">{slot}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}