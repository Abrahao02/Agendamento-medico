import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";

// Hook
import { useDashboard } from "../hooks/dashboard/useDashboard";

// Components
import PageHeader from "../components/common/PageHeader/PageHeader";
import PublicLinkCard from "../components/dashboard/PublicLinkCard";
import Filters from "../components/common/Filters/Filters";
import StatsCard from "../components/dashboard/StatsCard";
import StatusSummary from "../components/dashboard/StatusSummary";
import AppointmentsChart from "../components/dashboard/AppointmentsChart";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import ContentLoading from "../components/common/ContentLoading/ContentLoading";

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    loading,
    doctorSlug,
    stats,
    statusSummary,
    chartData,
    upcomingAppointments,
    selectedDateFrom,
    selectedDateTo,
    selectedMonth,
    selectedYear,
    availableYears,
    setSelectedDateFrom,
    setSelectedDateTo,
    setSelectedMonth,
    setSelectedYear,
    resetFilters,
  } = useDashboard();

  if (loading) return <ContentLoading message="Carregando dashboard..." height={400} />;

  return (
    <div className="dashboard-content">
      {/* Header */}
      <PageHeader
        label="Visão Geral"
        title="Painel de Controle"
        description="Acompanhe consultas, faturamento e disponibilidade em tempo real"
      />

      {/* Public Link */}
      <PublicLinkCard slug={doctorSlug} />

      {/* Filters */}
      <Filters
        dateFrom={selectedDateFrom}
        dateTo={selectedDateTo}
        month={selectedMonth}
        year={selectedYear}
        onDateFromChange={setSelectedDateFrom}
        onDateToChange={setSelectedDateTo}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onReset={resetFilters}
        availableYears={availableYears}
        showSearch={false}
        showStatus={false}
        showDateRange
        showMonthYear
      />

      {/* Stats */}
      <div className="stats-grid">
        <StatsCard
          icon={Clock}
          value={stats.slotsOpen}
          title="Horários disponíveis"
          subtitle="Slots livres para agendamento"
          color="blue"
          onClick={() => navigate("/dashboard/availability")}
        />
        <StatsCard
          icon={Calendar}
          value={stats.totalAppointments}
          title="Total de consultas"
          subtitle="No período selecionado"
          color="green"
          onClick={() => navigate("/dashboard/allappointments")}
        />
        <StatsCard
          icon={DollarSign}
          value={`R$ ${stats.totalRevenue.toFixed(2)}`}
          title="Faturamento previsto"
          subtitle="Consultas confirmadas"
          color="amber"
        />
        <StatsCard
          icon={Users}
          value={`R$ ${stats.averageTicket}`}
          title="Ticket médio"
          subtitle="Por paciente"
          color="purple"
        />
      </div>

      {/* Status */}
      <StatusSummary
        confirmed={statusSummary.Confirmado}
        pending={statusSummary.Pendente}
        missed={statusSummary["Não Compareceu"]}
      />

      {/* Charts */}
      <div className="charts-section">
        <AppointmentsChart data={chartData} />
        <UpcomingAppointments appointments={upcomingAppointments} />
      </div>
    </div>
  );
}
