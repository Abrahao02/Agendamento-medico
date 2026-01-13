// ============================================
// 📁 src/pages/Dashboard.jsx - MELHORADO
// ============================================
import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, DollarSign, Clock, UserPlus, TrendingUp } from "lucide-react";

import { useDashboard } from "../hooks/dashboard/useDashboard";

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
      <PageHeader
        label="Visão Geral"
        title="Painel de Controle"
        description="Acompanhe consultas, faturamento e disponibilidade em tempo real"
      />

      <PublicLinkCard slug={doctorSlug} />

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

      {/* Stats Grid - Linha 1 */}
      <div className="stats-grid">
        <StatsCard
          icon={Calendar}
          value={stats.totalAppointments}
          title="Total de consultas"
          subtitle="No período selecionado"
          color="green"
          onClick={() => navigate("/dashboard/allappointments")}
          comparison={stats.appointmentsComparison}
        />
        
        <StatsCard
          icon={UserPlus}
          value={stats.newPatients}
          title="Novos pacientes"
          subtitle="Primeiro agendamento"
          color="blue"
          onClick={() => navigate("/dashboard/clients")}
          comparison={stats.newPatientsComparison}
        />
        
        <StatsCard
          icon={Clock}
          value={stats.slotsOpen}
          title="Horários disponíveis"
          subtitle="Slots livres para agendamento"
          color="purple"
          onClick={() => navigate("/dashboard/availability")}
        />
        
        <StatsCard
          icon={TrendingUp}
          value={`${stats.conversionRate}%`}
          title="Taxa de conversão"
          subtitle="Confirmados / Total"
          color="amber"
        />
      </div>

      {/* Stats Grid - Linha 2 */}
      <div className="stats-grid stats-grid-secondary">
        <StatsCard
          icon={DollarSign}
          value={`R$ ${stats.totalRevenue.toFixed(2)}`}
          title="Faturamento previsto"
          subtitle="Consultas confirmadas"
          color="green"
        />
        
        <StatsCard
          icon={Users}
          value={`R$ ${stats.averageTicket}`}
          title="Ticket médio"
          subtitle="Por paciente"
          color="blue"
        />
      </div>

      {/* Status Summary */}
      <StatusSummary
        confirmed={statusSummary.confirmed}
        pending={statusSummary.pending}
        cancelled={statusSummary.cancelled}
        percentages={statusSummary.percentages}
      />

      {/* Charts */}
      <div className="charts-section">
        <AppointmentsChart data={chartData} />
        <UpcomingAppointments appointments={upcomingAppointments} />
      </div>
    </div>
  );
}