// ============================================
// 📁 src/components/common/DateRangePicker/DateRangePicker.jsx
// Componente de calendário para seleção de range de datas
// ============================================
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { formatDateToQuery } from '../../../utils/filters/dateFilters';
import './DateRangePicker.css';

// Função helper para converter string YYYY-MM-DD para Date local (sem timezone)
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function DateRangePicker({ 
  dateFrom, 
  dateTo, 
  onDateRangeChange,
  isOpen,
  onClose 
}) {
  const [dateRange, setDateRange] = useState([
    parseLocalDate(dateFrom),
    parseLocalDate(dateTo)
  ]);

  // Atualiza o estado quando props mudam ou quando abre
  useEffect(() => {
    if (isOpen) {
      // Quando o calendário abre, limpa a seleção se as datas estiverem vazias
      if (!dateFrom && !dateTo) {
        setDateRange([null, null]);
      } else {
        setDateRange([
          parseLocalDate(dateFrom),
          parseLocalDate(dateTo)
        ]);
      }
    }
  }, [dateFrom, dateTo, isOpen]);

  const handleDateChange = (value) => {
    setDateRange(value);
    // Quando um range completo é selecionado (2 datas)
    if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
      // Usa formatDateToQuery para evitar problemas de timezone
      const fromStr = formatDateToQuery(value[0]);
      const toStr = formatDateToQuery(value[1]);
      onDateRangeChange(fromStr, toStr);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="date-range-picker-dropdown">
      <Calendar
        onChange={handleDateChange}
        value={dateRange}
        selectRange={true}
        locale="pt-BR"
      />
    </div>
  );
}
