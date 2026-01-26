// ============================================
// 📁 src/components/dashboard/PreviousMonthsSummary/PreviousMonthsSummary.jsx
// Card com resumo dos meses anteriores (Recebido + Não compareceu)
// ============================================

import React from "react";
import { Calendar, DollarSign, XCircle } from "lucide-react";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import { getMonthName } from "../../../constants/months";
import "./PreviousMonthsSummary.css";

export default function PreviousMonthsSummary({
  months = [],
  totals = { received: 0, pending: 0, noShow: 0, total: 0 },
}) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  const isCurrentMonth = (monthData) => {
    return monthData.year === currentYear && monthData.month === currentMonth;
  };
  
  return (
    <div className="previous-months-summary-card">
      <h3 className="standardized-h3">
        Comparação mensal
        <span className="year-filter-badge">{currentYear}</span>
      </h3>
      
      <div className="previous-months-summary-content">
        {/* Lista de meses */}
        {months.length > 0 ? (
          <div className="previous-months-list">
            {months.map((monthData, index) => {
              const monthName = getMonthName(monthData.month);
              const monthTotal = monthData.received + monthData.noShow;
              const isCurrent = isCurrentMonth(monthData);
              
              return (
                <div 
                  key={`${monthData.year}-${monthData.month}`} 
                  className={`previous-months-month-item ${isCurrent ? 'current-month' : ''}`}
                >
                  <div className="previous-months-month-header">
                    <Calendar size={16} className="previous-months-month-icon" />
                    <span className="previous-months-month-name">
                      {monthName} {monthData.year}
                      {isCurrent && <span className="current-month-badge">Mês Atual</span>}
                    </span>
                  </div>
                  
                  <div className="previous-months-month-details">
                    <div className="previous-months-month-row">
                      <div className="previous-months-month-label">
                        <DollarSign size={14} className="previous-months-icon received" />
                        <span>Recebido:</span>
                      </div>
                      <span className="previous-months-month-value">{formatCurrency(monthData.received)}</span>
                    </div>
                    
                    <div className="previous-months-month-row">
                      <div className="previous-months-month-label">
                        <XCircle size={14} className="previous-months-icon no-show" />
                        <span>Não compareceu:</span>
                      </div>
                      <span className="previous-months-month-value">{formatCurrency(monthData.noShow)}</span>
                    </div>
                  </div>
                  
                  <div className="previous-months-month-total">
                    <span className="previous-months-month-total-label">Total:</span>
                    <span className="previous-months-month-total-value">{formatCurrency(monthTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="previous-months-empty">
            <p>Nenhum dado disponível para meses anteriores</p>
          </div>
        )}

        {/* Total Geral */}
        {months.length > 0 && (
          <div className="previous-months-total">
            <div className="previous-months-total-header">
              <Calendar size={20} className="previous-months-icon total" />
              <span className="previous-months-total-label">Total Geral</span>
            </div>
            <div className="previous-months-total-details">
              <div className="previous-months-total-row">
                <span>Recebido:</span>
                <span>{formatCurrency(totals.received)}</span>
              </div>
              <div className="previous-months-total-row">
                <span>Não compareceu:</span>
                <span>{formatCurrency(totals.noShow)}</span>
              </div>
            </div>
            <span className="previous-months-total-value">{formatCurrency(totals.total)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
