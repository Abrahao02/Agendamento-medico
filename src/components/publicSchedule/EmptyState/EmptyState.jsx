// ============================================
// 📁 src/components/publicSchedule/EmptyState.jsx
// ============================================
import { Calendar, MessageCircle } from "lucide-react";
import Card from "../../common/Card";

export default function EmptyState({ doctor }) {
  return (
    <Card className="empty-card">
      <div className="empty-content">
        <Calendar size={48} />
        <h3>Sem horários disponíveis</h3>
        <p>
          Não há horários disponíveis no momento. Entre em contato para
          mais informações.
        </p>
        {doctor.whatsapp && (
          <a
            href={`https://wa.me/${doctor.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-btn"
          >
            <MessageCircle size={18} />
            Entrar em contato
          </a>
        )}
      </div>
    </Card>
  );
}