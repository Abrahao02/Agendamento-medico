import React, { useState, forwardRef } from "react";
import { User, Phone, Lock } from "lucide-react";
import Input from "../../common/Input";
import Button from "../../common/Button";
import { formatWhatsapp } from "../../../utils/formatter/formatWhatsapp";
import formatDate from "../../../utils/formatter/formatDate";
import {
  getAppointmentTypeOptions,
  APPOINTMENT_TYPE,
  APPOINTMENT_TYPE_MODE,
} from "../../../constants/appointmentType";
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

    const showAppointmentType = appointmentTypeConfig.mode !== APPOINTMENT_TYPE_MODE.DISABLED;
    const isFixed = appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED;
    const showLocation = showAppointmentType && 
      (isFixed ? appointmentTypeConfig.fixedType === APPOINTMENT_TYPE.PRESENCIAL : appointmentType === APPOINTMENT_TYPE.PRESENCIAL) &&
      appointmentTypeConfig.locations.length > 0;

    React.useEffect(() => {
      if (isFixed) {
        setAppointmentType(appointmentTypeConfig.fixedType);
      } else if (showAppointmentType && !appointmentType) {
        setAppointmentType(APPOINTMENT_TYPE.ONLINE);
      }
    }, [isFixed, appointmentTypeConfig.fixedType, showAppointmentType, appointmentType]);

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
          <h3>Confirmar agendamento</h3>
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

          {showAppointmentType && !isFixed && (
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
              >
                {getAppointmentTypeOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showLocation && (
            <div className="form-group">
              <label className="form-label">Local de atendimento</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="location-select"
              >
                <option value="">Selecione um local</option>
                {appointmentTypeConfig.locations.map((loc, index) => (
                  <option key={index} value={loc.name}>
                    {loc.name} - R$ {loc.defaultValue.toFixed(2)}
                  </option>
                ))}
              </select>
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
              {isSubmitting ? "Agendando..." : "Confirmar consulta"}
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
