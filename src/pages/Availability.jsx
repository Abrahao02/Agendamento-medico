// ============================================
// 📁 src/pages/Availability.jsx - VERSÃO CORRIGIDA
// ============================================
import React from "react";

// Hook
import { useAvailability } from "../hooks/appointments/useAvailability";

// Components
import PageHeader from "../components/common/PageHeader/PageHeader";
import CalendarWrapper from "../components/availability/CalendarWrapper/CalendarWrapper";
import DayManagement from "../components/availability/DayManagement/DayManagement";
import ContentLoading from "../components/common/ContentLoading/ContentLoading";
import LimitWarningBanner from "../components/common/LimitWarningBanner/LimitWarningBanner";

// Utils
import formatDate from "../utils/formatter/formatDate";

import "./Availability.css";

export default function Availability() {
  const {
    // Estado
    loading,
    error,
    doctor,
    patients,
    selectedDate,
    calendarValue,
    
    // Handlers
    handleSelectDate,
    handleAddSlot,
    handleRemoveSlot,
    handleBookAppointment,
    deleteAppointment,
    markAsCancelled,
    
    // Getters
    getAvailabilityForDate,
    getAllSlotsForDate,
    getAppointmentsForDate,
    getCalendarTileData,
    
    // Limit state
    isLimitReached,
  } = useAvailability();

  /* ==============================
     CALENDAR: TILE CONTENT (BADGES)
     ✅ CORRIGIDO: getCalendarTileData já considera apenas ativos
  ============================== */
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = date.toISOString().split('T')[0];
    const tileData = getCalendarTileData(dateStr);

    if (!tileData.hasFreeSlots && !tileData.hasBookedSlots) return null;

    return (
      <div className="calendar-badges">
        {tileData.freeCount > 0 && (
          <span className="badge free">{tileData.freeCount}</span>
        )}
        {tileData.bookedCount > 0 && (
          <span className="badge booked">{tileData.bookedCount}</span>
        )}
      </div>
    );
  };

  /* ==============================
     LOADING STATE
  ============================== */
  if (loading) {
    return <ContentLoading message="Carregando agenda..." height={400} />;
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
      <PageHeader
        label="Gestão de Agenda"
        title="Calendário de Disponibilidade"
        description="Gerencie seus horários e consultas"
      />

      {isLimitReached && <LimitWarningBanner />}

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
            doctor={doctor}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
            onBookAppointment={handleBookAppointment}
            onDeleteAppointment={deleteAppointment}
            onMarkAsCancelled={markAsCancelled}
            isLimitReached={isLimitReached}
          />
        )}
      </div>
    </div>
  );
}