// src/components/dashboard/PublicLinkCard/PublicLinkCard.jsx
import React, { useState } from "react";
import { Copy, ExternalLink, CheckCircle } from "lucide-react";
import "./PublicLinkCard.css";

export default function PublicLinkCard({ slug, baseUrl = window.location.origin }) {
  const [copied, setCopied] = useState(false);
  
  const fullUrl = `${baseUrl}/public/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <div className="public-link-card">
      <p className="public-link-label">
        <span className="label-icon">🔗</span>
        Seu link público de agendamento
      </p>
      <div className="public-link-box">
        <div className="public-link-text-wrapper">
          <input
            type="text"
            value={fullUrl}
            readOnly
            className="public-link-text"
            onClick={(e) => e.target.select()}
          />
        </div>
        
        <button
          className={`link-btn copy-btn ${copied ? "copied" : ""}`}
          onClick={handleCopy}
          title={copied ? "Copiado!" : "Copiar link"}
        >
          {copied ? (
            <>
              <CheckCircle size={16} />
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copiar</span>
            </>
          )}
        </button>

        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link-btn open-btn"
          title="Abrir em nova aba"
        >
          <ExternalLink size={16} />
          <span>Abrir</span>
        </a>
      </div>
      
      <p className="public-link-hint">
        💡 Compartilhe este link com seus pacientes para que eles possam agendar consultas
      </p>
    </div>
  );
}