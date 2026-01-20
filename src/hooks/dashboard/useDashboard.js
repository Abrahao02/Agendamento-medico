// ============================================
// 📁 src/hooks/dashboard/useDashboard.js
// Hook principal que orquestra os hooks especializados
// ============================================

import { useDashboardData } from "./useDashboardData";
import { useDashboardFilters } from "./useDashboardFilters";
import { useDashboardStats } from "./useDashboardStats";
import { useDashboardCharts } from "./useDashboardCharts";

export const useDashboard = () => {
  // Fetch de dados
  const {
    loading,
    doctorSlug,
    appointments,
    availability,
    patients,
    isLimitReached,
  } = useDashboardData();

  // Gerenciamento de filtros
  const {
    selectedDateFrom,
    selectedDateTo,
    selectedMonth,
    selectedYear,
    availableYears,
    filterOptions,
    setSelectedDateFrom,
    setSelectedDateTo,
    setSelectedMonth,
    setSelectedYear,
    resetFilters,
  } = useDashboardFilters();

  // Cálculos de estatísticas
  const {
    stats,
    statusSummary,
    detailsSummary,
    filteredAppointments,
    filteredAvailability,
    financialForecast,
    financialBreakdown,
  } = useDashboardStats({
    appointments,
    availability,
    patients,
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
    loading,
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
    setSelectedDateFrom,
    setSelectedDateTo,
    setSelectedMonth,
    setSelectedYear,
    resetFilters,
    isLimitReached,
    filteredAppointments,
    filteredAvailability,
    patients,
    financialForecast,
    financialBreakdown,
  };
};
