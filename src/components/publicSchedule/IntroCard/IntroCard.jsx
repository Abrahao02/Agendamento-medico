// ============================================
// 📁 src/components/publicSchedule/IntroCard.jsx
// ============================================
import { Calendar } from "lucide-react";
import Card from "../../common/Card";

export default function IntroCard() {
  return (
    <Card className="intro-card">
      <div className="intro-content">
        <Calendar size={24} />
        <div>
          <h3>Como funciona</h3>
          <p>
            Escolha uma data e horário disponível abaixo, preencha seus dados
            e pronto! Você receberá uma confirmação em breve.
          </p>
        </div>
      </div>
    </Card>
  );
}