// ============================================
// 📁 src/pages/Agenda.jsx - MELHORADO
// Seguindo padrão do Dashboard com cards separados
// ============================================
import { useState, useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";

import useAgenda from "../hooks/agenda/useAgenda";
import PageHeader from "../components/common/PageHeader";
import DateNavigation from "../components/agenda/DateNavigation";
import AppointmentList from "../components/agenda/AppointmentList";
import DayStats from "../components/availability/DayStats";
import AvailableSlotsList from "../components/agenda/AvailableSlotsList";
import LimitWarningBanner from "../components/common/LimitWarningBanner";
import formatDate from "../utils/formatter/formatDate";

import "./Agenda.css";

export default function Agenda() {
  const { isLimitReached } = useOutletContext() || {};
  const location = useLocation();
  
  // Função auxiliar para converter string YYYY-MM-DD para Date sem problemas de timezone
  const parseDateString = (dateString) => {
    if (!dateString) return null;
    
    // Se já for uma Date, retorna
    if (dateString instanceof Date) {
      return dateString;
    }
    
    // Se for string no formato YYYY-MM-DD, parse manualmente
    if (typeof dateString === 'string') {
      const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
      const match = dateString.match(dateRegex);
      
      if (match) {
        const [, year, month, day] = match;
        // Criar Date usando componentes locais (evita problemas de timezone)
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      // Se não for formato YYYY-MM-DD, tenta new Date normal
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    return null;
  };
  
  // Inicializa com a data do location.state se disponível, senão usa a data atual
  const getInitialDate = () => {
    if (location.state?.date) {
      const parsedDate = parseDateString(location.state.date);
      if (parsedDate) {
        return parsedDate;
      }
    }
    return new Date();
  };
  
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  
  // Atualiza a data quando o location.state mudar
  useEffect(() => {
    if (location.state?.date) {
      const parsedDate = parseDateString(location.state.date);
      if (parsedDate) {
        setCurrentDate(parsedDate);
      }
    }
  }, [location.state]);

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
        />
      </div>

      {isLimitReached && <LimitWarningBanner />}

      {/* Cards de Estatísticas */}
      {totalSlots > 0 && (
        <div className="agenda-stats-card">
          <DayStats
            confirmedCount={stats.confirmed}
            pendingCount={stats.pending}
            occupancyRate={occupancyRate}
            activeCount={activeAppointments.length}
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