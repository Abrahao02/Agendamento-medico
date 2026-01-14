// ============================================
// 📁 src/components/dashboard/MonthlyComparison/MonthlyComparison.jsx
// Comparativo mensal financeiro em formato de lista
// ============================================
import React from "react";
import "./MonthlyComparison.css";

export default function MonthlyComparison({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="monthly-comparison">
        <h3 className="comparison-title">COMPARATIVO MENSAL</h3>
        <div className="comparison-empty">
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monthly-comparison">
      <h3 className="comparison-title">COMPARATIVO MENSAL</h3>
      <div className="comparison-list">
        {data.map((month, index) => (
          <div className="comparison-item" key={month.key}>
            <span className="month-name">{month.name}</span>
            <span className="month-value">R$ {month.revenue.toFixed(2)}</span>
            {month.trend && (
              <span className={`trend-icon ${month.trend}`}>
                {month.trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
