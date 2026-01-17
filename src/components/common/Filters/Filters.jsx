// src/components/common/Filters/Filters.jsx
import React from "react";
import { Calendar, RotateCcw, Search } from "lucide-react";
import DateRangePicker from "../DateRangePicker";
import Button from "../Button";
import { useFilters } from "../../../hooks/common/useFilters";
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
  showQuickFilters = false,
}) {
  const { state, refs, computed, handlers } = useFilters({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    onMonthChange,
    onYearChange,
    onReset,
    showQuickFilters,
  });

  return (
    <div className="filters-container" role="region" aria-label="Filtros">
      {/* Título padronizado */}
      {showQuickFilters && (
        <h3 className="standardized-h3">Selecionar filtro</h3>
      )}
      
      {/* Botões rápidos de filtro */}
      {showQuickFilters && (
        <div className="quick-filters-wrapper" ref={refs.pickerWrapperRef}>
          <div className="quick-filters-row">
            <div className="quick-filters">
              <button
                type="button"
                onClick={handlers.handleToday}
                className={`quick-filter-btn ${state.activeQuickFilter === 'today' ? 'active' : ''}`}
                aria-label="Filtrar para hoje"
                aria-pressed={state.activeQuickFilter === 'today'}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={handlers.handleThisWeek}
                className={`quick-filter-btn ${state.activeQuickFilter === 'week' ? 'active' : ''}`}
                aria-label="Filtrar para esta semana"
                aria-pressed={state.activeQuickFilter === 'week'}
              >
                Esta semana
              </button>
              <button
                type="button"
                onClick={handlers.handleThisMonth}
                className={`quick-filter-btn ${state.activeQuickFilter === 'month' ? 'active' : ''}`}
                aria-label="Filtrar para este mês"
                aria-pressed={state.activeQuickFilter === 'month'}
              >
                Este mês
              </button>
              <div className="quick-filter-custom-wrapper">
                <button
                  type="button"
                  onClick={handlers.handleCustom}
                  className={`quick-filter-btn ${state.activeQuickFilter === 'custom' ? 'active' : ''}`}
                  aria-label="Filtro personalizado"
                  aria-pressed={state.activeQuickFilter === 'custom'}
                >
                  Personalizado
                </button>
                
                {/* DateRangePicker - aparece apenas quando Personalizado é clicado */}
                <DateRangePicker
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateRangeChange={(from, to) => {
                    onDateFromChange(from);
                    onDateToChange(to);
                  }}
                  isOpen={state.isDatePickerOpen}
                  onClose={() => handlers.setIsDatePickerOpen(false)}
                />
              </div>
            </div>
            
            {/* Botão Limpar filtros à direita */}
            {onReset && (
              <Button
                type="button"
                onClick={handlers.handleReset}
                variant="outline"
                size="sm"
                className="clear-filters-btn"
                title="Limpar todos os filtros"
                leftIcon={<RotateCcw size={16} />}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="filters-grid">
        {/* 🔍 Busca (opcional) */}
        {showSearch && searchTerm !== undefined && (
          <div className="filter-item filter-search">
            <label htmlFor="search">Buscar</label>
            <div className="filter-search-input-wrapper">
              <Search size={20} className="filter-search-icon" />
            <input
              id="search"
              type="search"
              value={searchTerm || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="filter-input"
            />
            </div>
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
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 📅 Data De - apenas se showQuickFilters=false */}
        {showDateRange && !showQuickFilters && (
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

        {/* 📅 Data Até - apenas se showQuickFilters=false */}
        {showDateRange && !showQuickFilters && (
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

        {/* 📆 Mês - apenas se showQuickFilters=false */}
        {showMonthYear && !showQuickFilters && month !== undefined && (
          <div className="filter-item">
            <label htmlFor="month">Mês</label>
            <select
              id="month"
              value={month || ""}
              onChange={(e) => onMonthChange(e.target.value)}
              disabled={computed.isMonthYearDisabled}
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

        {/* 📅 Ano - apenas se showQuickFilters=false */}
        {showMonthYear && !showQuickFilters && year !== undefined && availableYears.length > 0 && (
          <div className="filter-item">
            <label htmlFor="year">Ano</label>
            <select
              id="year"
              value={year || ""}
              onChange={(e) => onYearChange(e.target.value)}
              disabled={computed.isMonthYearDisabled}
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

      {/* Ações - apenas se não estiver usando quick filters */}
      {!showQuickFilters && (
        <div className="filters-actions">
          <button
            type="button"
            onClick={handlers.handleReset}
            className="btn btn-ghost"
            title="Limpar todos os filtros"
          >
            <RotateCcw size={16} />
            <span>Limpar filtros</span>
          </button>
          
          {/* Ações extras (expandir/contrair, etc) */}
          {extraActions}
        </div>
      )}

      {/* Info Badge quando há filtro de data */}
      {computed.hasDateRange && dateFrom && dateTo && (
        <div className="filter-info">
          <span className="info-badge">
            <Calendar size={14} aria-hidden="true" />
            Exibindo dados de {new Date(dateFrom + 'T00:00:00').toLocaleDateString("pt-BR")} até{" "}
            {new Date(dateTo + 'T00:00:00').toLocaleDateString("pt-BR")}
          </span>
        </div>
      )}
    </div>
  );
}