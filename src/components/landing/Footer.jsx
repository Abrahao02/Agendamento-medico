// ============================================
// src/components/landing/Footer.jsx
// ============================================
import { Users, MessageCircle, BarChart3, FileText, Shield, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-sections">
          <span className="footer-label">Entre em contato:</span>

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

        <div className="footer-legal">
          <Link to="/termos-de-uso" className="footer-legal-link">
            <FileText size={14} />
            <span>Termos de Uso</span>
          </Link>
          <Link to="/politica-de-privacidade" className="footer-legal-link">
            <Shield size={14} />
            <span>Privacidade</span>
          </Link>
          <Link to="/termo-de-responsabilidade-medico" className="footer-legal-link">
            <UserCheck size={14} />
            <span>Responsabilidade Profissional</span>
          </Link>
        </div>
      </div>

      <div className="footer-copyright">
        2025 MedAgenda. Todos os direitos reservados.
      </div>
    </footer>
  );
}
