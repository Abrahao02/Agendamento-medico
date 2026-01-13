// src/components/availability/CalendarLegend/CalendarLegend.jsx
import React from 'react';
import './CalendarLegend.css';

export default function CalendarLegend() {
  return (
    <div className="calendar-legend-card">
      <div className="calendar-legend-items">
        <div className="legend-item">
          <span className="legend-dot free"></span>
          <span>Disponível</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot booked"></span>
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
}