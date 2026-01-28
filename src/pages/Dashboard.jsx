// ============================================
// 📁 src/pages/Dashboard.jsx - REFATORADO
// Usa Strategy Pattern para views (OCP)
// ============================================
import React, { useState } from "react";
import { Calendar, Users, DollarSign, Clock, UserPlus, CheckCircle } from "lucide-react";

import { useDashboard } from "../hooks/dashboard/useDashboard";

import PageHeader from "../components/common/PageHeader";
import PublicLinkCard from "../components/dashboard/PublicLinkCard";
import Filters from "../components/common/Filters";
import LimitWarningBanner from "../components/common/LimitWarningBanner";
import Button from "../components/common/Button";
import ContentLoading from "../components/common/ContentLoading";
import PatientsView from "../components/dashboard/PatientsView";
import FinancialView from "../components/dashboard/FinancialView";
import ExpensesView from "../components/dashboard/ExpensesView";

import "./Dashboard.css";

// Strategy Pattern: Map de componentes de view
const VIEW_COMPONENTS = {
  pacientes: PatientsView,
  financeiro: FinancialView,
  gastos: ExpensesView,
};

export default function Dashboard() {
  const [viewMode, setViewMode] = useState("pacientes");

  const {
    loading,
    doctorSlug,
    stats,
    statusSummary,
    detailsSummary,
    upcomingAppointments,
    financialChartData,
    monthlyData,
    expenses,
    selectedDateFrom,
    selectedDateTo,
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
    financialForecast,
    financialBreakdown,
    previousMonthsSummary,
    futureMonthsComparison,
  } = useDashboard();

  if (loading) return <ContentLoading message="Carregando dashboard..." height={400} />;

  // Strategy Pattern: Seleciona componente baseado no viewMode
  const ViewComponent = VIEW_COMPONENTS[viewMode] || VIEW_COMPONENTS.pacientes;

  return (
    <div className="dashboard-page-content">
      <PageHeader
        label="Home"
        title="Painel de Controle"
        description="Acompanhe consultas, faturamento e disponibilidade em tempo real"
      />

      {isLimitReached && <LimitWarningBanner />}

      <PublicLinkCard slug={doctorSlug} isLimitReached={isLimitReached} />

      <Filters
        dateFrom={selectedDateFrom}
        dateTo={selectedDateTo}
        onDateFromChange={setSelectedDateFrom}
        onDateToChange={setSelectedDateTo}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        availableLocations={availableLocations}
        onReset={resetFilters}
        showSearch={false}
        showStatus={false}
        showLocation={true}
        showQuickFilters
      />

      {/* View Toggle */}
      <div className="view-toggle">
        <Button
          type="button"
          size="sm"
          variant={viewMode === "pacientes" ? "primary" : "ghost"}
          onClick={() => setViewMode("pacientes")}
          aria-label="Visualização Pacientes & Agenda"
          aria-pressed={viewMode === "pacientes"}
          className="view-toggle-btn"
        >
          Pacientes & Agenda
        </Button>
        <Button
          type="button"
          size="sm"
          variant={viewMode === "financeiro" ? "primary" : "ghost"}
          onClick={() => setViewMode("financeiro")}
          aria-label="Visualização Financeiro"
          aria-pressed={viewMode === "financeiro"}
          className="view-toggle-btn"
        >
          Financeiro
        </Button>
        <Button
          type="button"
          size="sm"
          variant={viewMode === "gastos" ? "primary" : "ghost"}
          onClick={() => setViewMode("gastos")}
          aria-label="Visualização Gastos"
          aria-pressed={viewMode === "gastos"}
          className="view-toggle-btn"
        >
          Gastos
        </Button>
      </div>

      {/* Strategy Pattern: Renderiza componente selecionado */}
      <ViewComponent
        statusSummary={statusSummary}
        stats={stats}
        detailsSummary={detailsSummary}
        upcomingAppointments={upcomingAppointments}
        financialChartData={financialChartData}
        monthlyData={monthlyData}
        filteredAppointments={filteredAppointments}
        filteredAvailability={filteredAvailability}
        patients={patients}
        expenses={expenses}
        financialForecast={financialForecast}
        financialBreakdown={financialBreakdown}
        previousMonthsSummary={previousMonthsSummary}
        futureMonthsComparison={futureMonthsComparison}
        availableLocations={availableLocations}
        selectedDateFrom={selectedDateFrom}
        selectedDateTo={selectedDateTo}
        selectedLocation={selectedLocation}
        setSelectedDateFrom={setSelectedDateFrom}
        setSelectedDateTo={setSelectedDateTo}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
        setSelectedLocation={setSelectedLocation}
        resetFilters={resetFilters}
      />
    </div>
  );
}
