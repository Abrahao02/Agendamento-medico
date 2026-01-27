// ============================================
// 📁 src/hooks/dashboard/useDashboard.js
// Hook principal que orquestra os hooks especializados
// ============================================

import { useMemo } from "react";
import { useDashboardData } from "./useDashboardData";
import { useDashboardFilters } from "./useDashboardFilters";
import { useDashboardStats } from "./useDashboardStats";
import { useDashboardCharts } from "./useDashboardCharts";
import { useExpenses } from "../expenses/useExpenses";
import { auth } from "../../services/firebase";

export const useDashboard = () => {
  const user = auth.currentUser;

  // Fetch de dados
  const {
    loading,
    doctorSlug,
    appointments,
    availability,
    patients,
    isLimitReached,
    doctorConfig,
  } = useDashboardData();

  // Fetch de gastos
  const { expenses, loading: loadingExpenses } = useExpenses(user?.uid);

  // Extrair locations disponíveis do doctorConfig
  const availableLocations = useMemo(() => {
    return doctorConfig?.appointmentTypeConfig?.locations || [];
  }, [doctorConfig]);

  // Gerenciamento de filtros
  const {
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
  } = useDashboardFilters();

  // Cálculos de estatísticas
  const {
    stats,
    statusSummary,
    detailsSummary,
    filteredAppointments,
    filteredAvailability,
    filteredExpenses,
    financialForecast,
    financialBreakdown,
    previousMonthsSummary,
    futureMonthsComparison,
  } = useDashboardStats({
    appointments,
    availability,
    patients,
    expenses,
    filterOptions,
  });

  // Transformação para gráficos
  const {
    chartData,
    upcomingAppointments,
    financialChartData,
    monthlyData,
  } = useDashboardCharts({
    filteredAppointments,
    patients,
    appointments,
  });

  return {
    loading: loading || loadingExpenses,
    doctorSlug,
    stats,
    statusSummary,
    detailsSummary,
    chartData,
    upcomingAppointments,
    financialChartData,
    monthlyData,
    availableYears,
    selectedDateFrom,
    selectedDateTo,
    selectedMonth,
    selectedYear,
    selectedLocation,
    availableLocations,
    setSelectedDateFrom,
    setSelectedDateTo,
    setSelectedMonth,
    setSelectedYear,
    setSelectedLocation,
    resetFilters,
    isLimitReached,
    filteredAppointments,
    filteredAvailability,
    patients,
    expenses: filteredExpenses,
    financialForecast,
    financialBreakdown,
    previousMonthsSummary,
    futureMonthsComparison,
  };
};
