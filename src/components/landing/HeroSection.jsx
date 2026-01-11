// ============================================
// 📁 src/components/landing/HeroSection.jsx
// ============================================
import { ArrowRight } from "lucide-react";
import heroImage from "../../assets/hero-illustration.png";

export default function HeroSection({ onScrollToPlans }) {
  return (
    <section  id="hero" className="hero-section">
      <div className="hero-container">
        <div className="hero-text fade-up">
          <h1>Organize sua agenda médica de forma simples</h1>
          <p>
            Agendamento rápido, seguro e fácil para você e seus clientes.
            Simplifique sua rotina e foque no que importa.
          </p>

          <div className="hero-buttons">
            <button
              className="btn btn-primary"
              onClick={onScrollToPlans}
            >
              Ver planos <ArrowRight size={18} />
            </button>

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
  );
}