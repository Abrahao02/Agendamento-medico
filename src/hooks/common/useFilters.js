import { useState, useEffect, useRef, useMemo } from "react";
import { formatDateToQuery } from "../../utils/filters/dateFilters";

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
    if (!dateFrom || !dateTo) {
      setActiveQuickFilter(null);
      return;
    }

    const today = new Date();
    const todayStr = formatDateToQuery(today);
    
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
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    const mondayStr = formatDateToQuery(monday);
    const sundayStr = formatDateToQuery(sunday);
    
    if (dateFrom === mondayStr && dateTo === sundayStr) {
      setActiveQuickFilter('week');
      return;
    }

    // Verifica se é "Este mês"
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    const firstDayStr = formatDateToQuery(firstDay);
    const lastDayStr = formatDateToQuery(lastDay);
    
    if (dateFrom === firstDayStr && dateTo === lastDayStr) {
      setActiveQuickFilter('month');
      return;
    }

    // Se tem range personalizado (e não é hoje, semana ou mês), marca como custom
    if (hasDateRange) {
      const isCurrentWeek = dateFrom === mondayStr && dateTo === sundayStr;
      const isCurrentMonth = dateFrom === firstDayStr && dateTo === lastDayStr;
      
      if (!isCurrentWeek && !isCurrentMonth && dateFrom !== todayStr) {
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
    const todayStr = formatDateToQuery(today);
    if (onDateFromChange) onDateFromChange(todayStr);
    if (onDateToChange) onDateToChange(todayStr);
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
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    if (onDateFromChange) onDateFromChange(formatDateToQuery(monday));
    if (onDateToChange) onDateToChange(formatDateToQuery(sunday));
    if (onMonthChange) onMonthChange(today.getMonth() + 1);
    if (onYearChange) onYearChange(today.getFullYear());
    setActiveQuickFilter('week');
  };

  const handleThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    if (onDateFromChange) onDateFromChange(formatDateToQuery(firstDay));
    if (onDateToChange) onDateToChange(formatDateToQuery(lastDay));
    if (onMonthChange) onMonthChange(today.getMonth() + 1);
    if (onYearChange) onYearChange(today.getFullYear());
    setActiveQuickFilter('month');
  };

  const handleCustom = () => {
    const willOpen = !isDatePickerOpen;
    setIsDatePickerOpen(prev => !prev);
    setActiveQuickFilter('custom');
    
    // Sempre reseta as datas ao clicar em Personalizado
    if (willOpen) {
      if (onDateFromChange) onDateFromChange("");
      if (onDateToChange) onDateToChange("");
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
