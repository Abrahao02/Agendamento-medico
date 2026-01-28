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
import LocationFilter from "./LocationFilter";
import "./Filters.css";

export default function Filters({
  // Props agrupadas (ISP)
  search = null,
  status = null,
  dateRange = null,
  monthYear = null,
  
  // Props individuais (compatibilidade - podem ser passadas diretamente)
  searchTerm: searchTermProp,
  onSearchChange: onSearchChangeProp,
  searchPlaceholder: searchPlaceholderProp,
  statusFilter: statusFilterProp,
  onStatusChange: onStatusChangeProp,
  statusOptions: statusOptionsProp,
  dateFrom: dateFromProp,
  dateTo: dateToProp,
  onDateFromChange: onDateFromChangeProp,
  onDateToChange: onDateToChangeProp,
  month: monthProp,
  year: yearProp,
  onMonthChange: onMonthChangeProp,
  onYearChange: onYearChangeProp,
  availableYears: availableYearsProp,
  selectedLocation: selectedLocationProp,
  onLocationChange: onLocationChangeProp,
  availableLocations: availableLocationsProp,

  // Ações
  onReset,
  extraActions = null,

  // Config
  showSearch = false,
  showStatus = false,
  showLocation = false,
  showDateRange = true,
  showMonthYear = true,
  showQuickFilters = false,
  showHeading = true,
}) {
  // Extrair valores das props agrupadas ou usar valores individuais (compatibilidade)
  // Prioriza props individuais se fornecidas, caso contrário usa props agrupadas
  const searchTerm = searchTermProp ?? search?.term;
  const onSearchChange = onSearchChangeProp ?? search?.onChange;
  const searchPlaceholder = searchPlaceholderProp ?? search?.placeholder ?? "Buscar...";
  
  const statusFilter = statusFilterProp ?? status?.filter;
  const onStatusChange = onStatusChangeProp ?? status?.onChange;
  const statusOptions = statusOptionsProp ?? status?.options ?? [];
  
  // Suporta tanto dateRange={from, to, onChange} quanto props individuais
  // Prioriza props individuais primeiro
  const dateFrom = dateFromProp ?? dateRange?.from;
  const dateTo = dateToProp ?? dateRange?.to;
  const onDateFromChange = onDateFromChangeProp ?? dateRange?.onChange?.from ?? dateRange?.onChange;
  const onDateToChange = onDateToChangeProp ?? dateRange?.onChange?.to ?? dateRange?.onChange;
  
  // Garantir que month preserve null quando "Todos" está selecionado
  // Se monthProp for explicitamente passado (mesmo que null), usa ele
  // Caso contrário, tenta usar monthYear?.month
  const month = monthProp !== undefined ? monthProp : monthYear?.month;
  const year = yearProp ?? monthYear?.year;
  const onMonthChange = onMonthChangeProp ?? monthYear?.onChange?.month ?? monthYear?.onChange;
  const onYearChange = onYearChangeProp ?? monthYear?.onChange?.year ?? monthYear?.onChange;
  const availableYears = availableYearsProp ?? monthYear?.availableYears ?? [];

  const selectedLocation = selectedLocationProp;
  const onLocationChange = onLocationChangeProp;
  const availableLocations = availableLocationsProp || [];

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
      {showQuickFilters && showHeading && (
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
          showLocation={showLocation}
          selectedLocation={selectedLocation}
          onLocationChange={onLocationChange}
          availableLocations={availableLocations}
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

        {/* 📍 Local (opcional) */}
        {showLocation && selectedLocation !== undefined && (
          <LocationFilter
            selectedLocation={selectedLocation}
            onLocationChange={onLocationChange}
            availableLocations={availableLocations}
            disabled={false}
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
