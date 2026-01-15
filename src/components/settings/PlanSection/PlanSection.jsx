import { Crown, Check, XCircle, RotateCcw } from "lucide-react";
import StripeCheckoutButton from "../../stripe/StripeCheckoutButton";
import Button from "../../common/Button";
import "./PlanSection.css";

export default function PlanSection({
  isPro,
  doctor,
  subscriptionEndDate,
  onCancel,
  onReactivate,
  cancelLoading,
  reactivateLoading,
  cancelError,
  reactivateError,
}) {
  if (!isPro) {
    return (
      <section className="settings-card plan-upgrade-card">
        <div className="plan-upgrade-header">
          <div className="plan-upgrade-icon">
            <Crown size={24} />
          </div>
          <div>
            <h2>Upgrade para PRO</h2>
            <p className="helper-text">
              Desbloqueie recursos ilimitados e funcionalidades avançadas
            </p>
          </div>
        </div>
        <div className="plan-features-grid">
          <div className="plan-feature">
            <Check size={18} />
            <span>Consultas ilimitadas</span>
          </div>
          <div className="plan-feature">
            <Check size={18} />
            <span>Controle avançado</span>
          </div>
          <div className="plan-feature">
            <Check size={18} />
            <span>Relatórios detalhados</span>
          </div>
          <div className="plan-feature">
            <Check size={18} />
            <span>Suporte prioritário</span>
          </div>
        </div>
        <StripeCheckoutButton
          className="upgrade-btn"
          variant="primary"
          fullWidth
          showPaymentInfo={false}
          showIcon={false}
        >
          Assinar PRO - R$ 49/mês
        </StripeCheckoutButton>
      </section>
    );
  }

  const isCanceled = doctor?.stripeSubscriptionStatus === 'cancel_at_period_end';

  return (
    <section className="settings-card plan-active-card">
      <div className="plan-active-header">
        <Crown size={20} />
        <div>
          <h2>Plano PRO Ativo</h2>
          <p className="helper-text">Você está aproveitando todos os recursos</p>
        </div>
      </div>
      
      <div className="subscription-info">
        {subscriptionEndDate ? (
          <p className="subscription-end-date">
            <strong>Sua assinatura vence em:</strong>
            <span>
              {subscriptionEndDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </p>
        ) : (
          <p className="subscription-end-date">
            <strong>Assinatura ativa</strong>
          </p>
        )}
        
        {isCanceled && doctor?.subscriptionCancelAt && (
          <p className="subscription-cancel-warning">
            <strong>Cancelamento agendado:</strong> Sua assinatura será cancelada em{" "}
            {new Date(doctor.subscriptionCancelAt.toDate()).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        )}
      </div>

      {isCanceled ? (
        <div className="subscription-management">
          <p className="helper-text">
            Sua assinatura está agendada para cancelamento. Você pode reativá-la a qualquer momento antes da data de término.
          </p>
          {reactivateError && (
            <p className="error-message">
              {reactivateError}
            </p>
          )}
          <Button
            onClick={onReactivate}
            disabled={reactivateLoading}
            loading={reactivateLoading}
            variant="primary"
          >
            <RotateCcw size={18} />
            Reativar assinatura
          </Button>
        </div>
      ) : (
        <div className="subscription-management">
          <p className="helper-text">
            Você pode cancelar sua assinatura a qualquer momento. O acesso ao plano PRO será mantido até o final do período pago.
          </p>
          {cancelError && (
            <p className="error-message">
              {cancelError}
            </p>
          )}
          <Button
            onClick={onCancel}
            disabled={cancelLoading}
            loading={cancelLoading}
            variant="danger"
          >
            <XCircle size={18} />
            Cancelar assinatura
          </Button>
        </div>
      )}
    </section>
  );
}
