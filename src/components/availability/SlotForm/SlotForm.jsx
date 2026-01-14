// ============================================
// Slot Form Component
// Used for creating slots with appointment type and location selection
// ============================================
import React, { useState, useEffect } from "react";
import { APPOINTMENT_TYPE, APPOINTMENT_TYPE_MODE, getAppointmentTypeOptions } from "../../../constants/appointmentType";
import { normalizeTo24Hour } from "../../../utils/time/normalizeTime";
import "./SlotForm.css";

export default function SlotForm({
  time,
  onTimeChange,
  appointmentType,
  onAppointmentTypeChange,
  selectedLocationIds,
  onLocationIdsChange,
  locations = [],
  appointmentTypeConfig,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}) {
  const [localError, setLocalError] = useState(null);

  // Determine if location selection is required
  const requiresLocation = appointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 1;
  const showLocationSelector = appointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 0;

  // Auto-select single location if only one exists
  useEffect(() => {
    if (appointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length === 1) {
      if (!selectedLocationIds.includes(locations[0].name)) {
        onLocationIdsChange([locations[0].name]);
      }
    } else if (appointmentType === APPOINTMENT_TYPE.ONLINE) {
      // Clear locations for online appointments
      if (selectedLocationIds.length > 0) {
        onLocationIdsChange([]);
      }
    }
  }, [appointmentType, locations, selectedLocationIds, onLocationIdsChange]);

  const handleToggleLocation = (locationId) => {
    if (selectedLocationIds.includes(locationId)) {
      onLocationIdsChange(selectedLocationIds.filter(id => id !== locationId));
    } else {
      onLocationIdsChange([...selectedLocationIds, locationId]);
    }
    setLocalError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!time) {
      setLocalError("Selecione um horário");
      return;
    }

    if (!appointmentType) {
      setLocalError("Selecione o tipo de atendimento");
      return;
    }

    if (requiresLocation && selectedLocationIds.length === 0) {
      setLocalError("Selecione pelo menos um local para atendimento presencial");
      return;
    }

    onSubmit({
      time,
      appointmentType,
      allowedLocationIds: appointmentType === APPOINTMENT_TYPE.ONLINE ? [] : selectedLocationIds,
    });
  };

  const displayError = error || localError;

  // If appointment type mode is fixed, use the fixed type
  const effectiveAppointmentType = appointmentTypeConfig?.mode === APPOINTMENT_TYPE_MODE.FIXED
    ? appointmentTypeConfig.fixedType
    : appointmentType;

  return (
    <form className="slot-form" onSubmit={handleSubmit}>
      <div className="slot-form-row">
        <div className="slot-form-field">
          <label className="slot-form-label">Horário</label>
          <input
            type="time"
            value={time}
            onChange={(e) => {
              // Normaliza para formato 24h mesmo no mobile
              const normalizedTime = normalizeTo24Hour(e.target.value);
              onTimeChange(normalizedTime);
              setLocalError(null);
            }}
            className="slot-form-input"
            required
            disabled={loading}
            min="00:00"
            max="23:59"
            step="60"
            lang="pt-BR"
            data-format="24"
          />
        </div>

        {appointmentTypeConfig?.mode !== APPOINTMENT_TYPE_MODE.FIXED && (
          <div className="slot-form-field">
            <label className="slot-form-label">Tipo de atendimento</label>
            <select
              value={appointmentType || ""}
              onChange={(e) => {
                onAppointmentTypeChange(e.target.value);
                setLocalError(null);
              }}
              className="slot-form-select"
              required
              disabled={loading}
            >
              <option value="">Selecione</option>
              {getAppointmentTypeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {appointmentTypeConfig?.mode === APPOINTMENT_TYPE_MODE.FIXED && (
          <div className="slot-form-field">
            <label className="slot-form-label">Tipo de atendimento</label>
            <div className="slot-form-readonly">
              {effectiveAppointmentType === APPOINTMENT_TYPE.ONLINE ? "Online" : "Presencial"}
            </div>
          </div>
        )}
      </div>

      {showLocationSelector && (
        <div className="slot-form-field">
          <label className="slot-form-label">
            Local da consulta {requiresLocation && <span className="required">*</span>}
          </label>
          <div className="location-checkboxes">
            {locations.map((location) => (
              <label key={location.name} className="location-checkbox-label">
                <input
                  type={locations.length > 1 ? "checkbox" : "radio"}
                  checked={selectedLocationIds.includes(location.name)}
                  onChange={() => handleToggleLocation(location.name)}
                  disabled={loading}
                  className="location-checkbox"
                />
                <span className="location-checkbox-text">
                  {location.name}
                  {location.defaultValue > 0 && (
                    <span className="location-price"> - R$ {location.defaultValue.toFixed(2)}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
          {locations.length === 1 && (
            <p className="slot-form-help">Único local configurado será usado automaticamente</p>
          )}
        </div>
      )}

      {displayError && (
        <div className="slot-form-error">{displayError}</div>
      )}

      <div className="slot-form-actions">
        <button
          type="submit"
          className="slot-form-submit"
          disabled={loading}
        >
          {loading ? "Adicionando..." : "Adicionar horário"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="slot-form-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
