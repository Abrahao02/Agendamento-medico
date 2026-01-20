// ============================================
// Slot Form Component
// Used for creating slots with appointment type and location selection
// ============================================
import React from "react";
import { APPOINTMENT_TYPE, APPOINTMENT_TYPE_MODE, getAppointmentTypeOptions } from "../../../constants/appointmentType";
import { normalizeTo24Hour } from "../../../utils/time/normalizeTime";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import { useSlotForm } from "../../../hooks/availability/useSlotForm";
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
  const { state, computed, handlers } = useSlotForm({
    appointmentType,
    locations,
    selectedLocationIds,
    onLocationIdsChange,
    time,
    onSubmit,
    appointmentTypeConfig,
  });

  const displayError = error || state.localError;

  return (
    <form className="slot-form" onSubmit={handlers.handleSubmit}>
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
              handlers.setLocalError(null);
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
                handlers.setLocalError(null);
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
              {computed.effectiveAppointmentType === APPOINTMENT_TYPE.ONLINE ? "Online" : "Presencial"}
            </div>
          </div>
        )}
      </div>

      {computed.showLocationSelector && (
        <div className="slot-form-field">
          <label className="slot-form-label">
            Local da consulta {computed.requiresLocation && <span className="required">*</span>}
          </label>
          <div className="location-checkboxes">
            {locations.map((location) => (
              <label key={location.name} className="location-checkbox-label">
                <input
                  type={locations.length > 1 ? "checkbox" : "radio"}
                  checked={selectedLocationIds.includes(location.name)}
                  onChange={() => handlers.handleToggleLocation(location.name)}
                  disabled={loading}
                  className="location-checkbox"
                />
                <span className="location-checkbox-text">
                  {location.name}
                  {location.defaultValue > 0 && (
                    <span className="location-price"> - {formatCurrency(location.defaultValue)}</span>
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
