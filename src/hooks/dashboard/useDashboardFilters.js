// ============================================
// 📁 src/hooks/dashboard/useDashboardFilters.js
// Responsabilidade: Gerenciamento de filtros
// ============================================

import { useState, useMemo, useCallback } from "react";
import { formatDateToQuery } from "../../utils/filters/dateFilters";
import { generateYearRange } from "../../utils/helpers/yearHelpers";

export const useDashboardFilters = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  // Calcula primeiro e último dia do mês atual para estado inicial
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1);
  };
  
  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0);
  };
  
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const lastDayOfMonth = getLastDayOfMonth(currentYear, currentMonth);
  const defaultDateFrom = formatDateToQuery(firstDayOfMonth);
  const defaultDateTo = formatDateToQuery(lastDayOfMonth);

  // Inicializa com o mês atual por padrão
  const [selectedDateFrom, setSelectedDateFrom] = useState(defaultDateFrom);
  const [selectedDateTo, setSelectedDateTo] = useState(defaultDateTo);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedLocation, setSelectedLocation] = useState("all");

  const availableYears = useMemo(() => generateYearRange(1), []);

  const resetFilters = useCallback(() => {
    // Reseta para "Este mês" (primeiro e último dia do mês atual)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const lastDay = getLastDayOfMonth(currentYear, currentMonth);
    setSelectedDateFrom(formatDateToQuery(firstDay));
    setSelectedDateTo(formatDateToQuery(lastDay));
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setSelectedLocation("all");
  }, [currentMonth, currentYear]);

  const filterOptions = useMemo(() => ({
    startDate: selectedDateFrom,
    endDate: selectedDateTo,
    selectedMonth,
    selectedYear,
    selectedLocation,
  }), [selectedDateFrom, selectedDateTo, selectedMonth, selectedYear, selectedLocation]);

  return {
    selectedDateFrom,
    selectedDateTo,
    selectedMonth,
    selectedYear,
    selectedLocation,
    availableYears,
    filterOptions,
    setSelectedDateFrom,
    setSelectedDateTo,
    setSelectedMonth,
    setSelectedYear,
    setSelectedLocation,
    resetFilters,
  };
};
