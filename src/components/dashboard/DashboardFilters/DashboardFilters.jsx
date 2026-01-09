// src/components/dashboard/DashboardFilters/DashboardFilters.jsx
import React from "react";
import { Calendar, RotateCcw } from "lucide-react";
import "./DashboardFilters.css";

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

export default function DashboardFilters({
  dateFrom,
  dateTo,
  month,
  year,
  onDateFromChange,
  onDateToChange,
  onMonthChange,
  onYearChange,
  onReset,
  availableYears = [],
}) {
  const hasDateRange = dateFrom && dateTo;
  const isMonthYearDisabled = hasDateRange;

  return (
    <div className="dashboard-filters" role="region" aria-label="Filtros de período">
      <div className="filters-grid">
        {/* Data De */}
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

        {/* Data Até */}
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

        {/* Mês */}
        <div className="filter-item">
          <label htmlFor="month">Mês</label>
          <select
            id="month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            disabled={isMonthYearDisabled}
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

        {/* Ano */}
        <div className="filter-item">
          <label htmlFor="year">Ano</label>
          <select
            id="year"
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            disabled={isMonthYearDisabled}
            className="filter-select"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Botão Reset */}
        <div className="filter-actions">
          <button
            type="button"
            onClick={onReset}
            className="reset-btn"
            title="Limpar todos os filtros"
          >
            <RotateCcw size={16} />
            <span>Limpar filtros</span>
          </button>
        </div>
      </div>

      {hasDateRange && (
        <div className="filter-info">
          <span className="info-badge">
            📅 Exibindo dados de {new Date(dateFrom).toLocaleDateString("pt-BR")} até{" "}
            {new Date(dateTo).toLocaleDateString("pt-BR")}
          </span>
        </div>
      )}
    </div>
  );
}

// Exemplo de uso:
// <DashboardFilters
//   dateFrom={selectedDateFrom}
//   dateTo={selectedDateTo}
//   month={selectedMonth}
//   year={selectedYear}
//   onDateFromChange={setSelectedDateFrom}
//   onDateToChange={setSelectedDateTo}
//   onMonthChange={setSelectedMonth}
//   onYearChange={setSelectedYear}
//   onReset={handleResetFilters}
//   availableYears={[2023, 2024, 2025, 2026]}
// />