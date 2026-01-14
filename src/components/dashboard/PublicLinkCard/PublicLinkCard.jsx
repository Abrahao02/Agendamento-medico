// src/components/dashboard/PublicLinkCard/PublicLinkCard.jsx
import React, { useState } from "react";
import { Copy, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";
import "./PublicLinkCard.css";
import { logError } from "../../../utils/logger/logger";

export default function PublicLinkCard({ slug, baseUrl = window.location.origin, isLimitReached = false }) {
  const [copied, setCopied] = useState(false);
  
  const fullUrl = `${baseUrl}/public/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logError("Erro ao copiar:", err);
    }
  };

  return (
    <div className={`public-link-card ${isLimitReached ? "limit-reached" : ""}`}>
      <h3 className="standardized-h3">Compartilhe o link para agendamento de consultas</h3>
      {isLimitReached && (
        <div className="public-link-warning">
          <AlertTriangle size={16} />
          <span>Link temporariamente bloqueado - limite do plano atingido</span>
        </div>
      )}
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
    </div>
  );
}