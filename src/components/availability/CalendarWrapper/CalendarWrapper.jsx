// src/components/availability/CalendarWrapper/CalendarWrapper.jsx
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarLegend from '../CalendarLegend/CalendarLegend';
import './CalendarWrapper.css';

export default function CalendarWrapper({ 
  value, 
  onSelectDate, 
  tileContent
}) {
  return (
    <div className="calendar-wrapper">
      <Calendar
        value={value}
        onClickDay={onSelectDate}
        tileContent={tileContent}
        locale="pt-BR"
      />
      
      <CalendarLegend />
    </div>
  );
}
