// ============================================
// 📁 src/components/dashboard/FinancialChart/FinancialChart.jsx
// Gráfico de evolução financeira
// ============================================

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import formatDate from "../../../utils/formatter/formatDate";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import "./FinancialChart.css";

export default function FinancialChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">Evolução Financeira</h3>
        <div className="chart-empty">
          <span className="empty-icon" aria-hidden="true">
            <TrendingUp size={40} />
          </span>
          <p>Nenhum dado financeiro disponível para este período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3 className="chart-title">Evolução Financeira</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              stroke="#9ca3af"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              labelFormatter={formatDate}
              formatter={(value) => [formatCurrency(Number(value)), "Faturamento"]}
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#1f2937", fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ fill: "#16a34a", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
