import { Calendar, ChevronDown } from "lucide-react";
import { getPeriodOptions } from "../../../constants/publicScheduleConfig";
import { useCollapsibleSection } from "../../../hooks/common/useCollapsibleSection";
import "./PublicScheduleSection.css";

export default function PublicScheduleSection({
  publicScheduleConfig,
  onUpdateField,
}) {
  const { state, handlers } = useCollapsibleSection(true);
  const selectedOption = getPeriodOptions().find(
    (opt) => opt.value === publicScheduleConfig.period
  );

  return (
    <section className="settings-card public-schedule-section">
      <button
        className="section-header-clickable"
        onClick={handlers.toggleExpanded}
        aria-expanded={state.isExpanded}
      >
        <div className="section-header">
          <Calendar size={20} />
          <h2>Agendamento Público</h2>
        </div>
        <ChevronDown
          size={20}
          className={`collapse-icon ${state.isExpanded ? "expanded" : ""}`}
        />
      </button>
      
      {state.isExpanded && (
        <div className="section-content">
          <p className="helper-text section-description">
            Configure como sua agenda pública será exibida para os pacientes.
          </p>

          <div className="form-group">
            <label>Período de exibição</label>
            <select
              value={publicScheduleConfig.period}
              onChange={(e) => onUpdateField("period", e.target.value)}
              className="settings-select"
            >
              {getPeriodOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedOption && (
              <p className="helper-text option-description">
                {selectedOption.description}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={publicScheduleConfig.showPrice ?? true}
                onChange={(e) => onUpdateField("showPrice", e.target.checked)}
              />
              <span>Exibir preço das consultas para pacientes</span>
            </label>
            <p className="helper-text">
              Quando desabilitado, o preço será oculto na página pública e será exibida a mensagem "Valor sob consulta".
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
