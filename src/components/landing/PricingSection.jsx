// ============================================
// 📁 src/components/landing/PricingSection.jsx
// ============================================
import { Check } from "lucide-react";
import Button from "../common/Button";

const freeFeatures = [
  "Até 10 atendimentos/mês",
  "Funcionalidades básicas",
  "Suporte via e-mail",
];

const proFeatures = [
  "Atendimentos ilimitados",
  "Controle avançado de clientes",
  "Relatórios detalhados",
  "WhatsApp integrado",
  "Suporte prioritário",
];

export default function PricingSection({ 
  user, 
  userPlan,
  loading, 
  onProClick, 
  onNavigateToRegister 
}) {
  return (
    <section className="pricing-section" id="plans">
      <div className="pricing-header fade-up">
        <span className="tag">Planos</span>
        <h2>Escolha o plano ideal para você</h2>
        <p>Comece gratuitamente e faça upgrade quando precisar</p>
      </div>
      
      <div className="pricing-grid">
        {/* FREE */}
        <div className="pricing-card">
          <h3>Free</h3>
          <div className="price">R$ 0 / mês</div>

          <ul>
            {freeFeatures.map((item, i) => (
              <li key={i}>
                <Check size={18} />
                {item}
              </li>
            ))}
          </ul>

          <Button variant="outline" onClick={onNavigateToRegister} fullWidth>
            Começar grátis
          </Button>
        </div>

        {/* PRO */}
        <div className="pricing-card pro">
          <span className="badge">Mais popular</span>
          <h3>PRO</h3>
          <div className="price">R$ 49 / mês</div>

          <ul>
            {proFeatures.map((item, i) => (
              <li key={i}>
                <Check size={18} />
                {item}
              </li>
            ))}
          </ul>

          {userPlan === "pro" ? (
            <>
              <Button
                variant="primary"
                className="pro-pay-btn"
                disabled
              >
                Você já é PRO
              </Button>
              <p className="pro-note" style={{ color: '#10b981', marginTop: '0.5rem' }}>
                Acesse as configurações para gerenciar sua assinatura
              </p>
            </>
          ) : (
            <>
              <Button
                onClick={onProClick}
                variant="primary"
                className="pro-pay-btn"
                disabled={loading}
              >
                Assinar PRO
                <span className="pay-hint">Cartão de crédito ou Pix</span>
              </Button>

              {!user && !loading && (
                <p className="pro-note">
                  É necessário estar logado para assinar
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}