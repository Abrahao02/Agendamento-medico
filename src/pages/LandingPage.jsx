import React from "react";
import {
  Calendar,
  Users,
  BarChart3,
  MessageCircle,
  Check,
  ArrowRight,
} from "lucide-react";

import heroImage from "../assets/hero-illustration.png";
import Header from "./Header";
import "./LandingPage.css";

import { auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/* ===== DADOS ===== */

const features = [
  {
    icon: Calendar,
    title: "Disponibilidade de horários",
    description: "Mostre seus horários livres e organize consultas facilmente.",
  },
  {
    icon: Users,
    title: "Controle de Clientes",
    description: "Visualize e gerencie seus clientes com praticidade.",
  },
  {
    icon: BarChart3,
    title: "Relatórios & gráficos",
    description: "Acompanhe atendimentos e métricas importantes de forma visual.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp integrado",
    description: "Envie confirmações e notificações diretamente pelo WhatsApp.",
  },
];

const stats = [
  { value: "5+", label: "Médicos ativos" },
  { value: "100+", label: "Consultas/mês" },
  { value: "98%", label: "Satisfação" },
  { value: "24/7", label: "Disponível" },
];

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

const checklistItems = [
  "Agenda online 24 horas",
  "Confirmações automáticas",
  "Lembretes via WhatsApp",
  "Zero burocracia",
];

/* ===== COMPONENTE ===== */

export default function LandingPage() {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const location = useLocation()
  console.log(user);

  useEffect(() => {
    if (location.hash === "#plans") {
      const plansSection = document.querySelector("#plans");
      if (plansSection) {
        // scroll suave
        plansSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  function handleProClick() {
    if (!user) {
      // Se não estiver logado, vai pro login e salva intenção
      navigate("/login", { state: { redirectTo: "pro" } });
      return;
    }

    if (user.plan === "pro") {
      alert("Você já é PRO!");
      return;
    }

    // Se estiver logado e não for PRO, abre checkout
    window.open("https://mpago.la/1TYVDfE", "_blank");
  }


  return (
    <div className="landing-page">
      <Header user={user} />

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-text fade-up">
            <h1>Organize sua agenda médica de forma simples</h1>
            <p>
              Agendamento rápido, seguro e fácil para você e seus clientes.
              Simplifique sua rotina e foque no que importa.
            </p>

            <div className="hero-buttons">
              <a href="#plans" className="btn btn-primary">
                Ver planos <ArrowRight size={18} />
              </a>
              <a href="#features" className="btn btn-outline">
                Como funciona
              </a>
            </div>
          </div>

          <div className="hero-image fade-in delay-2">
            <img src={heroImage} alt="Interface de agendamento médico" />
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="problem-section">
        <div className="problem-container">
          <div className="problem-text fade-up">
            <span className="tag">Sem complicações</span>
            <h2>Marcar consultas nunca foi tão fácil</h2>
            <p>
              Evite ligações intermináveis e confusões de horários. Nosso sistema
              permite que seus clientes agendem diretamente com você.
            </p>

            <ul className="check-list">
              {checklistItems.map((item, i) => (
                <li key={i} className={`fade-up delay-${i + 1}`}>
                  <Check size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="problem-stats">
            {stats.map((stat, i) => (
              <div key={i} className={`stat-card scale-in delay-${i + 1}`}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="features-container">
          <div className="features-header fade-up">
            <span className="tag">Funcionalidades</span>
            <h2>Tudo que você precisa em um só lugar</h2>
            <p>Ferramentas poderosas para transformar sua rotina</p>
          </div>

          <div className="features-grid">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className={`feature-card scale-in delay-${i + 1}`}>
                  <Icon size={28} />
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
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
              onClick={() => navigate("/register")}
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
              onClick={handleProClick}
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

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-container fade-up">
          <h2>Comece agora mesmo</h2>
          <p>Organize sua agenda e foque nos seus clientes.</p>

          <button
            className="btn btn-primary"
            onClick={handleProClick}
          >
            Assinar PRO <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer className="footer">
        © 2025 MedAgenda. Todos os direitos reservados.
      </footer>
    </div>
  );
}
