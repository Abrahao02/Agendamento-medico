// ============================================
// 📁 src/components/publicSchedule/LimitReachedBanner.jsx
// ============================================
import { AlertCircle, MessageCircle } from "lucide-react";
import Card from "../../common/Card";

export default function LimitReachedBanner({ doctor }) {
  return (
    <Card className="limit-card">
      <div className="limit-content">
        <AlertCircle size={24} />
        <div>
          <h3>Agenda cheia este mês</h3>
          <p>
            Todos os horários do plano gratuito foram preenchidos. Entre em
            contato pelo WhatsApp para verificar novas datas:
          </p>
          {doctor.whatsapp && (
            <a
              href={`https://wa.me/${doctor.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-link"
            >
              <MessageCircle size={18} />
              {doctor.whatsapp}
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}