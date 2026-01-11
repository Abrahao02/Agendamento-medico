// ============================================
// 📁 src/components/availability/DayStats/DayStats.jsx
// ✅ ATUALIZADO: Calcula slots livres baseado em appointments ATIVOS
// ============================================

import { CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';
import { APPOINTMENT_STATUS, isStatusInGroup } from '../../../constants/appointmentStatus';
import './DayStats.css';

export default function DayStats({ appointments, activeAppointments, totalSlots }) {
  // Conta por grupo de status (usa TODOS os appointments)
  const confirmed = appointments.filter(a => 
    isStatusInGroup(a.status, 'CONFIRMED')
  ).length;
  
  const pending = appointments.filter(a => 
    isStatusInGroup(a.status, 'PENDING')
  ).length;
  
  const cancelled = appointments.filter(a => 
    isStatusInGroup(a.status, 'CANCELLED')
  ).length;

  // ✅ MUDANÇA PRINCIPAL: Slots livres = total - appointments ATIVOS
  const freeSlots = totalSlots - (activeAppointments?.length || 0);
  
  // ✅ Taxa de ocupação baseada em appointments ATIVOS
  const occupancyRate = totalSlots > 0 
    ? Math.round(((activeAppointments?.length || 0) / totalSlots) * 100) 
    : 0;

  const stats = [
    {
      icon: <CheckCircle size={20} />,
      label: 'Confirmados',
      value: confirmed,
      color: 'success',
    },
    {
      icon: <Clock size={20} />,
      label: 'Pendentes',
      value: pending,
      color: 'warning',
    },
    {
      icon: <XCircle size={20} />,
      label: 'Cancelados',
      value: cancelled,
      color: 'danger',
    },
    {
      icon: <Calendar size={20} />,
      label: 'Livres',
      value: freeSlots,
      color: 'info',
    },
  ];

  return (
    <div className="day-stats">
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

      <div className="occupancy-bar">
        <div className="occupancy-header">
          <span>Taxa de ocupação</span>
          <strong>{occupancyRate}%</strong>
        </div>
        <div className="occupancy-track">
          <div 
            className="occupancy-fill" 
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
        <div className="occupancy-legend">
          {/* ✅ Mostra apenas appointments ATIVOS no cálculo */}
          <span>{activeAppointments?.length || 0} agendados</span>
          <span>{totalSlots} total</span>
        </div>
      </div>
    </div>
  );
}