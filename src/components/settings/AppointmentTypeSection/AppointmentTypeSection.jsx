import { useState } from "react";
import { Stethoscope, MapPin, Plus, Trash2, ChevronDown } from "lucide-react";
import {
  getAppointmentTypeModeOptions,
  getAppointmentTypeOptions,
  APPOINTMENT_TYPE_MODE,
} from "../../../constants/appointmentType";
import "./AppointmentTypeSection.css";

export default function AppointmentTypeSection({
  appointmentTypeConfig,
  onUpdateField,
  onAddLocation,
  onUpdateLocation,
  onRemoveLocation,
  newLocationName,
  newLocationValue,
  onNewLocationNameChange,
  onNewLocationValueChange,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section className="settings-card appointment-type-section">
      <button
        className="section-header-clickable"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="section-header">
          <Stethoscope size={20} />
          <h2>Tipo de Atendimento</h2>
        </div>
        <ChevronDown
          size={20}
          className={`collapse-icon ${isExpanded ? "expanded" : ""}`}
        />
      </button>
      
      {isExpanded && (
        <div className="section-content">
          <p className="helper-text section-description">
            Configure como os pacientes podem escolher entre atendimento online ou presencial.
          </p>

          <div className="form-group">
        <label>Modo de exibição</label>
        <select
          value={appointmentTypeConfig.mode}
          onChange={(e) => onUpdateField("mode", e.target.value)}
          className="settings-select"
        >
          {getAppointmentTypeModeOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED && (
        <div className="form-group">
          <label>Tipo fixo</label>
          <select
            value={appointmentTypeConfig.fixedType}
            onChange={(e) => onUpdateField("fixedType", e.target.value)}
            className="settings-select"
          >
            {getAppointmentTypeOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="values-section">
        <h3 className="section-subtitle">
          <span>Valores Padrão</span>
        </h3>
        <p className="helper-text" style={{ marginBottom: "1rem" }}>
          Defina os valores que serão usados automaticamente para cada tipo de atendimento.
        </p>
        
        <div className="values-grid">
          <div className="form-group">
            <label>Valor padrão para Online (R$)</label>
            <input
              type="number"
              placeholder="Ex: 100"
              value={appointmentTypeConfig.defaultValueOnline}
              onChange={(e) => onUpdateField("defaultValueOnline", e.target.value)}
              className="settings-input"
            />
          </div>

          <div className="form-group">
            <label>Valor padrão para Presencial (R$)</label>
            <input
              type="number"
              placeholder="Ex: 150"
              value={appointmentTypeConfig.defaultValuePresencial}
              onChange={(e) => onUpdateField("defaultValuePresencial", e.target.value)}
              className="settings-input"
            />
          </div>
        </div>
      </div>

      {appointmentTypeConfig.mode !== APPOINTMENT_TYPE_MODE.DISABLED && (
        <div className="locations-section">
          <h3 className="section-subtitle">
            <MapPin size={18} />
            <span>Locais de Atendimento Presencial</span>
          </h3>
          <p className="helper-text" style={{ marginBottom: "1rem" }}>
            Adicione diferentes locais para atendimento presencial, cada um com seu próprio valor padrão.
          </p>

          {appointmentTypeConfig.locations.length > 0 && (
            <div className="locations-list">
              {appointmentTypeConfig.locations.map((location, index) => (
                <div key={index} className="location-item">
                  <input
                    type="text"
                    placeholder="Nome do local"
                    value={location.name}
                    onChange={(e) => onUpdateLocation(index, { ...location, name: e.target.value })}
                    className="location-name-input"
                  />
                  <input
                    type="number"
                    placeholder="Valor (R$)"
                    value={location.defaultValue}
                    onChange={(e) => onUpdateLocation(index, { ...location, defaultValue: Number(e.target.value) || 0 })}
                    className="location-value-input"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveLocation(index)}
                    className="remove-location-btn"
                    title="Remover local"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="add-location-form">
            <input
              type="text"
              placeholder="Nome do novo local"
              value={newLocationName}
              onChange={(e) => onNewLocationNameChange(e.target.value)}
              className="location-name-input"
            />
            <input
              type="number"
              placeholder="Valor (R$)"
              value={newLocationValue}
              onChange={(e) => onNewLocationValueChange(e.target.value)}
              className="location-value-input"
            />
            <button
              type="button"
              onClick={onAddLocation}
              className="add-location-btn"
              disabled={!newLocationName.trim() || !newLocationValue}
            >
              <Plus size={18} />
              Adicionar
            </button>
          </div>
        </div>
      )}
        </div>
      )}
    </section>
  );
}
