import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase/config";
import { useNavigate } from "react-router-dom";

import useAgenda from "../hooks/agenda/useAgenda";
import DateNavigation from "../components/agenda/DateNavigation";
import AppointmentList from "../components/agenda/AppointmentList";
import formatDate from "../utils/formatters/formatDate";

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
    handleStatusChange,
    handleAddPatient
  } = useAgenda(user, currentDate);

  const goToPrev = () => setCurrentDate(d => { const newD = new Date(d); newD.setDate(d.getDate() - 1); return newD; });
  const goToNext = () => setCurrentDate(d => { const newD = new Date(d); newD.setDate(d.getDate() + 1); return newD; });
  const goToToday = () => setCurrentDate(new Date());

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="calendar-availability-container">

      {/* Header */}
      <div className="padrao-header">
        <div className="label">Gestão diaria</div>
        <h2>Agenda do dia</h2>
        <p>Gerencie seus horários e consultas do dia</p>
      </div>

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
