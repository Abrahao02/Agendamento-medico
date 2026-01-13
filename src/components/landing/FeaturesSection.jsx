// ============================================
// 📁 src/components/landing/FeaturesSection.jsx
// ============================================
import {
  Calendar,
  Users,
  BarChart3,
  MessageCircle,
} from "lucide-react";

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

export default function FeaturesSection() {
  return (
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
  );
}