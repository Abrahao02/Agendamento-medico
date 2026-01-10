// src/pages/Availability/Availability.jsx
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

import { auth } from "../services/firebase/config";
import { useAvailability } from "../hooks/appointments/useAvaibility";

import CalendarWrapper from "../components/availability/CalendarWrapper/CalendarWrapper";
import DayManagement from "../components/availability/DayManagement/DayManagement";
import LoadingFallback from "../components/common/LoadingFallback";

import formatDate from "../utils/formatters/formatDate";
import "./Availability.css";

export default function Availability() {
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();

  const {
    doctor,
    patients,
    loading,
    error,
    getAvailabilityForDate,
    getAllSlotsForDate,
    getAppointmentsForDate,
    getCalendarTileData,
    addSlot,
    removeSlot,
    bookAppointment,
    cancelAppointment,
  } = useAvailability(user?.uid);

  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarValue, setCalendarValue] = useState(new Date());

  /* ==============================
     FORMAT DATE HELPER
  ============================== */
  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  /* ==============================
     AUTH REDIRECT
  ============================== */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  /* ==============================
     SET INITIAL DATE (TODAY)
  ============================== */
  useEffect(() => {
    const today = new Date();
    setSelectedDate(formatLocalDate(today));
    setCalendarValue(today);
  }, []);

  /* ==============================
     CALENDAR: SELECT DATE
  ============================== */
  const handleSelectDate = (date) => {
    const dateStr = formatLocalDate(date);
    setSelectedDate(dateStr);
    setCalendarValue(date);
  };

  /* ==============================
     CALENDAR: TILE CONTENT (BADGES)
  ============================== */
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = formatLocalDate(date);
    const tileData = getCalendarTileData(dateStr);

    if (!tileData.hasFreeSlots && !tileData.hasBookedSlots) return null;

    return (
      <div className="calendar-badges">
        {tileData.freeCount > 0 && <span className="badge free">{tileData.freeCount}</span>}
        {tileData.bookedCount > 0 && <span className="badge booked">{tileData.bookedCount}</span>}
      </div>
    );
  };


  /* ==============================
     HANDLE ADD SLOT
  ============================== */
  const handleAddSlot = async (slot) => {
    if (!selectedDate) {
      return { success: false, error: "Nenhuma data selecionada" };
    }
    return await addSlot(selectedDate, slot);
  };

  /* ==============================
     HANDLE REMOVE SLOT
  ============================== */
  const handleRemoveSlot = async (slot) => {
    if (!selectedDate) {
      return { success: false, error: "Nenhuma data selecionada" };
    }
    return await removeSlot(selectedDate, slot);
  };

  /* ==============================
     HANDLE BOOK APPOINTMENT
  ============================== */
  const handleBookAppointment = async (patientId, time) => {
    if (!selectedDate) {
      return { success: false, error: "Nenhuma data selecionada" };
    }
    return await bookAppointment({
      patientId,
      date: selectedDate,
      time,
    });
  };

  /* ==============================
     HANDLE CANCEL APPOINTMENT
  ============================== */
  const handleCancelAppointment = async (appointmentId) => {
    return await cancelAppointment(appointmentId);
  };

  /* ==============================
     LOADING STATE
  ============================== */
  if (authLoading || loading) {
    return <LoadingFallback message="Carregando agenda..." />;
  }

  /* ==============================
     ERROR STATE
  ============================== */
  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2>Erro ao carregar</h2>
          <p className="error">{error}</p>
          <button onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  /* ==============================
     RENDER
  ============================== */
  return (
    <div className="availability-page">
      {/* Header */}
      <div className="calendar-header">
        <div className="label">Gestão de Agenda</div>
        <h2>Calendário de Disponibilidade</h2>
        <p>Gerencie seus horários e consultas</p>
      </div>

      {/* Layout */}
      <div className="calendar-layout">
        {/* CALENDÁRIO */}
        <CalendarWrapper
          value={calendarValue}
          onSelectDate={handleSelectDate}
          tileContent={tileContent}
        />

        {/* GERENCIAMENTO DO DIA */}
        {selectedDate && (
          <DayManagement
            date={selectedDate}
            formattedDate={formatDate(selectedDate)}
            availableSlots={getAvailabilityForDate(selectedDate)}
            allSlots={getAllSlotsForDate(selectedDate)}
            appointments={getAppointmentsForDate(selectedDate)}
            patients={patients}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
            onBookAppointment={handleBookAppointment}
            onCancelAppointment={handleCancelAppointment}
          />
        )}
      </div>
    </div>
  );
}
