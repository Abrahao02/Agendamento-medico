// src/pages/Dashboard/Dashboard.jsx
import React, { useEffect } from "react";
import { auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";

// Hook
import { useDashboard } from "../hooks/dashboard/useDashboard";

// Components
import PublicLinkCard from "../components/dashboard/PublicLinkCard";
import Filters from "../components/common/Filters/Filters";
import StatsCard from "../components/dashboard/StatsCard";
import StatusSummary from "../components/dashboard/StatusSummary";
import AppointmentsChart from "../components/dashboard/AppointmentsChart";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import LoadingFallback from "../components/common/LoadingFallback/LoadingFallback";

import "./Dashboard.css";

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  // ✅ USA O HOOK CUSTOMIZADO
  const {
    doctorSlug,
    loadingData,
    selectedDateFrom,
    selectedDateTo,
    selectedMonth,
    selectedYear,
    setSelectedDateFrom,
    setSelectedDateTo,
    setSelectedMonth,
    setSelectedYear,
    handleResetFilters,
    availableYears,
    stats,
    statusSummary,
    chartData,
    upcomingAppointments,
  } = useDashboard(user);

  /* ==============================
     AUTH PROTECTION
  ============================== */
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  /* ==============================
     LOADING STATE
  ============================== */
  if (loading || loadingData) {
    return <LoadingFallback message="Carregando agenda..." />
  }

  /* ==============================
     RENDER
  ============================== */
  return (
    <div className="dashboard-content">

      {/* Header */}
      <div className="padrao-header">
        <div className="label">Visão Geral</div>
        <h2>Painel de Controle</h2>
        <p>Acompanhe consultas, faturamento e disponibilidade em tempo real</p>
      </div>

      {/* Public Link */}
      <PublicLinkCard slug={doctorSlug} />

      {/* Filtros */}
      <Filters
        dateFrom={selectedDateFrom}
        dateTo={selectedDateTo}
        month={selectedMonth}
        year={selectedYear}
        onDateFromChange={setSelectedDateFrom}
        onDateToChange={setSelectedDateTo}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onReset={handleResetFilters}
        availableYears={availableYears}
        
        // Config: Dashboard não usa busca nem status
        showSearch={false}
        showStatus={false}
        showDateRange={true}
        showMonthYear={true}
      />

      {/* Stats Grid */}
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

      {/* Status Summary */}
      <StatusSummary
        confirmed={statusSummary.Confirmado}
        pending={statusSummary.Pendente}
        missed={statusSummary["Não Compareceu"]}
      />

      {/* Charts Section */}
      <div className="charts-section">
        <AppointmentsChart data={chartData} />
        <UpcomingAppointments appointments={upcomingAppointments} />
      </div>
    </div>
  );
}