// ============================================
// 📁 src/components/dashboard/FinancialTimeline/FinancialTimeline.jsx
// BLOCO 3 - Linha do tempo financeira (passado x futuro)
// ============================================

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import "./FinancialTimeline.css";

export default function FinancialTimeline({
  realized = 0,
  toReceive = 0,
  totalExpenses = 0,
}) {
  const data = [
    {
      name: "Já realizado",
      value: realized,
      color: "#16a34a", // Verde
    },
    {
      name: "Próximos dias",
      value: toReceive,
      color: "#3b82f6", // Azul
    },
    {
      name: "Gastos",
      value: -totalExpenses, // NEGATIVO para barra descendente
      color: "#ef4444", // Vermelho
    },
  ];

  // Calcular máximo considerando valores positivos e negativos
  const maxPositive = Math.max(realized, toReceive);
  const maxNegative = Math.abs(-totalExpenses);
  const chartMax = Math.max(maxPositive, maxNegative) * 1.2 || 100;

  const COLORS = ["#16a34a", "#3b82f6", "#ef4444"];

  return (
    <div className="financial-timeline-card">
      <h3 className="standardized-h3">Linha do tempo financeira</h3>
      
      <div className="financial-timeline-content">
        <div className="financial-timeline-values">
          <div className="timeline-value-item">
            <span className="timeline-value-label">Já realizado</span>
            <span className="timeline-value-amount">{formatCurrency(realized)}</span>
          </div>
          <div className="timeline-value-item">
            <span className="timeline-value-label">Próximos dias</span>
            <span className="timeline-value-amount">{formatCurrency(toReceive)}</span>
          </div>
          <div className="timeline-value-item expense-item">
            <span className="timeline-value-label">Gastos</span>
            <span className="timeline-value-amount expense-amount">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>

        <div className="financial-timeline-chart">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(value) => formatCurrency(Math.abs(value))}
                domain={[-chartMax, chartMax]}
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Math.abs(Number(value))),
                  "Valor"
                ]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#1f2937", fontWeight: 600 }}
              />
              <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
