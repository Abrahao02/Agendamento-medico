import { useNavigate } from "react-router-dom";
import Button from "../../common/Button";
import StripeCheckoutButton from "../../stripe/StripeCheckoutButton";

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

      <p className="plan-description">
        {plan === "free" ? (
          <>
            Você ainda possui:{" "}
            <strong className="remaining-appointments">
              {remainingAppointments}
            </strong>{" "}
            {remainingAppointments === 1 ? "consulta" : "consultas"}
          </>
        ) : (
          <>✨ Agendamentos ilimitados</>
        )}
      </p>

      {plan === "free" && (
        <div className="plan-actions">
          <StripeCheckoutButton
            className="pro-subscribe-btn"
            variant="primary"
            fullWidth
            showPaymentInfo={false}
            showIcon={false}
          >
            Assinar PRO
          </StripeCheckoutButton>

          <Button
            onClick={handleScrollToPlans}
            className="free-plan-btn"
            variant="ghost"
            fullWidth
            aria-label="Conhecer todos os planos"
          >
            Conhecer planos
          </Button>
        </div>
      )}
    </div>
  );
}
