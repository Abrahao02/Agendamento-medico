// ============================================
// 📁 src/components/dashboard/PatientsView.jsx
// Visualização de Pacientes & Agenda (Strategy Pattern)
// ============================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import StatsCard from "./StatsCard";
import DetailsSummary from "./DetailsSummary";
import UpcomingAppointments from "./UpcomingAppointments";

export default function PatientsView({
  statusSummary,
  stats,
  detailsSummary,
  upcomingAppointments,
}) {
  const navigate = useNavigate();

  return (
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
  );
}
