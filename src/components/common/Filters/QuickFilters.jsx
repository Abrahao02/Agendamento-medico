// ============================================
// 📁 src/components/common/Filters/QuickFilters.jsx
// Responsabilidade: Filtros rápidos (hoje, semana, mês, personalizado)
// ============================================

import React from "react";
import { RotateCcw } from "lucide-react";
import Button from "../Button";
import DateRangePicker from "../DateRangePicker";
import "./Filters.css";

export default function QuickFilters({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
  state,
  refs,
  handlers,
}) {
  return (
    // eslint-disable-next-line react-hooks/refs
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
  );
}
