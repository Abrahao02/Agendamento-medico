// ============================================
// 📁 src/components/agenda/AddSlotForm/AddSlotForm.jsx
// Formulário para adicionar horário disponível
// ============================================
import { createPortal } from 'react-dom';
import React, { useState, useMemo } from 'react';
import { Clock, X } from 'lucide-react';
import { useModal } from '../../../hooks/common/useModal';
import { getAppointmentTypeOptions } from '../../../constants/appointmentType';
import { APPOINTMENT_TYPE, APPOINTMENT_TYPE_MODE } from '../../../constants/appointmentType';
import { normalizeTo24Hour } from '../../../utils/time/normalizeTime';
import './AddSlotForm.css';

export default function AddSlotForm({
  isOpen,
  onClose,
  onSubmit,
  doctor,
  existingSlots = [],
  isLimitReached = false,
  loading = false,
  error: externalError,
}) {
  const { handleBackdropClick, handleKeyDown } = useModal(isOpen, onClose);

  const appointmentTypeConfig = useMemo(() =>
    doctor?.appointmentTypeConfig || {
      mode: APPOINTMENT_TYPE_MODE.DISABLED,
      fixedType: APPOINTMENT_TYPE.ONLINE,
      locations: [],
    },
    [doctor?.appointmentTypeConfig]
  );

  const locations = useMemo(() =>
    appointmentTypeConfig.locations || [],
    [appointmentTypeConfig.locations]
  );

  const showAppointmentType = appointmentTypeConfig.mode !== APPOINTMENT_TYPE_MODE.DISABLED;
  const isFixed = appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED;

  // Estados inicializados com valores derivados da config
  const [slotTime, setSlotTime] = useState("12:00");
  const [appointmentType, setAppointmentType] = useState(() =>
    isFixed ? appointmentTypeConfig.fixedType : APPOINTMENT_TYPE.ONLINE
  );
  const [locationIds, setLocationIds] = useState([]);
  const [localError, setLocalError] = useState("");

  // Erro combinado: local ou externo
  const error = localError || externalError || "";

  // Função para resetar o formulário
  const resetForm = () => {
    setSlotTime("12:00");
    setAppointmentType(isFixed ? appointmentTypeConfig.fixedType : APPOINTMENT_TYPE.ONLINE);
    setLocationIds([]);
    setLocalError("");
  };

  // Handler para fechar modal (reseta form + chama onClose)
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLocationToggle = (locationName) => {
    setLocationIds(prev => {
      if (prev.includes(locationName)) {
        return prev.filter(id => id !== locationName);
      } else {
        return [...prev, locationName];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!slotTime) {
      setLocalError("Selecione um horário");
      return;
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    const normalizedTime = normalizeTo24Hour(slotTime);
    if (!timeRegex.test(normalizedTime)) {
      setLocalError("Horário inválido. Use o formato HH:mm (ex: 14:30)");
      return;
    }

    // Verificar se o horário já existe
    const slotExists = existingSlots.some(slot => {
      const sTime = typeof slot === "string" ? slot : (slot?.time || null);
      return sTime === normalizedTime;
    });

    if (slotExists) {
      setLocalError("Este horário já existe");
      return;
    }

    const slotData = {
      time: normalizedTime,
      appointmentType: showAppointmentType ? appointmentType : null,
      allowedLocationIds: locationIds.length > 0 ? locationIds : [],
    };

    const result = await onSubmit(slotData);

    if (result?.success) {
      handleClose();
    } else if (result?.error) {
      setLocalError(result.error);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="add-slot-modal__overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-slot-modal-title"
    >
      <div className="add-slot-modal__container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="add-slot-modal__header">
          <button
            className="add-slot-modal__close"
            onClick={handleClose}
            aria-label="Fechar modal"
            disabled={loading}
          >
            <X />
          </button>

          <div className="add-slot-modal__icon">
            <Clock />
          </div>

          <h2 id="add-slot-modal-title" className="add-slot-modal__title">
            Adicionar Horário Disponível
          </h2>
        </div>

        {/* Body - Formulário */}
        <form className="add-slot-modal__body" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="slot-time">
              Horário <span className="required">*</span>
            </label>
            <input
              id="slot-time"
              type="time"
              value={slotTime}
              onChange={(e) => {
                const normalizedTime = normalizeTo24Hour(e.target.value);
                setSlotTime(normalizedTime);
              }}
              disabled={loading || isLimitReached}
              min="00:00"
              max="23:59"
              step="60"
              required
            />
          </div>

          {showAppointmentType && !isFixed && (
            <div className="form-field">
              <label htmlFor="slot-appointment-type">Tipo de Consulta</label>
              <select
                id="slot-appointment-type"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                disabled={loading || isLimitReached}
              >
                {getAppointmentTypeOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {appointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 0 && (
            <div className="form-field">
              <label>Locais Permitidos</label>
              <div className="location-checkboxes">
                {locations.map((location) => (
                  <label key={location.name} className="location-checkbox">
                    <input
                      type="checkbox"
                      checked={locationIds.includes(location.name)}
                      onChange={() => handleLocationToggle(location.name)}
                      disabled={loading || isLimitReached}
                    />
                    <span>{location.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(error || externalError) && (
            <div className="add-slot-modal__error">
              <span>{error || externalError}</span>
            </div>
          )}
        </form>

        {/* Footer - Botões */}
        <div className="add-slot-modal__footer">
          <button
            type="button"
            className="add-slot-modal__button add-slot-modal__button--cancel"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="add-slot-modal__button add-slot-modal__button--submit"
            onClick={handleSubmit}
            disabled={loading || isLimitReached}
          >
            {loading ? "Adicionando..." : "Adicionar Horário"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
