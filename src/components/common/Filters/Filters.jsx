// src/components/common/Filters/Filters.jsx
import React, { useState, useEffect, useRef } from "react";
import { Calendar, RotateCcw, Search } from "lucide-react";
import DateRangePicker from "../DateRangePicker";
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
  const hasDateRange = dateFrom && dateTo;
  const isMonthYearDisabled = hasDateRange;

  // Estado para rastrear qual filtro rápido está ativo
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);
  
  // Estado para controlar dropdown do calendário
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Ref para detectar clique fora do dropdown
  const pickerWrapperRef = useRef(null);

  // Detecta qual filtro está ativo baseado nas datas
  useEffect(() => {
    if (!showQuickFilters) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Verifica se é "Hoje"
    if (dateFrom === todayStr && dateTo === todayStr) {
      setActiveQuickFilter('today');
      return;
    }

    // Verifica se é "Esta semana"
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    if (dateFrom === monday.toISOString().split('T')[0] && 
        dateTo === sunday.toISOString().split('T')[0]) {
      setActiveQuickFilter('week');
      return;
    }

    // Verifica se é "Este mês"
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    if (dateFrom === firstDay.toISOString().split('T')[0] && 
        dateTo === lastDay.toISOString().split('T')[0]) {
      setActiveQuickFilter('month');
      return;
    }

    // Se tem range personalizado (e não é hoje), marca como custom
    if (hasDateRange && (dateFrom !== todayStr || dateTo !== todayStr)) {
      // Verifica se não é semana nem mês atual
      const isCurrentWeek = dateFrom === monday.toISOString().split('T')[0] && 
                            dateTo === sunday.toISOString().split('T')[0];
      const isCurrentMonth = dateFrom === firstDay.toISOString().split('T')[0] && 
                             dateTo === lastDay.toISOString().split('T')[0];
      
      if (!isCurrentWeek && !isCurrentMonth) {
        setActiveQuickFilter('custom');
        return;
      }
    }

    // Se não corresponde a nenhum, limpa
    setActiveQuickFilter(null);
  }, [dateFrom, dateTo, showQuickFilters, hasDateRange]);

  // Handlers para filtros rápidos
  const handleToday = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    onDateFromChange(todayStr);
    onDateToChange(todayStr);
    if (onMonthChange) onMonthChange(today.getMonth() + 1);
    if (onYearChange) onYearChange(today.getFullYear());
    setActiveQuickFilter('today');
  };

  const handleThisWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Segunda-feira
    const monday = new Date(today);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    onDateFromChange(monday.toISOString().split('T')[0]);
    onDateToChange(sunday.toISOString().split('T')[0]);
    if (onMonthChange) onMonthChange(today.getMonth() + 1);
    if (onYearChange) onYearChange(today.getFullYear());
    setActiveQuickFilter('week');
  };

  const handleThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    onDateFromChange(firstDay.toISOString().split('T')[0]);
    onDateToChange(lastDay.toISOString().split('T')[0]);
    if (onMonthChange) onMonthChange(today.getMonth() + 1);
    if (onYearChange) onYearChange(today.getFullYear());
    setActiveQuickFilter('month');
  };

  const handleCustom = () => {
    const willOpen = !isDatePickerOpen;
    setIsDatePickerOpen(prev => !prev);
    
    // Se estava fechado e agora vai abrir, limpa as datas e marca como custom
    if (willOpen) {
      // Limpa as datas para permitir nova seleção
      onDateFromChange("");
      onDateToChange("");
      setActiveQuickFilter('custom');
    }
    // Se estava aberto e agora vai fechar, mantém custom (já que tem range selecionado)
  };

  // Detectar clique fora do dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerWrapperRef.current && !pickerWrapperRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  // Handler para reset
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    setIsDatePickerOpen(false);
    // O activeQuickFilter será atualizado automaticamente pelo useEffect quando as datas mudarem
  };

  return (
    <div className="filters-container" role="region" aria-label="Filtros">
      {/* Título padronizado */}
      {showQuickFilters && (
        <h3 className="standardized-h3">Selecionar filtro</h3>
      )}
      
      {/* Botões rápidos de filtro */}
      {showQuickFilters && (
        <div className="quick-filters-wrapper" ref={pickerWrapperRef}>
          <div className="quick-filters-row">
            <div className="quick-filters">
              <button
                type="button"
                onClick={handleToday}
                className={`quick-filter-btn ${activeQuickFilter === 'today' ? 'active' : ''}`}
                aria-label="Filtrar para hoje"
                aria-pressed={activeQuickFilter === 'today'}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={handleThisWeek}
                className={`quick-filter-btn ${activeQuickFilter === 'week' ? 'active' : ''}`}
                aria-label="Filtrar para esta semana"
                aria-pressed={activeQuickFilter === 'week'}
              >
                Esta semana
              </button>
              <button
                type="button"
                onClick={handleThisMonth}
                className={`quick-filter-btn ${activeQuickFilter === 'month' ? 'active' : ''}`}
                aria-label="Filtrar para este mês"
                aria-pressed={activeQuickFilter === 'month'}
              >
                Este mês
              </button>
              <div className="quick-filter-custom-wrapper">
                <button
                  type="button"
                  onClick={handleCustom}
                  className={`quick-filter-btn ${activeQuickFilter === 'custom' ? 'active' : ''}`}
                  aria-label="Filtro personalizado"
                  aria-pressed={activeQuickFilter === 'custom'}
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
                  isOpen={isDatePickerOpen}
                  onClose={() => setIsDatePickerOpen(false)}
                />
              </div>
            </div>
            
            {/* Botão Limpar filtros à direita */}
            {onReset && (
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost clear-filters-btn"
                title="Limpar todos os filtros"
              >
                <RotateCcw size={16} />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>
        </div>
      )}

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

        {/* 📅 Ano - apenas se showQuickFilters=false */}
        {showMonthYear && !showQuickFilters && year !== undefined && availableYears.length > 0 && (
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

      {/* Ações - apenas se não estiver usando quick filters */}
      {!showQuickFilters && (
        <div className="filters-actions">
          <button
            type="button"
            onClick={handleReset}
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
      {hasDateRange && dateFrom && dateTo && (
        <div className="filter-info">
          <span className="info-badge">
            📅 Exibindo dados de {new Date(dateFrom + 'T00:00:00').toLocaleDateString("pt-BR")} até{" "}
            {new Date(dateTo + 'T00:00:00').toLocaleDateString("pt-BR")}
          </span>
        </div>
      )}
    </div>
  );
}