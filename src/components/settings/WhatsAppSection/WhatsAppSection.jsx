import { MessageSquare, ChevronDown } from "lucide-react";
import { useCollapsibleSection } from "../../../hooks/common/useCollapsibleSection";
import "./WhatsAppSection.css";

export default function WhatsAppSection({
  whatsappConfig,
  onUpdateField,
  preview,
}) {
  const { state, handlers } = useCollapsibleSection(true);

  return (
    <section className="settings-card whatsapp-section">
      <button
        className="section-header-clickable"
        onClick={handlers.toggleExpanded}
        aria-expanded={state.isExpanded}
      >
        <div className="section-header">
          <MessageSquare size={20} />
          <h2>Mensagem do WhatsApp</h2>
        </div>
        <ChevronDown
          size={20}
          className={`collapse-icon ${state.isExpanded ? "expanded" : ""}`}
        />
      </button>
      
      {state.isExpanded && (
        <div className="section-content">
          <p className="helper-text section-description">
            Personalize a mensagem enviada automaticamente aos pacientes após o agendamento.
          </p>

          <div className="form-group">
            <label>Início da mensagem</label>
            <input
              type="text"
              value={whatsappConfig.intro}
              onChange={(e) => onUpdateField("intro", e.target.value)}
              placeholder="Ex: Olá"
              className="settings-input"
            />
            <p className="helper-text">
              O nome do paciente será automaticamente adicionado após esta saudação, seguido de vírgula. Exemplo: "Olá João,"
            </p>
          </div>

          <div className="form-group">
            <label>Texto principal</label>
            <textarea
              rows={3}
              value={whatsappConfig.body}
              onChange={(e) => onUpdateField("body", e.target.value)}
              placeholder="Ex: Sua sessão está agendada para..."
              className="settings-textarea"
            />
          </div>

          <div className="form-group">
            <label>Texto final</label>
            <textarea
              rows={3}
              value={whatsappConfig.footer}
              onChange={(e) => onUpdateField("footer", e.target.value)}
              placeholder="Ex: Caso não possa comparecer, por favor avisar..."
              className="settings-textarea"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={whatsappConfig.showValue}
                onChange={(e) => onUpdateField("showValue", e.target.checked)}
              />
              <span> Incluir valor da consulta na mensagem</span>
            </label>
          </div>

          <div className="whatsapp-preview">
            <h4>Preview da mensagem:</h4>
            <p className="helper-text">
              Exemplo com o paciente "João". O nome real do paciente será inserido automaticamente.
            </p>
            <div className="preview-box">
              {preview.split("\n").map((line, index) => (
                <p key={index}>{line || <br />}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
