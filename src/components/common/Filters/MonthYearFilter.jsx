// ============================================
// 📁 src/components/common/Filters/MonthYearFilter.jsx
// Responsabilidade: Filtro de mês/ano
// ============================================

import React from "react";
import "./Filters.css";

const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export default function MonthYearFilter({
  month,
  year,
  onMonthChange,
  onYearChange,
  availableYears = [],
  isDisabled = false,
}) {
  return (
    <>
      {month !== undefined && (
        <div className="filter-item">
          <label htmlFor="month">Mês</label>
          <select
            id="month"
            value={month || ""}
            onChange={(e) => onMonthChange(e.target.value)}
            disabled={isDisabled}
            className="filter-select"
          >
            <option value="">Todos</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {year !== undefined && availableYears.length > 0 && (
        <div className="filter-item">
          <label htmlFor="year">Ano</label>
          <select
            id="year"
            value={year || ""}
            onChange={(e) => onYearChange(e.target.value)}
            disabled={isDisabled}
            className="filter-select"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
