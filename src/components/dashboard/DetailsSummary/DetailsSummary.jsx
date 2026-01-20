// ============================================
// 📁 src/components/dashboard/DetailsSummary/DetailsSummary.jsx
// Componente para mostrar métricas detalhadas com barras de progresso
// ============================================
import React from "react";
import "./DetailsSummary.css";

export default function DetailsSummary({
  newPatients = 0,
  newPatientsTotal = 0,
  messagesSent = 0,
  messagesSentTotal = 0,
  noShow = 0,
  noShowTotal = 0,
  cancelled = 0,
  cancelledTotal = 0,
  onNewPatientsClick,
  onNoShowClick,
  onCancelledClick,
}) {
  // Calcular porcentagens
  const newPatientsPercentage = newPatientsTotal > 0 
    ? Math.round((newPatients / newPatientsTotal) * 100) 
    : 0;
  
  const noShowPercentage = noShowTotal > 0 
    ? Math.round((noShow / noShowTotal) * 100) 
    : 0;
  
  const cancelledPercentage = cancelledTotal > 0 
    ? Math.round((cancelled / cancelledTotal) * 100) 
    : 0;

  const items = [
    {
      label: "Novos pacientes",
      current: newPatients,
      total: newPatientsTotal,
      percentage: newPatientsPercentage,
      color: "blue",
      description: "pacientes únicos",
    },
    {
      label: "Taxa de faltas",
      current: noShow,
      total: noShowTotal,
      percentage: noShowPercentage,
      color: "red",
      description: "agendamentos",
    },
    {
      label: "Taxa de cancelamento",
      current: cancelled,
      total: cancelledTotal,
      percentage: cancelledPercentage,
      color: "gray",
      description: "agendamentos criados",
    },
  ];

  return (
    <div className="details-summary-card">
      <h3 className="standardized-h3">Indicadores do período</h3>
      <div className="details-list">
        {items.map((item, index) => {
          const isNewPatientsClickable = item.label === "Novos pacientes" && onNewPatientsClick && item.current > 0;
          const isNoShowClickable = item.label === "Taxa de faltas" && onNoShowClick && item.current > 0;
          const isCancelledClickable = item.label === "Taxa de cancelamento" && onCancelledClick && item.current > 0;
          const isClickable = isNewPatientsClickable || isNoShowClickable || isCancelledClickable;
          
          const handleClick = () => {
            if (isNewPatientsClickable) {
              onNewPatientsClick();
            } else if (isNoShowClickable) {
              onNoShowClick();
            } else if (isCancelledClickable) {
              onCancelledClick();
            }
          };
          
          const getAriaLabel = () => {
            if (isNewPatientsClickable) return 'Ver lista de novos pacientes';
            if (isNoShowClickable) return 'Ver lista de pacientes que não compareceram';
            if (isCancelledClickable) return 'Ver lista de consultas canceladas';
            return undefined;
          };
          
          return (
            <div 
              className={`detail-item ${isClickable ? 'clickable' : ''}`}
              key={item.label}
              onClick={isClickable ? handleClick : undefined}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick();
                }
              } : undefined}
              aria-label={getAriaLabel()}
            >
              <div className="detail-label">{item.label}</div>
              <div className="detail-percentage">{item.percentage}%</div>
                <div className="detail-progress-bar">
                  <div
                    className={`detail-progress-fill ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                  />
                </div>
              <div className="detail-count">
                {item.current} de {item.total} {item.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
