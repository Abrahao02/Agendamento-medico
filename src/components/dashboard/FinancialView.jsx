// ============================================
// 📁 src/components/dashboard/FinancialView.jsx
// Visualização Financeiro (Strategy Pattern)
// ============================================

import React from "react";
import { DollarSign, Users, UserPlus } from "lucide-react";
import StatsCard from "./StatsCard";
import FinancialChart from "./FinancialChart";
import MonthlyComparison from "./MonthlyComparison";

export default function FinancialView({
  stats,
  financialChartData,
  monthlyData,
}) {
  return (
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
  );
}
