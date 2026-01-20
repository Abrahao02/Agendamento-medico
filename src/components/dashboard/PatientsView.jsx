// ============================================
// 📁 src/components/dashboard/PatientsView.jsx
// Visualização de Pacientes & Agenda (Strategy Pattern)
// ============================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import StatsCard from "./StatsCard";
import DetailsSummary from "./DetailsSummary";
import UpcomingAppointments from "./UpcomingAppointments";
import PendingAppointmentsModal from "./PendingAppointmentsModal";
import AvailableSlotsModal from "./AvailableSlotsModal";
import ConfirmedAppointmentsModal from "./ConfirmedAppointmentsModal";
import AppointmentsSummaryModal from "./AppointmentsSummaryModal";
import NewPatientsModal from "./NewPatientsModal";
import NoShowModal from "./NoShowModal";
import CancelledModal from "./CancelledModal";
import { STATUS_GROUPS, APPOINTMENT_STATUS } from "../../constants/appointmentStatus";

export default function PatientsView({
  statusSummary,
  stats,
  detailsSummary,
  upcomingAppointments,
  filteredAppointments = [],
  filteredAvailability = [],
  patients = [],
}) {
  const navigate = useNavigate();
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isAvailableSlotsModalOpen, setIsAvailableSlotsModalOpen] = useState(false);
  const [isConfirmedModalOpen, setIsConfirmedModalOpen] = useState(false);
  const [isAppointmentsSummaryModalOpen, setIsAppointmentsSummaryModalOpen] = useState(false);
  const [isNewPatientsModalOpen, setIsNewPatientsModalOpen] = useState(false);
  const [isNoShowModalOpen, setIsNoShowModalOpen] = useState(false);
  const [isCancelledModalOpen, setIsCancelledModalOpen] = useState(false);

  // Filtrar apenas appointments pendentes (Pendente e Msg enviada)
  const pendingAppointments = React.useMemo(() => {
    return filteredAppointments.filter(appointment =>
      STATUS_GROUPS.PENDING.includes(appointment.status)
    );
  }, [filteredAppointments]);

  // Filtrar apenas appointments confirmados
  const confirmedAppointments = React.useMemo(() => {
    return filteredAppointments.filter(appointment =>
      appointment.status === APPOINTMENT_STATUS.CONFIRMED
    );
  }, [filteredAppointments]);

  return (
    <>
      {/* Visualização Pacientes & Agenda */}
      <div className="stats-grid patients-view">
        <StatsCard
          icon={CheckCircle}
          value={statusSummary.confirmed}
          title="Confirmados"
          subtitle="Consultas confirmadas"
          color="blue"
          onClick={() => setIsConfirmedModalOpen(true)}
          comparison={stats.confirmedComparison}
        />
        <StatsCard
          icon={AlertTriangle}
          value={statusSummary.pending}
          title="Pendentes"
          subtitle="Ação necessária"
          color="amber"
          onClick={() => setIsPendingModalOpen(true)}
          comparison={stats.pendingComparison}
        />
        <StatsCard
          icon={Clock}
          value={stats.slotsOpen}
          title="Horários disponíveis"
          subtitle="Livres p/ novo agendamento"
          color="green"
          onClick={() => setIsAvailableSlotsModalOpen(true)}
        />
        <StatsCard
          icon={Calendar}
          value={stats.totalAppointments}
          title="Agendamentos ocupados"
          subtitle="Consultas com paciente"
          color="purple"
          onClick={() => setIsAppointmentsSummaryModalOpen(true)}
        />
      </div>

      {/* Charts - Layout 50/50 */}
      <div className="charts-section patients-view">
        <DetailsSummary
          newPatients={detailsSummary.newPatients}
          newPatientsTotal={detailsSummary.newPatientsTotal}
          messagesSent={detailsSummary.messagesSent}
          messagesSentTotal={detailsSummary.messagesSentTotal}
          noShow={detailsSummary.noShow}
          noShowTotal={detailsSummary.noShowTotal}
          cancelled={detailsSummary.cancelled}
          cancelledTotal={detailsSummary.cancelledTotal}
          onNewPatientsClick={() => setIsNewPatientsModalOpen(true)}
          onNoShowClick={() => setIsNoShowModalOpen(true)}
          onCancelledClick={() => setIsCancelledModalOpen(true)}
        />
        <UpcomingAppointments appointments={upcomingAppointments} />
      </div>

      {/* Modal de Pendentes */}
      <PendingAppointmentsModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        appointments={pendingAppointments}
        patients={patients}
      />

      {/* Modal de Horários Disponíveis */}
      <AvailableSlotsModal
        isOpen={isAvailableSlotsModalOpen}
        onClose={() => setIsAvailableSlotsModalOpen(false)}
        availableSlots={filteredAvailability}
      />

      {/* Modal de Confirmados */}
      <ConfirmedAppointmentsModal
        isOpen={isConfirmedModalOpen}
        onClose={() => setIsConfirmedModalOpen(false)}
        appointments={confirmedAppointments}
        patients={patients}
      />

      {/* Modal de Resumo de Agendamentos Ocupados */}
      <AppointmentsSummaryModal
        isOpen={isAppointmentsSummaryModalOpen}
        onClose={() => setIsAppointmentsSummaryModalOpen(false)}
        appointments={filteredAppointments}
      />

      {/* Modal de Novos Pacientes */}
      <NewPatientsModal
        isOpen={isNewPatientsModalOpen}
        onClose={() => setIsNewPatientsModalOpen(false)}
        newPatients={detailsSummary.newPatientsList || []}
      />

      {/* Modal de Não Compareceram */}
      <NoShowModal
        isOpen={isNoShowModalOpen}
        onClose={() => setIsNoShowModalOpen(false)}
        appointments={filteredAppointments}
        patients={patients}
      />

      {/* Modal de Cancelados */}
      <CancelledModal
        isOpen={isCancelledModalOpen}
        onClose={() => setIsCancelledModalOpen(false)}
        appointments={filteredAppointments}
        patients={patients}
      />
    </>
  );
}
