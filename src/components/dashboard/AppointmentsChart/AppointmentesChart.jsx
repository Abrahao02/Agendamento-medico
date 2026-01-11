// ============================================
// 📁 src/components/dashboard/AppointmentsChart/AppointmentsChart.jsx
// ✅ ATUALIZADO: Mostra todos os status do sistema
// ============================================

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import formatDate from "../../../utils/formatter/formatDate";
import { APPOINTMENT_STATUS, STATUS_CONFIG } from "../../../constants/appointmentStatus";
import "./AppointmentsChart.css";

export default function AppointmentsChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">Consultas por dia</h3>
        <div className="chart-empty">
          <span className="empty-icon">📊</span>
          <p>Nenhum dado disponível para este período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3 className="chart-title">Consultas por dia</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
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
              allowDecimals={false}
            />
            <Tooltip
              labelFormatter={formatDate}
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#1f2937", fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            {/* ✅ Confirmado */}
            <Bar
              dataKey={APPOINTMENT_STATUS.CONFIRMED}
              stackId="a"
              fill={STATUS_CONFIG[APPOINTMENT_STATUS.CONFIRMED].chartColor}
              radius={[4, 4, 0, 0]}
              name="Confirmados"
            />
            {/* ✅ Pendente */}
            <Bar
              dataKey={APPOINTMENT_STATUS.PENDING}
              stackId="a"
              fill={STATUS_CONFIG[APPOINTMENT_STATUS.PENDING].chartColor}
              name="Pendentes"
            />
            {/* ✅ Msg enviada */}
            <Bar
              dataKey={APPOINTMENT_STATUS.MESSAGE_SENT}
              stackId="a"
              fill={STATUS_CONFIG[APPOINTMENT_STATUS.MESSAGE_SENT].chartColor}
              name="Msg enviada"
            />
            {/* ✅ Cancelado */}
            <Bar
              dataKey={APPOINTMENT_STATUS.CANCELLED}
              stackId="a"
              fill={STATUS_CONFIG[APPOINTMENT_STATUS.CANCELLED].chartColor}
              name="Cancelados"
            />
            {/* ✅ Não Compareceu */}
            <Bar
              dataKey={APPOINTMENT_STATUS.NO_SHOW}
              stackId="a"
              fill={STATUS_CONFIG[APPOINTMENT_STATUS.NO_SHOW].chartColor}
              name="Não compareceram"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}