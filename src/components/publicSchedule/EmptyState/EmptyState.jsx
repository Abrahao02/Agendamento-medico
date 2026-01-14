// ============================================
// 📁 src/components/publicSchedule/EmptyState.jsx
// ============================================
import { Calendar, MessageCircle } from "lucide-react";
import Card from "../../common/Card";
import { cleanWhatsapp } from "../../../utils/whatsapp/cleanWhatsapp";

export default function EmptyState({ doctor }) {
  const message = "Olá! Tentei marcar uma consulta pelo seu link, mas não encontrei horários disponíveis. Poderia me informar quando haverá novos horários?";
  
  const getWhatsAppUrl = () => {
    if (!doctor?.whatsapp) return "#";
    const cleanNumber = cleanWhatsapp(doctor.whatsapp);
    // Ensure country code (55 for Brazil)
    const number = cleanNumber.startsWith("55") ? cleanNumber : `55${cleanNumber}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${number}?text=${encodedMessage}`;
  };

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
            href={getWhatsAppUrl()}
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