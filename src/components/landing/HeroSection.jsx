// ============================================
// 📁 src/components/landing/HeroSection.jsx
// ============================================
import { ArrowRight } from "lucide-react";
import heroImage from "../../assets/hero-illustration.png";
import Button from "../common/Button";

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
            <Button
              variant="primary"
              onClick={onScrollToPlans}
              rightIcon={<ArrowRight size={18} />}
            >
              Ver planos
            </Button>

            <Button as="a" href="#features" variant="outline">
              Como funciona
            </Button>
          </div>
        </div>

        <div className="hero-image fade-in delay-2">
          <img src={heroImage} alt="Interface de agendamento médico" />
        </div>
      </div>
    </section>
  );
}