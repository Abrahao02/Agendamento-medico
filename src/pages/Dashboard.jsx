// ============================================
// 📁 src/pages/Dashboard.jsx - REFATORADO
// Dividido em visualizações Cliente e Financeiro
// ============================================
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, DollarSign, Clock, UserPlus, CheckCircle } from "lucide-react";

import { useDashboard } from "../hooks/dashboard/useDashboard";

import PageHeader from "../components/common/PageHeader/PageHeader";
import PublicLinkCard from "../components/dashboard/PublicLinkCard";
import Filters from "../components/common/Filters/Filters";
import LimitWarningBanner from "../components/common/LimitWarningBanner/LimitWarningBanner";
import StatsCard from "../components/dashboard/StatsCard";
import StatusSummary from "../components/dashboard/StatusSummary";
import DetailsSummary from "../components/dashboard/DetailsSummary";
import AppointmentsChart from "../components/dashboard/AppointmentsChart";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import FinancialChart from "../components/dashboard/FinancialChart";
import MonthlyComparison from "../components/dashboard/MonthlyComparison";
import ContentLoading from "../components/common/ContentLoading/ContentLoading";

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("pacientes");

  const {
    loading,
    doctorSlug,
    stats,
    statusSummary,
    detailsSummary,
    chartData,
    upcomingAppointments,
    financialChartData,
    monthlyData,
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
    isLimitReached,
  } = useDashboard();

  if (loading) return <ContentLoading message="Carregando dashboard..." height={400} />;

  return (
    <div className="dashboard-page-content">
      <PageHeader
        label="Home"
        title="Painel de Controle"
        description="Acompanhe consultas, faturamento e disponibilidade em tempo real"
      />

      {isLimitReached && <LimitWarningBanner />}

      <PublicLinkCard slug={doctorSlug} isLimitReached={isLimitReached} />

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`view-toggle-btn ${viewMode === "pacientes" ? "active" : ""}`}
          onClick={() => setViewMode("pacientes")}
          aria-label="Visualização Pacientes & Agenda"
          aria-pressed={viewMode === "pacientes"}
        >
          Pacientes & Agenda
        </button>
        <button
          className={`view-toggle-btn ${viewMode === "financeiro" ? "active" : ""}`}
          onClick={() => setViewMode("financeiro")}
          aria-label="Visualização Financeiro"
          aria-pressed={viewMode === "financeiro"}
        >
          Financeiro
        </button>
      </div>

      <Filters
        dateFrom={selectedDateFrom}
        dateTo={selectedDateTo}
        onDateFromChange={setSelectedDateFrom}
        onDateToChange={setSelectedDateTo}
        onReset={resetFilters}
        showSearch={false}
        showStatus={false}
        showQuickFilters
      />

      {viewMode === "pacientes" ? (
        <>
          {/* Visualização Pacientes & Agenda */}
          <div className="stats-grid patients-view">
            <StatsCard
              icon={CheckCircle}
              value={statusSummary.confirmed}
              title="Confirmados"
              subtitle="Consultas confirmadas"
              color="blue"
              onClick={() => navigate("/dashboard/allappointments")}
              comparison={stats.confirmedComparison}
            />
            <StatsCard
              icon={Clock}
              value={statusSummary.pending}
              title="Pendentes"
              subtitle="Novas solicitações"
              color="amber"
              onClick={() => navigate("/dashboard/allappointments")}
              comparison={stats.pendingComparison}
            />
            <StatsCard
              icon={Clock}
              value={stats.slotsOpen}
              title="Horários disponíveis"
              subtitle="Livres para agendamento"
              color="green"
              onClick={() => navigate("/dashboard/availability")}
            />
            <StatsCard
              icon={Calendar}
              value={stats.totalAppointments}
              title="Total de agendamentos"
              subtitle="Horários ocupados"
              color="purple"
              onClick={() => navigate("/dashboard/allappointments")}
            />
          </div>

          {/* Charts - Layout 50/50 */}
          <div className="charts-section patients-view">
            <DetailsSummary
              newPatients={detailsSummary.newPatients}
              newPatientsTotal={detailsSummary.newPatientsTotal}
              messagesSent={detailsSummary.messagesSent}
              messagesSentTotal={detailsSummary.messagesSentTotal}
              noShow={detailsSummary.noShow}
              noShowTotal={detailsSummary.noShowTotal}
              cancelled={detailsSummary.cancelled}
              cancelledTotal={detailsSummary.cancelledTotal}
            />
            <UpcomingAppointments appointments={upcomingAppointments} />
          </div>
        </>
      ) : (
        <>
          {/* Visualização Financeiro */}
          <div className="stats-grid">
            <StatsCard
              icon={DollarSign}
              value={`R$ ${stats.revenueRealized.toFixed(2)}`}
              title="Faturamento realizado"
              subtitle="Consultas já realizadas"
              color="green"
            />
            <StatsCard
              icon={DollarSign}
              value={`R$ ${stats.revenuePredicted.toFixed(2)}`}
              title="Faturamento previsto"
              subtitle="Consultas confirmadas futuras"
              color="blue"
              comparison={stats.monthlyFinancialComparison}
            />
            <StatsCard
              icon={Users}
              value={`R$ ${stats.averageTicket}`}
              title="Ticket médio"
              subtitle="Por paciente"
              color="purple"
            />
            {stats.newPatientsRevenue > 0 && (
              <StatsCard
                icon={UserPlus}
                value={`R$ ${stats.newPatientsRevenue.toFixed(2)}`}
                title="Receita de novos pacientes"
                subtitle={`${stats.newPatientsRevenuePercent}% do faturamento`}
                color="amber"
              />
            )}
          </div>

          {/* Financial Chart and Monthly Comparison */}
          <div className="charts-section financial-view">
            <FinancialChart data={financialChartData} />
            {monthlyData && monthlyData.length > 0 && (
              <MonthlyComparison data={monthlyData} />
            )}
          </div>
        </>
      )}
    </div>
  );
}