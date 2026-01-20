import { useMemo } from "react";
import { Stethoscope, MapPin, Plus, Trash2, ChevronDown } from "lucide-react";
import {
  getAppointmentTypeSelectionOptions,
  APPOINTMENT_TYPE_SELECTION,
} from "../../../constants/appointmentType";
import { useCollapsibleSection } from "../../../hooks/common/useCollapsibleSection";
import "./AppointmentTypeSection.css";

export default function AppointmentTypeSection({
  appointmentTypeConfig,
  onUpdateField,
  // Props agrupadas (ISP)
  locations = null,
  // Props individuais (compatibilidade)
  onAddLocation,
  onUpdateLocation,
  onRemoveLocation,
  newLocationName,
  newLocationValue,
  onNewLocationNameChange,
  onNewLocationValueChange,
}) {
  const { state, handlers } = useCollapsibleSection(true);

  // Extrair valores das props agrupadas ou usar valores individuais (compatibilidade)
  const locationsList = locations?.list || appointmentTypeConfig?.locations || [];
  const newLocation = locations?.new || { name: newLocationName || "", value: newLocationValue || "" };
  const locationHandlers = locations?.handlers || {
    add: onAddLocation,
    update: onUpdateLocation,
    remove: onRemoveLocation,
    setName: onNewLocationNameChange,
    setValue: onNewLocationValueChange,
  };

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
        onClick={handlers.toggleExpanded}
        aria-expanded={state.isExpanded}
      >
        <div className="section-header">
          <Stethoscope size={20} />
          <h2>Tipo de Atendimento</h2>
        </div>
        <ChevronDown
          size={20}
          className={`collapse-icon ${state.isExpanded ? "expanded" : ""}`}
        />
      </button>
      
      {state.isExpanded && (
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

              {locationsList.length > 0 && (
                <div className="locations-list">
                  {locationsList.map((location, index) => (
                    <div key={location.name || `location-${index}`} className="location-item">
                      <input
                        type="text"
                        placeholder="Nome do local"
                        value={location.name}
                        onChange={(e) => locationHandlers.update(index, { ...location, name: e.target.value })}
                        className="location-name-input"
                      />
                      <input
                        type="number"
                        placeholder="Valor (R$)"
                        value={location.defaultValue}
                        onChange={(e) => locationHandlers.update(index, { ...location, defaultValue: Number(e.target.value) || 0 })}
                        className="location-value-input"
                      />
                      <button
                        type="button"
                        onClick={() => locationHandlers.remove(index)}
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
                  value={newLocation.name}
                  onChange={(e) => locationHandlers.setName(e.target.value)}
                  className="location-name-input"
                />
                <input
                  type="number"
                  placeholder="Valor (R$)"
                  value={newLocation.value}
                  onChange={(e) => locationHandlers.setValue(e.target.value)}
                  className="location-value-input"
                />
                <button
                  type="button"
                  onClick={locationHandlers.add}
                  className="add-location-btn"
                  disabled={!newLocation.name.trim() || !newLocation.value}
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
