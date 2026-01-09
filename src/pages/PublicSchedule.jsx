// src/pages/PublicSchedule/PublicSchedule.jsx
import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, AlertCircle, MessageCircle } from "lucide-react";
import { usePublicSchedule } from "../hooks/appointments/usePublicSchedule";


import Card from "../components/common/Card"
import Badge from "../components/common/Badge"
import DayCard from "../components/publicSchedule/DayCard";
import AppointmentForm from "../components/publicSchedule/AppointmentForm/AppointmentForm";

import LoadingFallback from "../components/common/LoadingFallback/LoadingFallback";

import "./PublicSchedule.css";

export default function PublicSchedule() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    doctor,
    availability,
    loading,
    limitReached,
    selectedDay,
    selectedSlot,
    handleDaySelect,
    handleSlotSelect,
    createAppointment,
  } = usePublicSchedule(slug);

  const handleSlotClick = (dayId, date, time) => {
    handleSlotSelect(dayId, date, time);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const result = await createAppointment(formData);
      
      if (result.success) {
        navigate(`/public/${slug}/success`, {
          state: result.data,
        });
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Erro ao agendar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    handleSlotSelect(null);
  };

  if (loading) {
    return <LoadingFallback message="Carregando agenda..." />;
  }

  if (!doctor) {
    return (
      <div className="public-schedule-container">
        <Card className="error-card">
          <div className="error-content">
            <AlertCircle size={48} color="var(--danger-500)" />
            <h2>Médico não encontrado</h2>
            <p>
              O link que você acessou não corresponde a nenhum médico
              cadastrado.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="public-schedule-container">
      {/* Header */}
      <header className="schedule-header">
        <div className="doctor-info">
          <div className="doctor-avatar">{doctor.name[0]}</div>
          <div>
            <h1>Agende sua consulta</h1>
            <p className="doctor-name">Dr(a). {doctor.name}</p>
          </div>
        </div>
      </header>

      {/* Intro Message */}
      <Card className="intro-card">
        <div className="intro-content">
          <Calendar size={24} />
          <div>
            <h3>Como funciona</h3>
            <p>
              Escolha uma data e horário disponível abaixo, preencha seus dados
              e pronto! Você receberá uma confirmação em breve.
            </p>
          </div>
        </div>
      </Card>

      {/* Limit Reached Banner */}
      {limitReached && (
        <Card className="limit-card">
          <div className="limit-content">
            <AlertCircle size={24} />
            <div>
              <h3>Agenda cheia este mês</h3>
              <p>
                Todos os horários do plano gratuito foram preenchidos. Entre em
                contato pelo WhatsApp para verificar novas datas:
              </p>
              <a
                href={`https://wa.me/${doctor.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-link"
              >
                <MessageCircle size={18} />
                {doctor.whatsapp}
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Availability Status */}
      {!limitReached && (
        <div className="availability-status">
          <Badge variant={availability.length > 0 ? "success" : "warning"}>
            {availability.length > 0
              ? `${availability.length} dia(s) disponível(is)`
              : "Nenhum horário disponível"}
          </Badge>
        </div>
      )}

      {/* Days List */}
      {availability.length > 0 && !limitReached && (
        <div className="days-list">
          {availability.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              isSelected={selectedDay?.id === day.id}
              isDisabled={limitReached}
              onDayClick={handleDaySelect}
              onSlotClick={handleSlotClick}
              selectedSlotTime={selectedSlot?.time}
            />
          ))}
        </div>
      )}

      {/* Appointment Form */}
      {selectedSlot && (
        <AppointmentForm
          ref={formRef}
          selectedSlot={selectedSlot}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={submitting}
        />
      )}

      {/* Footer Info */}
      {!limitReached && availability.length === 0 && (
        <Card className="empty-card">
          <div className="empty-content">
            <Calendar size={48} />
            <h3>Sem horários disponíveis</h3>
            <p>
              Não há horários disponíveis no momento. Entre em contato para
              mais informações.
            </p>
            {doctor.whatsapp && (
              <a
                href={`https://wa.me/${doctor.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn"
              >
                <MessageCircle size={18} />
                Entrar em contato
              </a>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}