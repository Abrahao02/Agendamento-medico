// ============================================
// 📁 src/components/common/Filters/Filters.jsx
// Componente orquestrador que usa os componentes especializados
// Props agrupadas em objetos contextuais (ISP)
// ============================================

import React from "react";
import { Calendar, RotateCcw } from "lucide-react";
import { useFilters } from "../../../hooks/common/useFilters";
import SearchFilter from "./SearchFilter";
import StatusFilter from "./StatusFilter";
import DateRangeFilter from "./DateRangeFilter";
import MonthYearFilter from "./MonthYearFilter";
import QuickFilters from "./QuickFilters";
import "./Filters.css";

export default function Filters({
  // Props agrupadas (ISP)
  search = null,
  status = null,
  dateRange = null,
  monthYear = null,
  quickFilters = null,
  
  // Ações
  onReset,
  extraActions = null,
  
  // Config
  showSearch = false,
  showStatus = false,
  showDateRange = true,
  showMonthYear = true,
  showQuickFilters = false,
}) {
  // Extrair valores das props agrupadas ou usar valores individuais (compatibilidade)
  const searchTerm = search?.term;
  const onSearchChange = search?.onChange;
  const searchPlaceholder = search?.placeholder || "Buscar...";
  
  const statusFilter = status?.filter;
  const onStatusChange = status?.onChange;
  const statusOptions = status?.options || [];
  
  const dateFrom = dateRange?.from;
  const dateTo = dateRange?.to;
  const onDateFromChange = dateRange?.onChange?.from || dateRange?.onChange;
  const onDateToChange = dateRange?.onChange?.to || dateRange?.onChange;
  
  const month = monthYear?.month;
  const year = monthYear?.year;
  const onMonthChange = monthYear?.onChange?.month || monthYear?.onChange;
  const onYearChange = monthYear?.onChange?.year || monthYear?.onChange;
  const availableYears = monthYear?.availableYears || [];

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
        <QuickFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
          onReset={onReset}
          state={state}
          refs={refs}
          handlers={handlers}
        />
      )}

      <div className="filters-grid">
        {/* 🔍 Busca (opcional) */}
        {showSearch && searchTerm !== undefined && (
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        )}

        {/* 📊 Status (opcional) */}
        {showStatus && statusFilter !== undefined && (
          <StatusFilter
            statusFilter={statusFilter}
            onStatusChange={onStatusChange}
            statusOptions={statusOptions}
          />
        )}

        {/* 📅 Data De/Até - apenas se showQuickFilters=false */}
        {showDateRange && !showQuickFilters && (
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
          />
        )}

        {/* 📆 Mês/Ano - apenas se showQuickFilters=false */}
        {showMonthYear && !showQuickFilters && (
          <MonthYearFilter
            month={month}
            year={year}
            onMonthChange={onMonthChange}
            onYearChange={onYearChange}
            availableYears={availableYears}
            isDisabled={computed.isMonthYearDisabled}
          />
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
