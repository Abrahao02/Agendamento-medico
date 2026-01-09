// src/components/dashboard/StatsCard/StatsCard.jsx
import React from "react";
import "./StatsCard.css";

export default function StatsCard({
  icon: Icon,
  value,
  title,
  color = "blue", // blue, green, amber, purple
  onClick,
  loading = false,
  className = "",
}) {
  const isClickable = !!onClick;

  return (
    <div
      className={`stats-card ${isClickable ? "clickable" : ""} ${className}`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className={`stats-icon ${color}`}>
        {loading ? (
          <div className="spinner-small"></div>
        ) : (
          Icon && <Icon size={24} />
        )}
      </div>
      <div className="stats-info">
        <p className="stats-value">{loading ? "..." : value}</p>
        <p className="stats-title">{title}</p>
      </div>
    </div>
  );
}

// Exemplos de uso:
// <StatsCard
//   icon={Calendar}
//   value={150}
//   title="Total de consultas"
//   color="green"
//   onClick={() => navigate('/appointments')}
// />
//
// <StatsCard
//   icon={DollarSign}
//   value="R$ 15.000"
//   title="Faturamento"
//   color="amber"
//   loading={isLoading}
// />