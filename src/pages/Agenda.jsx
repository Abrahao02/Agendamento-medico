import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase/config";

import useAgenda from "../hooks/agenda/useAgenda";
import PageHeader from "../components/common/PageHeader/PageHeader";
import DateNavigation from "../components/agenda/DateNavigation";
import AppointmentList from "../components/agenda/AppointmentList";
import formatDate from "../utils/formatter/formatDate";
import ContentLoading from "../components/common/ContentLoading/ContentLoading";

import "./Agenda.css";

export default function Agenda({ handleSendWhatsapp }) {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!loading && !user) navigate("/login");

  const {
    appointments,
    statusUpdates,
    referenceNames,
    patientStatus,
    hasUnsavedChanges,
    handleStatusChange,
    handleAddPatient,
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

  if (loading) return <ContentLoading message="Carregando agenda..." />;

  return (
    <div className="calendar-availability-container">

      {/* ✅ PageHeader reutilizável */}
      <PageHeader
        label="Gestão diária"
        title="Agenda do dia"
        description="Gerencie seus horários e consultas do dia"
      />

      {/* Navegação de datas */}
      <DateNavigation
        currentDate={currentDate}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        formatDate={formatDate}
      />

      {/* Lista de consultas */}
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
