import React, { forwardRef } from "react";
import { Calendar, User, Phone, Lock, MessageCircle } from "lucide-react";
import Input from "../../common/Input";
import Button from "../../common/Button";
import formatDate from "../../../utils/formatter/formatDate";
import {
  getAppointmentTypeOptions,
  APPOINTMENT_TYPE,
} from "../../../constants/appointmentType";
import { formatLocationDisplay, generatePriceInquiryMessage } from "../../../utils/publicSchedule/priceDisplay";
import { generateWhatsappLink } from "../../../utils/whatsapp/generateWhatsappLink";
import { useAppointmentForm } from "../../../hooks/publicSchedule/useAppointmentForm";
import { cleanWhatsapp } from "../../../utils/whatsapp/cleanWhatsapp";
import "./AppointmentForm.css";

const AppointmentForm = forwardRef(
  ({ selectedSlot, onSubmit, onCancel, isSubmitting, doctor }, ref) => {
    const { formState, config, computed, handlers } = useAppointmentForm({
      selectedSlot,
      doctor,
      onSubmit,
    });


    return (
      <div className="appointment-form-card" ref={ref}>
        <div className="form-header">
          <h3 className="standardized-h3">Solicitar agendamento</h3>
          <p className="selected-time">
            <Calendar size={16} aria-hidden="true" />
            {formatDate(selectedSlot.date)} às {selectedSlot.time}
          </p>
        </div>

        <form onSubmit={handlers.handleSubmit} className="appointment-form">
          <Input
            label="Nome completo"
            name="patientName"
            required
            placeholder="Digite seu nome completo"
            value={formState.patientName}
            onChange={(e) => handlers.setPatientName(e.target.value)}
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
                value={formState.patientWhatsapp}
                onChange={handlers.handleWhatsappChange}
                onBlur={handlers.handleWhatsappBlur}
                className={`phone-field ${formState.shake ? "shake" : ""}`}
                autoComplete="tel"
              />
            </div>
          </div>

          {config.showAppointmentType && !config.isFixed && !computed.slotAppointmentType && (
            <div className="form-group">
              <label className="form-label">Tipo de atendimento</label>
              <select
                value={formState.appointmentType}
                onChange={(e) => handlers.handleAppointmentTypeChange(e.target.value)}
                required
                className="appointment-type-select"
                disabled={!!computed.slotAppointmentType}
              >
                {getAppointmentTypeOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {computed.slotAppointmentType && (
                <p className="form-help-text">
                  Tipo de atendimento definido para este horário: {computed.slotAppointmentType === APPOINTMENT_TYPE.ONLINE ? "Online" : "Presencial"}
                </p>
              )}
            </div>
          )}
          
          {computed.slotAppointmentType && (
            <div className="form-group">
              <label className="form-label">Tipo de atendimento</label>
              <div className="form-readonly">
                {computed.slotAppointmentType === APPOINTMENT_TYPE.ONLINE ? "Online" : "Presencial"}
              </div>
              {!config.showPrice && computed.slotAppointmentType === APPOINTMENT_TYPE.ONLINE && doctor?.whatsapp && (
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
          
          {config.showAppointmentType && !config.isFixed && !computed.slotAppointmentType && formState.appointmentType === APPOINTMENT_TYPE.ONLINE && !config.showPrice && doctor?.whatsapp && (
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

          {config.showLocation && (
            <div className="form-group">
              <label className="form-label">Local de atendimento</label>
              <select
                value={formState.location}
                onChange={(e) => handlers.setLocation(e.target.value)}
                required={config.availableLocations.length > 0}
                className="location-select"
                disabled={config.availableLocations.length === 1}
              >
                <option value="">Selecione um local</option>
                {config.availableLocations.map((location, index) => (
                  <option key={location.name || `location-${index}`} value={location.name}>
                    {formatLocationDisplay({ name: location.name, price: location.defaultValue }, config.showPrice)}
                  </option>
                ))}
              </select>
              {config.slotAllowedLocationIds.length > 0 && config.availableLocations.length === 0 && (
                <p className="form-error-text">
                  Nenhum local disponível para este horário
                </p>
              )}
              {!config.showPrice && formState.location && doctor?.whatsapp && (
                <div className="form-price-info">
                  <p className="form-help-text">
                    Para consultar o valor, entre em contato via WhatsApp:
                  </p>
              <a
                href={generateWhatsappLink(
                  doctor.whatsapp,
                  generatePriceInquiryMessage(
                    config.availableLocations.find(locationItem => locationItem.name === formState.location)?.name
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
