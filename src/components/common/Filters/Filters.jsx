// src/components/common/Filters/Filters.jsx
import React from "react";
import { Calendar, RotateCcw, Search } from "lucide-react";
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

export default function Filters({
  // Busca (opcional)
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  
  // Status (opcional)
  statusFilter,
  onStatusChange,
  statusOptions = [],
  
  // Datas
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  
  // Mês/Ano
  month,
  year,
  onMonthChange,
  onYearChange,
  availableYears = [],
  
  // Ações
  onReset,
  
  // Extras (opcional)
  extraActions = null,
  
  // Config
  showSearch = false,
  showStatus = false,
  showDateRange = true,
  showMonthYear = true,
}) {
  const hasDateRange = dateFrom && dateTo;
  const isMonthYearDisabled = hasDateRange;

  return (
    <div className="filters-container" role="region" aria-label="Filtros">
      <div className="filters-grid">
        {/* 🔍 Busca (opcional) */}
        {showSearch && searchTerm !== undefined && (
          <div className="filter-item filter-search">
            <label htmlFor="search">
              <Search size={14} />
              Buscar
            </label>
            <input
              id="search"
              type="search"
              value={searchTerm || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="filter-input"
            />
          </div>
        )}

        {/* 📊 Status (opcional) */}
        {showStatus && statusFilter !== undefined && statusOptions.length > 0 && (
          <div className="filter-item">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={statusFilter || "Todos"}
              onChange={(e) => onStatusChange(e.target.value)}
              className="filter-select"
            >
              <option value="Todos">Todos</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 📅 Data De */}
        {showDateRange && (
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
        )}

        {/* 📅 Data Até */}
        {showDateRange && (
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
        )}

        {/* 📆 Mês */}
        {showMonthYear && month !== undefined && (
          <div className="filter-item">
            <label htmlFor="month">Mês</label>
            <select
              id="month"
              value={month || ""}
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
        )}

        {/* 📅 Ano */}
        {showMonthYear && year !== undefined && availableYears.length > 0 && (
          <div className="filter-item">
            <label htmlFor="year">Ano</label>
            <select
              id="year"
              value={year || ""}
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
        )}
      </div>

      {/* Ações */}
      <div className="filters-actions">
        <button
          type="button"
          onClick={onReset}
          className="btn btn-ghost"
          title="Limpar todos os filtros"
        >
          <RotateCcw size={16} />
          <span>Limpar filtros</span>
        </button>
        
        {/* Ações extras (expandir/contrair, etc) */}
        {extraActions}
      </div>

      {/* Info Badge quando há filtro de data */}
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