// ============================================
// 📁 src/components/dashboard/DetailsSummary/DetailsSummary.jsx
// Componente para mostrar métricas detalhadas com barras de progresso
// ============================================
import React from "react";
import "./DetailsSummary.css";

export default function DetailsSummary({
  newPatients = 0,
  newPatientsTotal = 0,
  messagesSent = 0,
  messagesSentTotal = 0,
  noShow = 0,
  noShowTotal = 0,
  cancelled = 0,
  cancelledTotal = 0,
}) {
  const items = [
    {
      label: "Novos pacientes",
      current: newPatients,
      total: newPatientsTotal,
      color: "blue",
    },
    {
      label: "Mensagens enviadas",
      current: messagesSent,
      total: messagesSentTotal,
      color: "orange",
    },
    {
      label: "Não compareceram",
      current: noShow,
      total: noShowTotal,
      color: "red",
    },
    {
      label: "Cancelados",
      current: cancelled,
      total: cancelledTotal,
      color: "gray",
    },
  ];

  return (
    <div className="details-summary-card">
      <h3 className="standardized-h3">Mais detalhes</h3>
      <div className="details-list">
        {items.map((item, index) => {
          const percentage = item.total > 0 ? (item.current / item.total) * 100 : 0;
          return (
            <div className="detail-item" key={item.label}>
              <div className="detail-row">
                <span className="detail-label">{item.label}</span>
                <div className="detail-progress-bar">
                  <div
                    className={`detail-progress-fill ${item.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="detail-value">
                  <span className="detail-current">{item.current}</span>
                  <span className="detail-separator">/</span>
                  <span className="detail-total">{item.total}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
