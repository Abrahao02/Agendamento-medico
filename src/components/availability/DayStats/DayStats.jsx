// ============================================
// 📁 src/components/availability/DayStats/DayStats.jsx
// ============================================

import { CheckCircle, Clock } from 'lucide-react';
import { STATUS_GROUPS } from '../../../constants/appointmentStatus';
import './DayStats.css';

export default function DayStats({
  // Compat: no Availability, DayManagement envia arrays e o DayStats calcula
  appointments,
  activeAppointments,
  confirmedCount = 0,
  pendingCount = 0,
  occupancyRate = 0,
  activeCount = 0,
  totalSlots = 0,
}) {
  const hasAppointmentsInput =
    Array.isArray(appointments) || Array.isArray(activeAppointments);

  const computedActiveAppointments = Array.isArray(activeAppointments)
    ? activeAppointments
    : Array.isArray(appointments)
      ? appointments.filter((a) => STATUS_GROUPS.ACTIVE.includes(a.status))
      : [];

  const computedConfirmedCount = Array.isArray(appointments)
    ? appointments.filter((a) => STATUS_GROUPS.CONFIRMED.includes(a.status)).length
    : confirmedCount;

  const computedPendingCount = Array.isArray(appointments)
    ? appointments.filter((a) => STATUS_GROUPS.PENDING.includes(a.status)).length
    : pendingCount;

  const computedActiveCount = hasAppointmentsInput
    ? computedActiveAppointments.length
    : activeCount;

  const computedOccupancyRate = hasAppointmentsInput
    ? (totalSlots > 0 ? Math.round((computedActiveCount / totalSlots) * 100) : 0)
    : occupancyRate;

  const stats = [
    {
      icon: <CheckCircle size={20} />,
      label: 'Confirmados',
      value: computedConfirmedCount,
      color: 'success',
    },
    {
      icon: <Clock size={20} />,
      label: 'Pendentes',
      value: computedPendingCount,
      color: 'warning',
    },
  ];

  return (
    <div className="day-stats">
      <div className="occupancy-bar">
        <div className="occupancy-header">
          <span>Taxa de ocupação</span>
          <strong>{computedOccupancyRate}%</strong>
        </div>
        <div className="occupancy-track">
          <div 
            className="occupancy-fill" 
            style={{ width: `${computedOccupancyRate}%` }}
          />
        </div>
        <div className="occupancy-legend">
          {/* ✅ Mostra apenas appointments ATIVOS no cálculo */}
          <span>{computedActiveCount} agendados</span>
          <span>{totalSlots} total</span>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}