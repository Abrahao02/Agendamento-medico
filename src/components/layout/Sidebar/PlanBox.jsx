// ============================================
// 📁 src/components/layout/Sidebar/PlanBox.jsx - REFATORADO
// Badge compacto para footer da sidebar
// ============================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, HelpCircle } from "lucide-react";

export default function PlanBox({ 
  plan, 
  appointmentsThisMonth, 
  isLimitReached, 
  sidebarOpen 
}) {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const remainingAppointments = 10 - appointmentsThisMonth;

  if (!sidebarOpen) return null;

  const handleConhecerPlanos = (e) => {
    e.preventDefault();
    navigate("/dashboard/settings");
  };

  return (
    <div className="plan-badge-wrapper">
      <div
        className={`plan-badge-compact ${isLimitReached ? "limit-reached" : ""}`}
        role="status"
        aria-label={`Plano ${plan === "free" ? "Gratuito" : "PRO"}${isLimitReached ? " - Limite atingido" : ""}`}
      >
        <span className="plan-badge-text">
          {plan === "free" ? (
            isLimitReached ? (
              <>
                <AlertCircle className="limit-icon" size={16} />
                <span>Limite atingido</span>
              </>
            ) : (
              <>
                Gratuito <span className="plan-count">{remainingAppointments} consulta(s)</span>
              </>
            )
          ) : (
            <>PRO</>
          )}
        </span>
        {plan === "free" && !isLimitReached && (
          <div className="plan-help-wrapper">
            <button
              className="plan-help-icon"
              onClick={() => setShowTooltip(!showTooltip)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              aria-label="Informações sobre o plano gratuito"
              aria-expanded={showTooltip}
            >
              <HelpCircle size={16} />
            </button>
            {showTooltip && (
              <div className="plan-tooltip" role="tooltip">
                <p>
                  Plano gratuito: até 10 consultas confirmadas por mês. 
                  Após o limite, assine o PRO para continuar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {plan === "free" && (
        <button
          onClick={handleConhecerPlanos}
          className="plan-link-btn"
          aria-label={isLimitReached ? "Assinar PRO para liberar" : "Conhecer todos os planos"}
        >
          {isLimitReached ? "Assinar PRO" : "Conhecer planos"}
        </button>
      )}
    </div>
  );
}
