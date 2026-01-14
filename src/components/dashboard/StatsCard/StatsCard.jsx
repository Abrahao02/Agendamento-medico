// ============================================
// 📁 src/components/dashboard/StatsCard/StatsCard.jsx - MELHORADO
// Adiciona comparação com período anterior
// ============================================

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import "./StatsCard.css";

export default function StatsCard({
  icon: Icon,
  value,
  title,
  subtitle,
  color = "blue",
  onClick,
  loading = false,
  comparison, // { value: 25, trend: "up"|"down"|"neutral" }
  className = "",
}) {
  const isClickable = !!onClick;

  const TrendIcon = comparison?.trend === "up" 
    ? TrendingUp 
    : comparison?.trend === "down" 
    ? TrendingDown 
    : Minus;

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
          Icon && <Icon size={20} />
        )}
      </div>
      
      <div className="stats-info">
        <div className="stats-value-wrapper">
          <p className="stats-value">{loading ? "..." : value}</p>
          {comparison && !loading && (
            <span className={`stats-comparison-inline ${comparison.trend}`}>
              {comparison.value}% {comparison.trend === "up" ? "↑" : comparison.trend === "down" ? "↓" : ""} Este mês
            </span>
          )}
        </div>
        <p className="stats-title">{title}</p>
        {subtitle && <p className="stats-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}