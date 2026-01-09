// src/components/publicSchedule/AppointmentForm/AppointmentForm.jsx
import React, { useState, forwardRef } from "react";
import { User, Phone, Lock } from "lucide-react";
import Input from "../../common/Input";
import Button from "../../common/Button";
import { formatWhatsapp } from "../../../utils/formatters/formatWhatsapp";
import formatDate from "../../../utils/formatters/formatDate";
import "./AppointmentForm.css";

const AppointmentForm = forwardRef(
  ({ selectedSlot, onSubmit, onCancel, isSubmitting }, ref) => {
    const [patientName, setPatientName] = useState("");
    const [patientWhatsapp, setPatientWhatsapp] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();

      onSubmit({
        patientName,
        patientWhatsapp, // 🔥 SOMENTE NÚMEROS
      });
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
                value={formatWhatsapp(patientWhatsapp)}
                onChange={(e) =>
                  setPatientWhatsapp(e.target.value.replace(/\D/g, ""))
                }
                className="phone-field"
                autoComplete="tel"
              />
            </div>
          </div>

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
