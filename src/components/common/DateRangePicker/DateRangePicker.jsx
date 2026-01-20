// ============================================
// 📁 src/components/common/DateRangePicker/DateRangePicker.jsx
// Componente de calendário para seleção de range de datas
// ============================================
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useDateRangePicker } from '../../../hooks/common/useDateRangePicker';
import './DateRangePicker.css';

export default function DateRangePicker({ 
  dateFrom, 
  dateTo, 
  onDateRangeChange,
  isOpen,
  onClose 
}) {
  const { state, handlers } = useDateRangePicker({
    dateFrom,
    dateTo,
    isOpen,
    onDateRangeChange,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay para mobile */}
      <div 
        className="date-range-picker-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="date-range-picker-dropdown">
        <Calendar
          onChange={handlers.handleDateChange}
          value={state.dateRange}
          selectRange={true}
          locale="pt-BR"
        />
      </div>
    </>
  );
}
