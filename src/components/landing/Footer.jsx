// ============================================
// 📁 src/components/landing/Footer.jsx
// ============================================
import { Users, MessageCircle, BarChart3 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-sections">
        Entre em contato:

        <div className="footer-section">
          <Users size={18} />
          <div className="whatsapp-number">
            <span>+55</span> <span>21</span> <span>99437</span> <span>7887</span>
          </div>
        </div>

        <div className="footer-section">
          <MessageCircle size={18} />
          <a href="mailto:eduardo.abrahao@hotmail.com">
            eduardo.abrahao@hotmail.com
          </a>
        </div>

        <div className="footer-section">
          <BarChart3 size={18} />
          <a
            href="https://www.linkedin.com/in/eduardo-abrah%C3%A3o-dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <div>
        © 2025 MedAgenda. Todos os direitos reservados.
      </div>
    </footer>
  );
}