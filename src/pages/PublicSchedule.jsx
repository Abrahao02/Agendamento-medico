import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, AlertCircle } from "lucide-react";

import { usePublicSchedule } from "../hooks/appointments/usePublicSchedule";
import { logError } from "../utils/logger/logger";

import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import DayCard from "../components/publicSchedule/DayCard";
import AppointmentForm from "../components/publicSchedule/AppointmentForm";
import LocationFilter from "../components/publicSchedule/LocationFilter";
import LoadingFallback from "../components/common/LoadingFallback";
import PublicScheduleHeader from "../components/publicSchedule/PublicScheduleHeader";
import IntroCard from "../components/publicSchedule/IntroCard";
import LimitReachedBanner from "../components/publicSchedule/LimitReachedBanner";
import EmptyState from "../components/publicSchedule/EmptyState";
import { useToast } from "../components/common/Toast";

import "./PublicSchedule.css";

export default function PublicSchedule() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const formRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    doctor,
    availability,
    availableLocations,
    loading,
    error,
    limitReached,
    selectedDay,
    selectedSlot,
    selectedLocation,
    handleDaySelect,
    handleSlotSelect,
    setSelectedLocation,
    createAppointment,
  } = usePublicSchedule(slug);

  const handleSlotClick = (day, time) => {
    handleSlotSelect(day, time);
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
        navigate(`/public/${slug}/success`, { state: result.data });
      } else {
        toast.error(result.error || "Erro ao agendar");
      }
    } catch (err) {
      logError("Erro ao agendar:", err);
      toast.error("Erro ao agendar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    handleSlotSelect(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <LoadingFallback message="Carregando agenda..." />;

  if (error || !doctor) {
    return (
      <div className="public-schedule-container">
        <Card className="error-card">
          <div className="error-content">
            <AlertCircle size={48} color="var(--danger-500)" />
            <h2>Profissional não encontrado</h2>
            <p>
              {error || "O link que você acessou não corresponde a nenhum profissional cadastrado."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="public-schedule-container">
      <PublicScheduleHeader doctor={doctor} />
      <IntroCard />

      {limitReached && <LimitReachedBanner doctor={doctor} />}

      {!limitReached && availableLocations && availableLocations.length > 0 && (
        <LocationFilter
          locations={availableLocations}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          showAllOption={availableLocations.length > 1}
          showPrice={doctor?.publicScheduleConfig?.showPrice ?? true}
          doctor={doctor}
        />
      )}

      {!limitReached && (
        <div className="availability-status">
          <Badge variant={availability.length > 0 ? "success" : "warning"}>
            {availability.length > 0
              ? `${availability.length} dia(s) disponível(is)`
              : "Nenhum horário disponível"}
          </Badge>
        </div>
      )}

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

      {selectedSlot && (
        <AppointmentForm
          ref={formRef}
          selectedSlot={selectedSlot}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={submitting}
          doctor={doctor}
        />
      )}

      {!limitReached && availability.length === 0 && (
        <EmptyState doctor={doctor} />
      )}
    </div>
  );
}