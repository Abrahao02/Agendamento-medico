import React, { useState, forwardRef } from "react";
import { User, Phone, Lock, MessageCircle } from "lucide-react";
import Input from "../../common/Input";
import Button from "../../common/Button";
import { formatWhatsapp } from "../../../utils/formatter/formatWhatsapp";
import formatDate from "../../../utils/formatter/formatDate";
import {
  getAppointmentTypeOptions,
  APPOINTMENT_TYPE,
  APPOINTMENT_TYPE_MODE,
} from "../../../constants/appointmentType";
import { normalizeSlot } from "../../../utils/availability/normalizeSlot";
import { formatLocationDisplay, generatePriceInquiryMessage } from "../../../utils/publicSchedule/priceDisplay";
import { generateWhatsappLink } from "../../../utils/whatsapp/generateWhatsappLink";
import "./AppointmentForm.css";

const AppointmentForm = forwardRef(
  ({ selectedSlot, onSubmit, onCancel, isSubmitting, doctor }, ref) => {
    const [patientName, setPatientName] = useState("");
    const [patientWhatsapp, setPatientWhatsapp] = useState("");
    const [appointmentType, setAppointmentType] = useState("");
    const [location, setLocation] = useState("");
    const [shake, setShake] = useState(false);

    const appointmentTypeConfig = doctor?.appointmentTypeConfig || {
      mode: APPOINTMENT_TYPE_MODE.DISABLED,
      fixedType: APPOINTMENT_TYPE.ONLINE,
      locations: [],
    };

    // Get slot constraints
    const slotData = selectedSlot?.slotData;
    const normalizedSlot = slotData && doctor ? normalizeSlot(slotData, doctor) : null;
    const slotAllowedLocationIds = normalizedSlot?.allowedLocationIds || [];
    const slotAppointmentType = normalizedSlot?.appointmentType;

    // Filter available locations based on slot constraints
    const availableLocations = slotAllowedLocationIds.length > 0
      ? appointmentTypeConfig.locations.filter(loc => slotAllowedLocationIds.includes(loc.name))
      : appointmentTypeConfig.locations;

    const showAppointmentType = appointmentTypeConfig.mode !== APPOINTMENT_TYPE_MODE.DISABLED;
    const isFixed = appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED;
    
    // If slot has appointment type constraint, use it
    const effectiveAppointmentType = slotAppointmentType || (isFixed ? appointmentTypeConfig.fixedType : appointmentType);
    
    const showLocation = showAppointmentType && 
      effectiveAppointmentType === APPOINTMENT_TYPE.PRESENCIAL &&
      availableLocations.length > 0;

    // Get showPrice setting from doctor config (default: true)
    const showPrice = doctor?.publicScheduleConfig?.showPrice ?? true;

    React.useEffect(() => {
      // Pre-select appointment type from slot if available
      if (slotAppointmentType) {
        setAppointmentType(slotAppointmentType);
      } else if (isFixed) {
        setAppointmentType(appointmentTypeConfig.fixedType);
      } else if (showAppointmentType && !appointmentType) {
        setAppointmentType(APPOINTMENT_TYPE.ONLINE);
      }
      
      // Pre-select location if slot has only one allowed location
      if (slotAllowedLocationIds.length === 1 && availableLocations.length === 1) {
        setLocation(availableLocations[0].name);
      } else if (!location || (availableLocations.length > 0 && !availableLocations.some(loc => loc.name === location))) {
        // Only reset if location is empty or if current location is not in available locations
        setLocation("");
      }
    }, [slotAppointmentType, slotAllowedLocationIds, isFixed, appointmentTypeConfig.fixedType, showAppointmentType, appointmentType, availableLocations]);

    const handleSubmit = (e) => {
      e.preventDefault();

      const formData = {
        patientName,
        patientWhatsapp,
      };

      if (showAppointmentType) {
        formData.appointmentType = isFixed ? appointmentTypeConfig.fixedType : appointmentType;
        
        if (showLocation && location) {
          formData.location = location;
        }
      }

      onSubmit(formData);
    };


    return (
      <div className="appointment-form-card" ref={ref}>
        <div className="form-header">
          <h3 className="standardized-h3">Solicitar agendamento</h3>
          <p className="selected-time">
            📅 {formatDate(selectedSlot.date)} às {selectedSlot.time}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="appointment-form">
          <Input
            label="Nome completo"
            name="patientName"
            required
            placeholder="Digite seu nome completo"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            leftIcon={<User size={18} />}
            autoComplete="name"
          />

          <div className="form-group">
            <label className="form-label">
              <Phone size={18} />
              WhatsApp
            </label>

            <div className="phone-input">
              <span className="country-code">+55</span>
              <input
                type="tel"
                required
                placeholder="(11) 98888-8888"
                value={patientWhatsapp}
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, "");

                  if (numbers.length > 11) {
                    setShake(true);
                    setTimeout(() => setShake(false), 300);
                    return;
                  }

                  setPatientWhatsapp(numbers);
                }}
                onBlur={() => setPatientWhatsapp(formatWhatsapp(patientWhatsapp))}
                className={`phone-field ${shake ? "shake" : ""}`}
                autoComplete="tel"
              />
            </div>
          </div>

          {showAppointmentType && !isFixed && !slotAppointmentType && (
            <div className="form-group">
              <label className="form-label">Tipo de atendimento</label>
              <select
                value={appointmentType}
                onChange={(e) => {
                  setAppointmentType(e.target.value);
                  setLocation("");
                }}
                required
                className="appointment-type-select"
                disabled={!!slotAppointmentType}
              >
                {getAppointmentTypeOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {slotAppointmentType && (
                <p className="form-help-text">
                  Tipo de atendimento definido para este horário: {slotAppointmentType === APPOINTMENT_TYPE.ONLINE ? "Online" : "Presencial"}
                </p>
              )}
            </div>
          )}
          
          {slotAppointmentType && (
            <div className="form-group">
              <label className="form-label">Tipo de atendimento</label>
              <div className="form-readonly">
                {slotAppointmentType === APPOINTMENT_TYPE.ONLINE ? "Online" : "Presencial"}
              </div>
              {!showPrice && slotAppointmentType === APPOINTMENT_TYPE.ONLINE && doctor?.whatsapp && (
                <div className="form-price-info">
                  <p className="form-help-text">
                    Para consultar o valor, entre em contato via WhatsApp:
                  </p>
                  <a
                    href={generateWhatsappLink(doctor.whatsapp, generatePriceInquiryMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="form-whatsapp-link"
                  >
                    <MessageCircle size={16} />
                    Consultar valor no WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}
          
          {showAppointmentType && !isFixed && !slotAppointmentType && appointmentType === APPOINTMENT_TYPE.ONLINE && !showPrice && doctor?.whatsapp && (
            <div className="form-price-info">
              <p className="form-help-text">
                Para consultar o valor da consulta online, entre em contato via WhatsApp:
              </p>
              <a
                href={(() => {
                  const message = generatePriceInquiryMessage();
                  const cleanNumber = cleanWhatsapp(doctor.whatsapp);
                  const number = cleanNumber.startsWith("55") ? cleanNumber : `55${cleanNumber}`;
                  const encodedMessage = encodeURIComponent(message);
                  return `https://wa.me/${number}?text=${encodedMessage}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="form-whatsapp-link"
              >
                <MessageCircle size={16} />
                Consultar valor no WhatsApp
              </a>
            </div>
          )}

          {showLocation && (
            <div className="form-group">
              <label className="form-label">Local de atendimento</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required={availableLocations.length > 0}
                className="location-select"
                disabled={availableLocations.length === 1}
              >
                <option value="">Selecione um local</option>
                {availableLocations.map((location, index) => (
                  <option key={location.name || `location-${index}`} value={location.name}>
                    {formatLocationDisplay({ name: location.name, price: location.defaultValue }, showPrice)}
                  </option>
                ))}
              </select>
              {slotAllowedLocationIds.length > 0 && availableLocations.length === 0 && (
                <p className="form-error-text">
                  Nenhum local disponível para este horário
                </p>
              )}
              {!showPrice && location && doctor?.whatsapp && (
                <div className="form-price-info">
                  <p className="form-help-text">
                    Para consultar o valor, entre em contato via WhatsApp:
                  </p>
              <a
                href={generateWhatsappLink(
                  doctor.whatsapp,
                  generatePriceInquiryMessage(
                    availableLocations.find(locationItem => locationItem.name === location)?.name
                  )
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="form-whatsapp-link"
              >
                <MessageCircle size={16} />
                Consultar valor no WhatsApp
              </a>
                </div>
              )}
            </div>
          )}

          <div className="privacy-notice">
            <Lock size={16} />
            <p>
              Seus dados serão usados apenas para controle de agendamento e não
              serão compartilhados com terceiros.
            </p>
          </div>

          <div className="form-actions">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              fullWidth
            >
              {isSubmitting ? "Agendando..." : "Solicitar consulta"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              fullWidth
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    );
  }
);

AppointmentForm.displayName = "AppointmentForm";
export default AppointmentForm;
