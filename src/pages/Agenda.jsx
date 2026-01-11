// ============================================
// 📁 src/pages/Agenda.jsx - REFATORADO
// ============================================
import { useState } from "react";

import useAgenda from "../hooks/agenda/useAgenda";
import PageHeader from "../components/common/PageHeader/PageHeader";
import DateNavigation from "../components/agenda/DateNavigation";
import AppointmentList from "../components/agenda/AppointmentList";
import formatDate from "../utils/formatter/formatDate";

import "./Agenda.css";

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    appointments,
    statusUpdates,
    referenceNames,
    patientStatus,
    whatsappConfig,
    hasUnsavedChanges,
    handleStatusChange,
    handleAddPatient,
    handleSendWhatsapp,
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
    <div className="calendar-availability-container">
      <PageHeader
        label="Gestão diária"
        title="Agenda do dia"
        description="Gerencie seus horários e consultas do dia"
      />

      <DateNavigation
        currentDate={currentDate}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        formatDate={formatDate}
      />

      <AppointmentList
        appointments={appointments}
        statusUpdates={statusUpdates}
        referenceNames={referenceNames}
        patientStatus={patientStatus}
        onStatusChange={handleStatusChange}
        onAddPatient={handleAddPatient}
        onSendWhatsapp={handleSendWhatsapp}
      />
    </div>
  );
}