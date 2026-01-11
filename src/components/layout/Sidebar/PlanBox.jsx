// ============================================
// 📁 src/components/layout/PlanBox.jsx - NOVO
// ============================================
import { useNavigate } from "react-router-dom";
import Button from "../../common/Button";

export default function PlanBox({ 
  plan, 
  appointmentsThisMonth, 
  isLimitReached, 
  sidebarOpen 
}) {
  const navigate = useNavigate();
  const remainingAppointments = 10 - appointmentsThisMonth;

  if (!sidebarOpen) return null;

  const handleScrollToPlans = (e) => {
    e.preventDefault();
    navigate("/#plans");
  };

  return (
    <div
      className={`plan-box ${isLimitReached ? "limit-reached" : ""}`}
      role="region"
      aria-label="Informações do plano"
    >
      <span className="plan-badge">
        Plano {plan === "free" ? "Gratuito" : "PRO"}
      </span>

      <p>
        {plan === "free" ? (
          <>
            Você ainda possui:{" "}
            <strong className="remaining-appointments">
              {remainingAppointments}
            </strong>{" "}
            {remainingAppointments === 1 ? "consulta" : "consultas"}
          </>
        ) : (
          <>✨ Consultas ilimitadas</>
        )}
      </p>

      {plan === "free" && (
        <div className="plan-actions">
          <a
            href="https://mpago.la/1TYVDfE"
            target="_blank"
            rel="noopener noreferrer"
            className="pro-subscribe-btn"
            aria-label="Assinar plano PRO"
          >
            <span>Assinar PRO</span> <br />
            <span className="plan-payment-info">
              Pix, Cartão ou Boleto
            </span>
          </a>

          <Button
            onClick={handleScrollToPlans}
            className="free-plan-btn"
            aria-label="Conhecer todos os planos"
          >
            Conhecer planos
          </Button>
        </div>
      )}
    </div>
  );
}