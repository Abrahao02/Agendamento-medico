// ============================================
// 📁 src/components/dashboard/FinancialView.jsx
// Visualização Financeiro (Strategy Pattern) - REFATORADO
// ============================================

import React from "react";
import FinancialOverviewCards from "./FinancialOverviewCards";
import FinancialForecast from "./FinancialForecast";
import FinancialTimeline from "./FinancialTimeline";
import PreviousMonthsSummary from "./PreviousMonthsSummary";
import FutureMonthsComparison from "./FutureMonthsComparison";
import "./FinancialView.css";

export default function FinancialView({
  stats,
  financialForecast = {},
  previousMonthsSummary = {},
  futureMonthsComparison = {},
}) {
  return (
    <>
      {/* BLOCO 1 - Visão geral (3 cards principais) */}
      <FinancialOverviewCards
        received={stats.revenueRealized || 0}
        toReceive={stats.revenuePredicted || 0}
        atRisk={stats.revenueAtRisk || 0}
      />

      {/* Layout em grid para os outros blocos */}
      <div className="financial-content-grid">
        {/* BLOCO 2 - Previsão financeira do período */}
        <FinancialForecast
          confirmed={financialForecast.confirmed || 0}
          pending={financialForecast.pending || 0}
          noShow={financialForecast.noShow || 0}
          total={financialForecast.total || 0}
        />

        {/* BLOCO 3 - Linha do tempo financeira */}
        <FinancialTimeline
          realized={stats.revenueRealized || 0}
          toReceive={stats.revenuePredicted || 0}
        />
      </div>

      {/* BLOCO 4 - Comparação mensal (passado e futuro) */}
      <div className="financial-breakdown-grid">
        <PreviousMonthsSummary
          months={previousMonthsSummary.months || []}
          totals={previousMonthsSummary.totals || { received: 0, noShow: 0, total: 0 }}
        />
        <FutureMonthsComparison
          months={futureMonthsComparison.months || []}
          totals={futureMonthsComparison.totals || { confirmed: 0, pending: 0, total: 0 }}
        />
      </div>
    </>
  );
}
