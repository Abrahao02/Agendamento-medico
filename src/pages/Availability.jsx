import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import formatDate from "../utils/formatDate";
import "./Availability.css";

export default function Availability() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState("12:00");
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Buscar dados
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoadingData(true);

      try {
        const availSnap = await getDocs(
          query(collection(db, "availability"), where("doctorId", "==", user.uid))
        );

        const appSnap = await getDocs(
          query(collection(db, "appointments"), where("doctorId", "==", user.uid))
        );

        setAvailability(availSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setAppointments(appSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSelectDate = (dateStr) => {
    if (changed && !window.confirm("Você tem alterações não salvas. Deseja continuar?")) return;
    setSelectedDate(dateStr);
  };

  useEffect(() => {
    if (!selectedDate) return;

    const dayAvail = availability.find(a => a.date === selectedDate)?.slots || [];
    const dayApps = appointments.filter(a => a.date === selectedDate).map(a => a.time);

    setSlots([...new Set([...dayAvail, ...dayApps])].sort());
    setChanged(false);
    setError("");
  }, [selectedDate, availability, appointments]);

  const getAppointmentBySlot = (slot) =>
    appointments.find(a => a.date === selectedDate && a.time === slot);

  const handleRemoveSlot = async (slot) => {
    const appointment = getAppointmentBySlot(slot);

    if (appointment) {
      const confirmDelete = window.confirm(
        `Deseja cancelar o agendamento de ${appointment.patientName}?`
      );
      if (!confirmDelete) return;

      try {
        await deleteDoc(doc(db, "appointments", appointment.id));
        setAppointments(prev => prev.filter(a => a.id !== appointment.id));
        setSlots(prev => prev.filter(s => s !== slot));
      } catch (err) {
        console.error(err);
        setError("Erro ao excluir agendamento.");
      }
      return;
    }

    setSlots(prev => prev.filter(s => s !== slot));
    setChanged(true);
  };

  const handleAddSlot = () => {
    if (!newSlot || slots.includes(newSlot)) {
      setError("Horário inválido ou duplicado.");
      return;
    }

    setSlots(prev => [...prev, newSlot].sort());
    setChanged(true);
    setError("");
  };

  const handleSave = async () => {
    const dayAvail = availability.find(a => a.date === selectedDate);
    const freeSlots = slots.filter(
      s => !appointments.some(a => a.date === selectedDate && a.time === s)
    );

    const docId = dayAvail ? dayAvail.id : `${user.uid}_${selectedDate}`;

    try {
      await setDoc(doc(db, "availability", docId), {
        doctorId: user.uid,
        date: selectedDate,
        slots: freeSlots
      });

      setAvailability(prev =>
        dayAvail
          ? prev.map(a => (a.id === docId ? { ...a, slots: freeSlots } : a))
          : [...prev, { id: docId, date: selectedDate, slots: freeSlots }]
      );

      setChanged(false);
      alert("Alterações salvas!");
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar.");
    }
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = date.toISOString().slice(0, 10);
    const free = availability.find(a => a.date === dateStr)?.slots?.length || 0;
    const booked = appointments.filter(a => a.date === dateStr).length;

    if (!free && !booked) return null;

    return (
      <div className="calendar-badges">
        {free > 0 && <span className="badge free">{free}</span>}
        {booked > 0 && <span className="badge booked">{booked}</span>}
      </div>
    );
  };

  if (loading || loadingData) return <p>Carregando...</p>;

  return (
    <div className="calendar-availability-container">
      <h2>Calendário de Disponibilidade</h2>

      <Calendar
        tileContent={tileContent}
        onClickDay={(date) => handleSelectDate(date.toISOString().slice(0, 10))}
      />

      {selectedDate && (
        <div className="day-slots">
          <h3>DIA {formatDate(selectedDate)}</h3>

          <div className="slots-list">
            {slots.map((slot, idx) => {
              const appointment = getAppointmentBySlot(slot);

              return (
                <div
                  key={idx}
                  className={`slot-item ${appointment ? "booked" : "free"}`}
                >
                  <span>
                    {slot}
                    {appointment && ` - ${appointment.patientName}`}
                  </span>

                  <button
                    className="slot-action"
                    title={appointment ? "Cancelar agendamento" : "Remover horário"}
                    onClick={() => handleRemoveSlot(slot)}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="add-slot">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
            />
            <button onClick={handleAddSlot}>+ Adicionar horário</button>
          </div>

          {changed && (
            <div className="save-changes">
              <button onClick={handleSave}>💾 Salvar Alterações</button>
            </div>
          )}

          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
}
