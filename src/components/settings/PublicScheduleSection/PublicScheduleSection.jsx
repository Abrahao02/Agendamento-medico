import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { getPeriodOptions } from "../../../constants/publicScheduleConfig";
import "./PublicScheduleSection.css";

export default function PublicScheduleSection({
  publicScheduleConfig,
  onUpdateField,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedOption = getPeriodOptions().find(
    (opt) => opt.value === publicScheduleConfig.period
  );

  return (
    <section className="settings-card public-schedule-section">
      <button
        className="section-header-clickable"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="section-header">
          <Calendar size={20} />
          <h2>Agendamento Público</h2>
        </div>
        <ChevronDown
          size={20}
          className={`collapse-icon ${isExpanded ? "expanded" : ""}`}
        />
      </button>
      
      {isExpanded && (
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
        </div>
      )}
    </section>
  );
}
