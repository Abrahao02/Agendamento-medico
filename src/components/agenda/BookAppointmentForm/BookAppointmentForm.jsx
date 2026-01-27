// ============================================
// 📁 src/components/agenda/BookAppointmentForm/BookAppointmentForm.jsx
// Formulário para marcar consulta
// ============================================
import { createPortal } from 'react-dom';
import React, { useState, useMemo } from 'react';
import { Calendar, X } from 'lucide-react';
import { useModal } from '../../../hooks/common/useModal';
import { getAppointmentTypeOptions } from '../../../constants/appointmentType';
import { APPOINTMENT_TYPE, APPOINTMENT_TYPE_MODE } from '../../../constants/appointmentType';
import { normalizeTo24Hour } from '../../../utils/time/normalizeTime';
import { formatCurrency } from '../../../utils/formatter/formatCurrency';
import './BookAppointmentForm.css';

export default function BookAppointmentForm({
  isOpen,
  onClose,
  onSubmit,
  patients = [],
  doctor,
  appointments = [],
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
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [appointmentType, setAppointmentType] = useState(() =>
    isFixed ? appointmentTypeConfig.fixedType : APPOINTMENT_TYPE.ONLINE
  );
  const [locationId, setLocationId] = useState("");
  const [priceMode, setPriceMode] = useState("patient");
  const [dealValue, setDealValue] = useState("");
  const [localError, setLocalError] = useState("");

  // Erro combinado: local ou externo
  const error = localError || externalError || "";

  // Variáveis derivadas que dependem de appointmentType
  const showLocationSelector = appointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 0;
  const requiresLocation = appointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 1;

  // Função para resetar o formulário
  const resetForm = () => {
    setSelectedPatient("");
    setSelectedTime("12:00");
    setAppointmentType(isFixed ? appointmentTypeConfig.fixedType : APPOINTMENT_TYPE.ONLINE);
    setLocationId("");
    setPriceMode("patient");
    setDealValue("");
    setLocalError("");
  };

  // Handler para fechar modal (reseta form + chama onClose)
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handler para mudança de tipo de consulta
  const handleAppointmentTypeChange = (newType) => {
    setAppointmentType(newType);
    // Auto-selecionar location quando presencial e há apenas 1 local
    if (newType === APPOINTMENT_TYPE.PRESENCIAL && locations.length === 1) {
      setLocationId(locations[0].name);
    } else if (newType === APPOINTMENT_TYPE.ONLINE) {
      setLocationId("");
    }
  };

  const sortedPatients = useMemo(
    () =>
      [...patients].sort((a, b) => {
        const nameA = (a.referenceName || a.name).toLowerCase();
        const nameB = (b.referenceName || b.name).toLowerCase();
        return nameA.localeCompare(nameB);
      }),
    [patients]
  );

  const selectedPatientData = useMemo(() => {
    return patients.find(p => p.id === selectedPatient);
  }, [patients, selectedPatient]);

  const isTimeBooked = (time) => {
    return appointments.some(appt => {
      const isActive = appt.status !== "Cancelado";
      return isActive && appt.time === time;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!selectedPatient) {
      setLocalError("Selecione um paciente");
      return;
    }

    if (!selectedTime) {
      setLocalError("Selecione um horário");
      return;
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    const normalizedTime = normalizeTo24Hour(selectedTime);
    if (!timeRegex.test(normalizedTime)) {
      setLocalError("Horário inválido. Use o formato HH:mm (ex: 14:30)");
      return;
    }

    if (isTimeBooked(normalizedTime)) {
      setLocalError("Este horário já está ocupado. Selecione outro horário.");
      return;
    }

    if (requiresLocation && !locationId) {
      setLocalError("Selecione pelo menos um local para atendimento presencial");
      return;
    }

    let customValue = null;
    if (priceMode === "deal") {
      if (!dealValue.trim()) {
        setLocalError("Informe o valor do acordo");
        return;
      }
      const normalizedDealValue = dealValue.replace(",", ".");
      const parsedValue = Number(normalizedDealValue);
      if (Number.isNaN(parsedValue) || parsedValue < 0) {
        setLocalError("Valor inválido. Use 0,00 ou maior.");
        return;
      }
      customValue = parsedValue;
    }

    const result = await onSubmit({
      patientId: selectedPatient,
      time: normalizedTime,
      appointmentType: showAppointmentType ? appointmentType : null,
      location: locationId || null,
      customValue,
    });

    if (result?.success) {
      handleClose();
    } else if (result?.error) {
      setLocalError(result.error);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="book-appointment-modal__overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-appointment-modal-title"
    >
      <div className="book-appointment-modal__container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="book-appointment-modal__header">
          <button
            className="book-appointment-modal__close"
            onClick={handleClose}
            aria-label="Fechar modal"
            disabled={loading}
          >
            <X />
          </button>

          <div className="book-appointment-modal__icon">
            <Calendar />
          </div>

          <h2 id="book-appointment-modal-title" className="book-appointment-modal__title">
            Marcar Consulta
          </h2>
        </div>

        {/* Body - Formulário */}
        <form className="book-appointment-modal__body" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="book-patient">
              Paciente <span className="required">*</span>
            </label>
            <select
              id="book-patient"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              disabled={loading || isLimitReached}
              required
            >
              <option value="">Selecione um paciente</option>
              {sortedPatients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.referenceName || patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="book-time">
              Horário <span className="required">*</span>
            </label>
            <input
              id="book-time"
              type="time"
              value={selectedTime}
              onChange={(e) => {
                const normalizedTime = normalizeTo24Hour(e.target.value);
                setSelectedTime(normalizedTime);
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
              <label htmlFor="book-appointment-type">Tipo de Consulta</label>
              <select
                id="book-appointment-type"
                value={appointmentType}
                onChange={(e) => handleAppointmentTypeChange(e.target.value)}
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

          {showLocationSelector && (
            <div className="form-field">
              <label htmlFor="book-location">
                Local {requiresLocation && <span className="required">*</span>}
              </label>
              <select
                id="book-location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                disabled={loading || isLimitReached}
                required={requiresLocation}
              >
                {!requiresLocation && <option value="">Nenhum</option>}
                {locations.map((location) => (
                  <option key={location.name} value={location.name}>
                    {location.name}
                    {location.defaultValue > 0 && ` - ${formatCurrency(location.defaultValue)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="book-slot-deal-toggle">
            <input
              type="checkbox"
              checked={priceMode === "deal"}
              onChange={(e) => {
                if (e.target.checked) {
                  setPriceMode("deal");
                } else {
                  setPriceMode("patient");
                  setDealValue("");
                }
              }}
              disabled={loading || isLimitReached}
            />
            <span>Acordo (definir valor diferente do padrão)</span>
          </label>

          {priceMode === "deal" && (
            <div className="form-field">
              <label htmlFor="book-deal-value">
                Valor do Acordo <span className="required">*</span>
              </label>
              <input
                id="book-deal-value"
                type="number"
                min="0"
                step="0.01"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                disabled={loading || isLimitReached}
                placeholder="0,00"
                required
              />
            </div>
          )}

          {selectedPatientData && priceMode === "patient" && (
            <div className="form-field-info">
              <span>Valor padrão: {formatCurrency(selectedPatientData.price || 0)}</span>
            </div>
          )}

          {(error || externalError) && (
            <div className="book-appointment-modal__error">
              <span>{error || externalError}</span>
            </div>
          )}
        </form>

        {/* Footer - Botões */}
        <div className="book-appointment-modal__footer">
          <button
            type="button"
            className="book-appointment-modal__button book-appointment-modal__button--cancel"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="book-appointment-modal__button book-appointment-modal__button--submit"
            onClick={handleSubmit}
            disabled={loading || isLimitReached}
          >
            {loading ? "Marcando..." : "Marcar Consulta"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
