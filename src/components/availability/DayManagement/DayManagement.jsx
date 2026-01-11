// ============================================
// 📁 src/components/availability/DayManagement/DayManagement.jsx
// ✅ VERSÃO FINAL CORRIGIDA
// ============================================

import { useState, useMemo, useRef, useEffect } from "react";
import { FaCalendarDay } from "react-icons/fa";
import SlotItem from "../SlotItem/SlotItem";
import DayStats from "../DayStats/DayStats";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";
import { STATUS_GROUPS } from "../../../constants/appointmentStatus";
import "./DayManagement.css";

const ALL_TIMES = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00",
];

export default function DayManagement({
  date,
  formattedDate,
  availableSlots,
  allSlots,
  appointments,
  patients,
  onAddSlot,
  onRemoveSlot,
  onBookAppointment,
  onDeleteAppointment,
  onMarkAsCancelled,
}) {
  const [mode, setMode] = useState("add");
  const [newSlot, setNewSlot] = useState("12:00");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const formSectionRef = useRef(null);

  useEffect(() => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [mode]);

  /* ==============================
     ✅ FILTRAR APENAS APPOINTMENTS ATIVOS
  ============================== */
  const activeAppointments = useMemo(() => {
    return appointments.filter(a => STATUS_GROUPS.ACTIVE.includes(a.status));
  }, [appointments]);

  /* ==============================
     COMBINED SLOTS
     ✅ Combina slots + appointments ATIVOS
  ============================== */
  const combinedSlots = useMemo(() => {
    const activeBookedTimes = activeAppointments.map((a) => a.time);
    const combined = [...new Set([...allSlots, ...activeBookedTimes])];
    return combined.sort();
  }, [allSlots, activeAppointments]);

  /* ==============================
     GET APPOINTMENT BY SLOT
     ✅ CORRIGIDO: Prioriza appointments ATIVOS
  ============================== */
  const getAppointmentBySlot = (slot) => {
    // Primeiro tenta encontrar um appointment ATIVO
    const active = appointments.find(a => 
      a.time === slot && STATUS_GROUPS.ACTIVE.includes(a.status)
    );
    
    // Se encontrou ativo, retorna ele
    if (active) return active;
    
    // Se não tem ativo, retorna cancelado (para mostrar histórico)
    return appointments.find(a => a.time === slot);
  };

  /* ==============================
     HANDLE ADD SLOT
  ============================== */
  const handleAddSlot = async () => {
    if (!newSlot) {
      setError("Selecione um horário válido");
      return;
    }

    if (combinedSlots.includes(newSlot)) {
      setError("Este horário já existe");
      return;
    }

    setLoading(true);
    setError("");

    const result = await onAddSlot(newSlot);

    if (result.success) {
      setNewSlot("12:00");
    } else {
      setError(result.error || "Erro ao adicionar horário");
    }

    setLoading(false);
  };

  /* ==============================
     HANDLE REMOVE SLOT
  ============================== */
  const handleRemoveSlot = async (slot) => {
    setLoading(true);
    const result = await onRemoveSlot(slot);
    if (!result.success) {
      setError(result.error || "Erro ao remover horário");
    }
    setLoading(false);
  };

  /* ==============================
     HANDLE DELETE/CANCEL (MODAL)
  ============================== */
  const handleOpenModal = (slot) => {
    const appointment = getAppointmentBySlot(slot);
    if (!appointment) return;

    const patient = patients.find((p) => p.id === appointment.patientId);
    const displayName = patient?.referenceName || appointment.patientName;

    setSelectedAppointment({
      ...appointment,
      displayName,
    });
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    const result = await onDeleteAppointment(selectedAppointment.id);
    
    if (result.success) {
      setModalOpen(false);
      setSelectedAppointment(null);
    } else {
      setError(result.error || "Erro ao excluir consulta");
    }
    
    setLoading(false);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    const result = await onMarkAsCancelled(selectedAppointment.id);
    
    if (result.success) {
      setModalOpen(false);
      setSelectedAppointment(null);
    } else {
      setError(result.error || "Erro ao marcar como cancelado");
    }
    
    setLoading(false);
  };

  /* ==============================
     HANDLE BOOK APPOINTMENT
  ============================== */
  const handleBookAppointment = async () => {
    if (!selectedPatient || !selectedTime) {
      setError("Selecione paciente e horário");
      return;
    }

    setLoading(true);
    setError("");

    const result = await onBookAppointment(selectedPatient, selectedTime);

    if (result.success) {
      setSelectedPatient("");
      setSelectedTime("");
    } else {
      setError(result.error || "Erro ao marcar consulta");
    }

    setLoading(false);
  };

  /* ==============================
     AVAILABLE TIMES FOR BOOKING
  ============================== */
  const bookedTimes = activeAppointments.map((a) => a.time);
  const availableTimesForBooking = ALL_TIMES.filter(
    (t) => !bookedTimes.includes(t)
  );

  /* ==============================
     SORTED PATIENTS
  ============================== */
  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      const nameA = (a.referenceName || a.name).toLowerCase();
      const nameB = (b.referenceName || b.name).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [patients]);

  /* ==============================
     RENDER
  ============================== */
  return (
    <div className="day-slots-card">
      <h3>
        <FaCalendarDay /> DIA {formattedDate}
      </h3>

      <DayStats 
        appointments={appointments}
        activeAppointments={activeAppointments}
        totalSlots={combinedSlots.length}
      />

      <div className="slots-list">
        {combinedSlots.length === 0 ? (
          <p className="empty-message">Nenhum horário cadastrado</p>
        ) : (
          combinedSlots.map((slot, i) => {
            const appointment = getAppointmentBySlot(slot);
            let displayName = null;

            if (appointment) {
              const patient = patients.find((p) => p.id === appointment.patientId);
              displayName = patient?.referenceName || appointment.patientName;
            }

            return (
              <SlotItem
                key={i}
                slot={slot}
                isBooked={!!appointment}
                patientName={displayName}
                status={appointment?.status}
                onRemove={handleRemoveSlot}
                onDelete={handleOpenModal}
              />
            );
          })
        )}
      </div>

      <div className="mode-toggle">
        <button
          className={mode === "add" ? "active" : ""}
          onClick={() => {
            setMode("add");
            setError("");
          }}
        >
          Adicionar Horário
        </button>
        <button
          className={mode === "book" ? "active" : ""}
          onClick={() => {
            setMode("book");
            setError("");
          }}
        >
          Marcar Consulta
        </button>
      </div>

      <div ref={formSectionRef}>
        {mode === "add" && (
          <div className="add-slot">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              disabled={loading}
            />
            <button onClick={handleAddSlot} disabled={loading}>
              {loading ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
        )}

        {mode === "book" && (
          <div className="book-slot">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              disabled={loading}
            >
              <option value="">Selecione o paciente</option>
              {sortedPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.referenceName || p.name} — R$ {p.price || 0}
                </option>
              ))}
            </select>

            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={loading}
            >
              <option value="">Selecione o horário</option>
              {availableTimesForBooking.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <button onClick={handleBookAppointment} disabled={loading}>
              {loading ? "Confirmando..." : "Confirmar"}
            </button>
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <DeleteConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAppointment(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        onConfirmCancel={handleConfirmCancel}
        patientName={selectedAppointment?.displayName}
        time={selectedAppointment?.time}
        loading={loading}
      />
    </div>
  );
}