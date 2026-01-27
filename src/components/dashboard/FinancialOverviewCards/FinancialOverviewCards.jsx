// ============================================
// 📁 src/components/dashboard/FinancialOverviewCards/FinancialOverviewCards.jsx
// BLOCO 1 - 3 cards principais de visão geral financeira
// ============================================

import React from "react";
import { DollarSign, Clock, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import StatsCard from "../StatsCard";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import "./FinancialOverviewCards.css";

export default function FinancialOverviewCards({
  received = 0,
  toReceive = 0,
  atRisk = 0,
  totalExpenses = 0,
  netIncome = 0,
}) {
  return (
    <div className="financial-overview-cards">
      <StatsCard
        icon={DollarSign}
        value={formatCurrency(received)}
        title="Recebido"
        subtitle="Consultas pagas"
        color="green"
      />
      <StatsCard
        icon={Clock}
        value={formatCurrency(toReceive)}
        title="A receber"
        subtitle="Confirmadas futuras"
        color="blue"
      />
      <StatsCard
        icon={AlertTriangle}
        value={formatCurrency(atRisk)}
        title="Em risco"
        subtitle="Pendentes / faltas"
        color="amber"
      />
      <StatsCard
        icon={TrendingDown}
        value={formatCurrency(totalExpenses)}
        title="Gastos"
        subtitle="Despesas do período"
        color="red"
      />
      <StatsCard
        icon={netIncome >= 0 ? TrendingUp : TrendingDown}
        value={formatCurrency(netIncome)}
        title="Lucro Líquido"
        subtitle="Recebido - Gastos"
        color={netIncome >= 0 ? "green" : "red"}
      />
    </div>
  );
}
