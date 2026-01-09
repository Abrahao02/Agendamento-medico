// src/components/dashboard/StatusSummary/StatusSummary.jsx
import React from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import "./StatusSummary.css";

export default function StatusSummary({ confirmed = 0, pending = 0, missed = 0 }) {
  const total = confirmed + pending + missed;

  const items = [
    {
      icon: CheckCircle,
      count: confirmed,
      label: "Confirmados",
      color: "confirmed",
      percentage: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    },
    {
      icon: Clock,
      count: pending,
      label: "Pendentes",
      color: "pending",
      percentage: total > 0 ? Math.round((pending / total) * 100) : 0,
    },
    {
      icon: XCircle,
      count: missed,
      label: "Não compareceram",
      color: "missed",
      percentage: total > 0 ? Math.round((missed / total) * 100) : 0,
    },
  ];

  return (
    <div className="status-summary">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={`status-card ${item.color}`} style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="status-header">
              <div className={`status-icon ${item.color}`}>
                <Icon size={20} />
              </div>
              <div className="status-info">
                <h4 className="status-count">{item.count}</h4>
                <p className="status-label">{item.label}</p>
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