// ============================================
// 📁 src/components/dashboard/FinancialBreakdown/FinancialBreakdown.jsx
// BLOCO 4 - Detalhamento por status (secundário)
// ============================================

import React from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import "./FinancialBreakdown.css";

export default function FinancialBreakdown({
  confirmed = { realized: 0, future: 0 },
  pending = { total: 0 },
  noShow = { total: 0 },
}) {
  return (
    <div className="financial-breakdown-card">
      <h3 className="financial-breakdown-title">Detalhamento por status</h3>
      
      <div className="financial-breakdown-sections">
        {/* Confirmados */}
        <div className="breakdown-section">
          <div className="breakdown-section-header">
            <CheckCircle size={20} className="breakdown-icon confirmed" />
            <h4 className="breakdown-section-title">Confirmados</h4>
          </div>
          <div className="breakdown-section-content">
            <div className="breakdown-item">
              <span className="breakdown-item-label">Já realizados:</span>
              <span className="breakdown-item-value">{formatCurrency(confirmed.realized)}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-item-label">Futuros:</span>
              <span className="breakdown-item-value">{formatCurrency(confirmed.future)}</span>
            </div>
          </div>
        </div>

        {/* Pendentes */}
        <div className="breakdown-section">
          <div className="breakdown-section-header">
            <Clock size={20} className="breakdown-icon pending" />
            <h4 className="breakdown-section-title">Pendentes</h4>
          </div>
          <div className="breakdown-section-content">
            <div className="breakdown-item">
              <span className="breakdown-item-label">Aguardando resposta:</span>
              <span className="breakdown-item-value">{formatCurrency(pending.total)}</span>
            </div>
          </div>
        </div>

        {/* Não compareceram */}
        <div className="breakdown-section">
          <div className="breakdown-section-header">
            <XCircle size={20} className="breakdown-icon no-show" />
            <h4 className="breakdown-section-title">Não compareceram</h4>
          </div>
          <div className="breakdown-section-content">
            <div className="breakdown-item">
              <span className="breakdown-item-label">Valor potencial:</span>
              <span className="breakdown-item-value">{formatCurrency(noShow.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
