// ============================================
// 📁 src/components/landing/ProblemSection.jsx
// ============================================
import { Check } from "lucide-react";

const stats = [
  { value: "5+", label: "Médicos ativos" },
  { value: "100+", label: "Consultas/mês" },
  { value: "98%", label: "Satisfação" },
  { value: "24/7", label: "Disponível" },
];

const checklistItems = [
  "Agenda online 24 horas",
  "Confirmações automáticas",
  "Lembretes via WhatsApp",
  "Zero burocracia",
];

export default function ProblemSection() {
  return (
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
  );
}