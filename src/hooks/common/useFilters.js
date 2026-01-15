import { useState, useEffect, useRef, useMemo } from "react";

/**
 * Hook para gerenciar lógica de filtros com suporte a quick filters
 * @param {Object} params - Parâmetros do hook
 * @param {string} params.dateFrom - Data inicial
 * @param {string} params.dateTo - Data final
 * @param {Function} params.onDateFromChange - Callback para mudança de data inicial
 * @param {Function} params.onDateToChange - Callback para mudança de data final
 * @param {Function} params.onMonthChange - Callback para mudança de mês
 * @param {Function} params.onYearChange - Callback para mudança de ano
 * @param {Function} params.onReset - Callback para reset
 * @param {boolean} params.showQuickFilters - Se deve mostrar filtros rápidos
 * @returns {Object} Estado, refs, computed e handlers
 */
export const useFilters = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onMonthChange,
  onYearChange,
  onReset,
  showQuickFilters = false,
}) => {
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const pickerWrapperRef = useRef(null);

  const hasDateRange = useMemo(() => dateFrom && dateTo, [dateFrom, dateTo]);
  const isMonthYearDisabled = hasDateRange;

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
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
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
    
    if (willOpen) {
      onDateFromChange("");
      onDateToChange("");
      setActiveQuickFilter('custom');
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    setIsDatePickerOpen(false);
  };

  return {
    state: {
      activeQuickFilter,
      isDatePickerOpen,
    },
    refs: {
      pickerWrapperRef,
    },
    computed: {
      hasDateRange,
      isMonthYearDisabled,
    },
    handlers: {
      setIsDatePickerOpen,
      handleToday,
      handleThisWeek,
      handleThisMonth,
      handleCustom,
      handleReset,
    },
  };
};
