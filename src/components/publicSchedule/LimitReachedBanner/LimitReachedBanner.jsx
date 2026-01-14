// ============================================
// 📁 src/components/publicSchedule/LimitReachedBanner.jsx
// ============================================
import { AlertCircle, MessageCircle } from "lucide-react";
import Card from "../../common/Card";
import { cleanWhatsapp } from "../../../utils/whatsapp/cleanWhatsapp";

export default function LimitReachedBanner({ doctor }) {
  const message = "Tentei agendar uma consulta pelo seu link, mas o agendamento não está disponível devido ao limite do plano.";
  
  const getWhatsAppUrl = () => {
    if (!doctor?.whatsapp) return "#";
    const cleanNumber = cleanWhatsapp(doctor.whatsapp);
    // Ensure country code (55 for Brazil)
    const number = cleanNumber.startsWith("55") ? cleanNumber : `55${cleanNumber}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${number}?text=${encodedMessage}`;
  };

  return (
    <Card className="limit-card">
      <div className="limit-content">
        <AlertCircle size={24} />
        <div>
          <h3>Agendamento não disponível</h3>
          <p>
            O agendamento não está disponível devido ao limite do plano.
          </p>
          {doctor?.whatsapp && (
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-link"
            >
              <MessageCircle size={18} />
              Entrar em contato pelo WhatsApp
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}