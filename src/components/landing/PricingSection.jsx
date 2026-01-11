// ============================================
// 📁 src/components/landing/PricingSection.jsx
// ============================================
import { Check } from "lucide-react";

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

          <button
            className="btn btn-outline"
            onClick={onNavigateToRegister}
          >
            Começar grátis
          </button>
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

          <button
            onClick={onProClick}
            className="btn btn-primary pro-pay-btn"
            disabled={loading}
          >
            Assinar PRO
            <span className="pay-hint">
              Pix, cartão ou Mercado Pago
            </span>
          </button>

          {!user && !loading && (
            <p className="pro-note">
              🔒 É necessário estar logado para assinar
            </p>
          )}
        </div>
      </div>
    </section>
  );
}