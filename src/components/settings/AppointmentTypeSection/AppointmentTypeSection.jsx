import { useState, useMemo } from "react";
import { Stethoscope, MapPin, Plus, Trash2, ChevronDown } from "lucide-react";
import {
  getAppointmentTypeSelectionOptions,
  APPOINTMENT_TYPE_SELECTION,
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

  const appointmentTypeVisibility = useMemo(() => {
    const selection = appointmentTypeConfig.selection || APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY;
    return {
      showOnline: selection === APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY || 
                  selection === APPOINTMENT_TYPE_SELECTION.BOTH,
      showPresencial: selection === APPOINTMENT_TYPE_SELECTION.PRESENCIAL_ONLY || 
                      selection === APPOINTMENT_TYPE_SELECTION.BOTH,
    };
  }, [appointmentTypeConfig.selection]);

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
            Configure o tipo de atendimento que estará disponível para seus pacientes.
          </p>

          <div className="form-group">
            <label>Tipo de atendimento</label>
            <select
              value={appointmentTypeConfig.selection || APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY}
              onChange={(e) => onUpdateField("selection", e.target.value)}
              className="settings-select"
            >
              {getAppointmentTypeSelectionOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Valor Online - aparece se Online ou Ambos */}
          {appointmentTypeVisibility.showOnline && (
            <div className="form-group">
              <label>Valor padrão para consulta Online (R$)</label>
              <input
                type="number"
                placeholder="Ex: 100"
                value={appointmentTypeConfig.defaultValueOnline || 0}
                onChange={(e) => onUpdateField("defaultValueOnline", e.target.value)}
                className="settings-input"
              />
            </div>
          )}

          {/* Seção Locais - aparece se Presencial ou Ambos */}
          {appointmentTypeVisibility.showPresencial && (
                  <div className="locations-section">
                    <h3 className="section-subtitle">
                      <MapPin size={18} />
                      <span>Locais de Atendimento Presencial</span>
                    </h3>
                    <p className="helper-text" style={{ marginBottom: "1rem" }}>
                      Adicione diferentes locais para atendimento presencial, cada um com seu próprio valor padrão.
                    </p>

                    {appointmentTypeConfig.locations && appointmentTypeConfig.locations.length > 0 && (
                      <div className="locations-list">
                        {appointmentTypeConfig.locations.map((location, index) => (
                          <div key={location.name || `location-${index}`} className="location-item">
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
