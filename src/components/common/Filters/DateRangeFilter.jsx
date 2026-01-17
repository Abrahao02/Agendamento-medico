// ============================================
// 📁 src/components/common/Filters/DateRangeFilter.jsx
// Responsabilidade: Filtro de range de datas
// ============================================

import React from "react";
import { Calendar } from "lucide-react";
import "./Filters.css";

export default function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}) {
  return (
    <>
      <div className="filter-item">
        <label htmlFor="date-from">
          <Calendar size={14} />
          Data de
        </label>
        <input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="filter-input"
        />
      </div>
      <div className="filter-item">
        <label htmlFor="date-to">
          <Calendar size={14} />
          Data até
        </label>
        <input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="filter-input"
        />
      </div>
    </>
  );
}
