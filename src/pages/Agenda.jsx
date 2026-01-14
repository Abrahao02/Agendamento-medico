// ============================================
// 📁 src/pages/Agenda.jsx - MELHORADO
// Seguindo padrão do Dashboard com cards separados
// ============================================
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import useAgenda from "../hooks/agenda/useAgenda";
import PageHeader from "../components/common/PageHeader/PageHeader";
import DateNavigation from "../components/agenda/DateNavigation";
import AppointmentList from "../components/agenda/AppointmentList";
import DayStats from "../components/availability/DayStats/DayStats";
import AvailableSlotsList from "../components/agenda/AvailableSlotsList/AvailableSlotsList";
import LimitWarningBanner from "../components/common/LimitWarningBanner/LimitWarningBanner";
import formatDate from "../utils/formatter/formatDate";

import "./Agenda.css";

export default function Agenda() {
  const { isLimitReached } = useOutletContext() || {};
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    appointments,
    statusUpdates,
    referenceNames,
    patientStatus,
    whatsappConfig,
    hasUnsavedChanges,
    lockedAppointments,
    handleStatusChange,
    handleAddPatient,
    handleSendWhatsapp,
    handleRemoveSlot,
    totalSlots,
    freeSlots,
    stats,
    occupancyRate,
    activeAppointments,
  } = useAgenda(currentDate);

  const goToPrev = () =>
    setCurrentDate((d) => {
      const newD = new Date(d);
      newD.setDate(d.getDate() - 1);
      return newD;
    });

  const goToNext = () =>
    setCurrentDate((d) => {
      const newD = new Date(d);
      newD.setDate(d.getDate() + 1);
      return newD;
    });

  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="agenda-page-content">
      <PageHeader
        label="Gestão diária"
        title="Agenda do dia"
        description="Gerencie seus horários e consultas do dia"
      />

      {/* Navegação de Datas */}
      <div className="agenda-date-navigation-card">
        <DateNavigation
          currentDate={currentDate}
          onPrev={goToPrev}
          onNext={goToNext}
          onToday={goToToday}
          formatDate={formatDate}
        />
      </div>

      {isLimitReached && <LimitWarningBanner />}

      {/* Cards de Estatísticas */}
      {totalSlots > 0 && (
        <div className="agenda-stats-card">
          <DayStats
            appointments={appointments}
            activeAppointments={activeAppointments}
            totalSlots={totalSlots}
          />
        </div>
      )}

      {/* Lista de Horários Disponíveis */}
      {freeSlots.length > 0 && (
        <div className="agenda-available-slots-card">
          <AvailableSlotsList slots={freeSlots} onRemoveSlot={handleRemoveSlot} />
        </div>
      )}

      {/* Lista de Agendamentos */}
      <div className="agenda-appointments-card">
        <AppointmentList
          appointments={appointments}
          statusUpdates={statusUpdates}
          referenceNames={referenceNames}
          patientStatus={patientStatus}
          lockedAppointments={lockedAppointments}
          onStatusChange={handleStatusChange}
          onAddPatient={handleAddPatient}
          onSendWhatsapp={handleSendWhatsapp}
        />
      </div>

    </div>
  );
}