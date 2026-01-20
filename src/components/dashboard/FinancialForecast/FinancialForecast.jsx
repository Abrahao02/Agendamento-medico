// ============================================
// 📁 src/components/dashboard/FinancialForecast/FinancialForecast.jsx
// BLOCO 2 - Previsão financeira do período com breakdown
// ============================================

import React from "react";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import "./FinancialForecast.css";

export default function FinancialForecast({
  confirmed = 0,
  pending = 0,
  noShow = 0,
  total = 0,
}) {
  const confirmedPercent = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
  const noShowPercent = total > 0 ? Math.round((noShow / total) * 100) : 0;

  return (
    <div className="financial-forecast-card">
      <h3 className="financial-forecast-title">Previsão financeira do período</h3>
      
      <div className="financial-forecast-total">
        <span className="financial-forecast-total-label">Valor total esperado:</span>
        <span className="financial-forecast-total-value">{formatCurrency(total)}</span>
      </div>

      <div className="financial-forecast-breakdown">
        {/* Confirmados */}
        <div className="forecast-item">
          <div className="forecast-item-header">
            <span className="forecast-item-label">Confirmados</span>
            <span className="forecast-item-value">{formatCurrency(confirmed)}</span>
          </div>
          <div className="forecast-progress-bar">
            <div
              className="forecast-progress-fill confirmed"
              style={{ width: `${confirmedPercent}%` }}
            />
          </div>
          <span className="forecast-item-percent">{confirmedPercent}%</span>
        </div>

        {/* Pendentes */}
        <div className="forecast-item">
          <div className="forecast-item-header">
            <span className="forecast-item-label">Pendentes</span>
            <span className="forecast-item-value">{formatCurrency(pending)}</span>
          </div>
          <div className="forecast-progress-bar">
            <div
              className="forecast-progress-fill pending"
              style={{ width: `${pendingPercent}%` }}
            />
          </div>
          <span className="forecast-item-percent">{pendingPercent}%</span>
        </div>

        {/* Não compareceu */}
        <div className="forecast-item">
          <div className="forecast-item-header">
            <span className="forecast-item-label">Não compareceu</span>
            <span className="forecast-item-value">{formatCurrency(noShow)}</span>
          </div>
          <div className="forecast-progress-bar">
            <div
              className="forecast-progress-fill no-show"
              style={{ width: `${noShowPercent}%` }}
            />
          </div>
          <span className="forecast-item-percent">{noShowPercent}%</span>
        </div>
      </div>
    </div>
  );
}
