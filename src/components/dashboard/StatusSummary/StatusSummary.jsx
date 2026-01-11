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
  percentages = { confirmed: 0, pending: 0, cancelled: 0 }
}) {
  const total = confirmed + pending + cancelled;

  const items = [
    {
      icon: CheckCircle,
      count: confirmed,
      label: "Confirmados",
      sublabel: "Agendamentos confirmados",
      color: "confirmed",
      percentage: percentages.confirmed,
    },
    {
      icon: Clock,
      count: pending,
      label: "Pendentes",
      sublabel: "Aguardando confirmação",
      color: "pending",
      percentage: percentages.pending,
    },
    {
      icon: XCircle,
      count: cancelled,
      label: "Cancelados/Faltas",
      sublabel: "Não compareceram ou cancelados",
      color: "cancelled",
      percentage: percentages.cancelled,
    },
  ];

  return (
    <div className="status-summary">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div 
            key={item.label} 
            className={`status-card ${item.color}`} 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="status-header">
              <div className={`status-icon ${item.color}`}>
                <Icon size={20} />
              </div>
              <div className="status-info">
                <h4 className="status-count">{item.count}</h4>
                <p className="status-label">{item.label}</p>
                <p className="status-sublabel">{item.sublabel}</p>
              </div>
            </div>
            <div className="status-progress">
              <div className="progress-bar">
                <div
                  className={`progress-fill ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="progress-percentage">{item.percentage}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}