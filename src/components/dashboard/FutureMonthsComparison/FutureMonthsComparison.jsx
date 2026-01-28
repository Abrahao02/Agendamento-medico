// ============================================
// 📁 src/components/dashboard/FutureMonthsComparison/FutureMonthsComparison.jsx
// Card com previsão de meses futuros (mês atual e futuros com appointments)
// ============================================

import React from "react";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import { getMonthName } from "../../../constants/months";
import "./FutureMonthsComparison.css";

export default function FutureMonthsComparison({
  months = [],
  totals = { confirmed: 0, pending: 0, total: 0 },
}) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  const isCurrentMonth = (monthData) => {
    return monthData.year === currentYear && monthData.month === currentMonth;
  };
  
  const isFutureMonth = (monthData) => {
    return monthData.year === currentYear && monthData.month > currentMonth;
  };
  
  return (
    <div className="future-months-comparison-card">
      <h3 className="standardized-h3">
        Previsão mensal
        <span className="year-filter-badge">{currentYear}</span>
      </h3>
      
      <div className="future-months-comparison-content">
        {/* Lista de meses */}
        {months.length > 0 ? (
          <div className="future-months-list">
            {months.map((monthData) => {
              const monthName = getMonthName(monthData.month);
              const monthTotal = monthData.confirmed + monthData.pending;
              const isCurrent = isCurrentMonth(monthData);
              const isFuture = isFutureMonth(monthData);
              
              return (
                <div 
                  key={`${monthData.year}-${monthData.month}`} 
                  className={`future-months-month-item ${isCurrent ? 'current-month' : ''} ${isFuture ? 'future-month' : ''}`}
                >
                  <div className="future-months-month-header">
                    <Calendar size={16} className="future-months-month-icon" />
                    <span className="future-months-month-name">
                      {monthName} {monthData.year}
                      {isCurrent && <span className="current-month-badge">Mês Atual</span>}
                      {isFuture && <span className="forecast-badge">Previsão</span>}
                    </span>
                  </div>
                  
                  <div className="future-months-month-details">
                    <div className="future-months-month-row">
                      <div className="future-months-month-label">
                        <CheckCircle size={14} className="future-months-icon confirmed" />
                        <span>Confirmados futuros:</span>
                      </div>
                      <span className="future-months-month-value">{formatCurrency(monthData.confirmed)}</span>
                    </div>
                    
                    <div className="future-months-month-row">
                      <div className="future-months-month-label">
                        <Clock size={14} className="future-months-icon pending" />
                        <span>Pendentes:</span>
                      </div>
                      <span className="future-months-month-value">{formatCurrency(monthData.pending)}</span>
                    </div>
                  </div>
                  
                  <div className="future-months-month-total">
                    <span className="future-months-month-total-label">Total:</span>
                    <span className="future-months-month-total-value">{formatCurrency(monthTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="future-months-empty">
            <p>Nenhuma consulta agendada para meses futuros</p>
          </div>
        )}

        {/* Total Geral */}
        {months.length > 0 && (
          <div className="future-months-total">
            <div className="future-months-total-header">
              <Calendar size={20} className="future-months-icon total" />
              <span className="future-months-total-label">Total Geral</span>
            </div>
            <div className="future-months-total-details">
              <div className="future-months-total-row">
                <span>Confirmados futuros:</span>
                <span>{formatCurrency(totals.confirmed)}</span>
              </div>
              <div className="future-months-total-row">
                <span>Pendentes:</span>
                <span>{formatCurrency(totals.pending)}</span>
              </div>
            </div>
            <span className="future-months-total-value">{formatCurrency(totals.total)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
