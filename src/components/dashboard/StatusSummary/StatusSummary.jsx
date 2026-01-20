// ============================================
// 📁 src/components/dashboard/StatusSummary/StatusSummary.jsx - MELHORADO
// Agora com 3 grupos de status
// ============================================
import React from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import "./StatusSummary.css";

export default function StatusSummary({ 
  confirmed = 0, 
  pending = 0, 
  cancelled = 0,
  noShow = 0,
  percentages = { confirmed: 0, pending: 0, cancelled: 0, noShow: 0 }
}) {
  const items = [
    {
      count: confirmed,
      label: "Confirmados",
      color: "confirmed",
      percentage: percentages.confirmed,
    },
    {
      count: pending,
      label: "Pendentes",
      color: "pending",
      percentage: percentages.pending,
    },
    {
      count: cancelled,
      label: "Cancelados",
      color: "cancelled",
      percentage: percentages.cancelled,
    },
    {
      count: noShow,
      label: "No-show",
      color: "no-show",
      percentage: percentages.noShow,
    },
  ];

  return (
    <div className="status-summary-horizontal">
      <h3 className="status-title">STATUS DOS AGENDAMENTOS</h3>
      <div className="status-bars">
        {items.map((item) => (
          <div className="status-bar-item" key={item.label}>
            <div className="status-bar-label">
              <span>{item.label}</span>
              <span className="status-count">{item.count}</span>
            </div>
            <div className="status-bar-container">
              <div 
                className={`status-bar ${item.color}`} 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}