// src/pages/Availability/components/DayManagement.jsx
import { useState, useMemo } from "react";
import { FaCalendarDay } from "react-icons/fa";
import SlotItem from "../SlotItem/SlotItem"; // IMPORTA O COMPONENTE
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
  appointments,
  patients,
  onAddSlot,
  onRemoveSlot,
  onBookAppointment,
  onCancelAppointment,
}) {
  const [mode, setMode] = useState("add"); // "add" | "book"
  const [newSlot, setNewSlot] = useState("12:00");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ==============================
     COMBINED SLOTS (AVAIL + APPS)
  ============================== */
  const allSlots = useMemo(() => {
    const bookedTimes = appointments.map((a) => a.time);
    const combined = [...new Set([...availableSlots, ...bookedTimes])];
    return combined.sort();
  }, [availableSlots, appointments]);

  /* ==============================
     GET APPOINTMENT BY SLOT
  ============================== */
  const getAppointmentBySlot = (slot) => {
    return appointments.find((a) => a.time === slot);
  };

  /* ==============================
     HANDLE ADD SLOT
  ============================== */
  const handleAddSlot = async () => {
    if (!newSlot) {
      setError("Selecione um horário válido");
      return;
    }

    if (allSlots.includes(newSlot)) {
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
     HANDLE REMOVE SLOT OR CANCEL
  ============================== */
  const handleRemoveSlot = async (slot) => {
    setLoading(true);
    const result = await onRemoveSlot(slot);
    if (!result.success) {
      setError(result.error || "Erro ao remover horário");
    }
    setLoading(false);
  };

  const handleCancelAppointment = async (slot) => {
    const appointment = getAppointmentBySlot(slot);
    if (!appointment) return;

    const patient = patients.find((p) => p.id === appointment.patientId);
    const displayName = patient?.referenceName || appointment.patientName;

    if (!window.confirm(`Cancelar consulta de ${displayName}?`)) {
      return;
    }

    setLoading(true);
    const result = await onCancelAppointment(appointment.id);
    if (!result.success) {
      setError(result.error || "Erro ao cancelar consulta");
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
  const bookedTimes = appointments.map((a) => a.time);
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

      {/* LISTA DE SLOTS */}
      <div className="slots-list">
        {allSlots.length === 0 ? (
          <p className="empty-message">Nenhum horário cadastrado</p>
        ) : (
          allSlots.map((slot, i) => {
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
                onRemove={handleRemoveSlot}
                onCancel={handleCancelAppointment}
              />
            );
          })
        )}
      </div>

      {/* MODE TOGGLE */}
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

      {/* ADD SLOT MODE */}
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

      {/* BOOK APPOINTMENT MODE */}
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

      {/* ERROR MESSAGE */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
