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
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import formatDate from "../utils/formatDate";
import {
  FaClock,
  FaCalendarDay,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

import "./Availability.css";

const ALL_TIMES = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00",
];

export default function Availability() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarValue, setCalendarValue] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState("12:00");

  const [mode, setMode] = useState("add");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [changed, setChanged] = useState(false);

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  /* 🔐 Auth */
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  /* 📅 Data inicial */
  useEffect(() => {
    const today = new Date();
    setSelectedDate(formatLocalDate(today));
    setCalendarValue(today);
  }, []);

  /* 🔄 Fetch */
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const availSnap = await getDocs(
          query(collection(db, "availability"), where("doctorId", "==", user.uid))
        );

        const appSnap = await getDocs(
          query(collection(db, "appointments"), where("doctorId", "==", user.uid))
        );

        const patientSnap = await getDocs(
          query(collection(db, "patients"), where("doctorId", "==", user.uid))
        );

        setAvailability(availSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setAppointments(appSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPatients(patientSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  /* 📌 Seleção de data */
  const handleSelectDate = (date) => {
    if (changed && !window.confirm("Você tem alterações não salvas. Deseja continuar?")) return;
    setSelectedDate(formatLocalDate(date));
    setCalendarValue(date);
  };

  /* 🧠 Slots do dia */
  useEffect(() => {
    if (!selectedDate) return;

    const dayAvail =
      availability.find(a => a.date === selectedDate)?.slots || [];

    const dayApps = appointments
      .filter(a => a.date === selectedDate)
      .map(a => a.time);

    setSlots([...new Set([...dayAvail, ...dayApps])].sort());
    setChanged(false);
    setError("");
  }, [selectedDate, availability, appointments]);

  const getAppointmentBySlot = (slot) =>
    appointments.find(a => a.date === selectedDate && a.time === slot);

  /* ❌ Remove */
  const handleRemoveSlot = async (slot) => {
    const appointment = getAppointmentBySlot(slot);

    if (appointment) {
      if (!window.confirm(`Cancelar consulta de ${appointment.patientName}?`)) return;
      await deleteDoc(doc(db, "appointments", appointment.id));
      setAppointments(prev => prev.filter(a => a.id !== appointment.id));
    }

    setSlots(prev => prev.filter(s => s !== slot));
    setChanged(true);
  };

  /* ➕ Slot */
  const handleAddSlot = () => {
    if (!newSlot || slots.includes(newSlot)) {
      setError("Horário inválido ou duplicado.");
      return;
    }

    const updatedSlots = [...slots, newSlot].sort();
    setSlots(updatedSlots);

    // Atualiza availability para refletir imediatamente no calendário
    setAvailability(prev => {
      const otherDays = prev.filter(a => a.date !== selectedDate);
      const currentDay = prev.find(a => a.date === selectedDate);

      const newDay = {
        id: currentDay?.id || `${user.uid}_${selectedDate}`,
        doctorId: user.uid,
        date: selectedDate,
        slots: updatedSlots.filter(
          s => !appointments.some(a => a.date === selectedDate && a.time === s)
        ),
      };

      return [...otherDays, newDay];
    });

    setChanged(true);
    setError("");
  };


  /* 💾 Save availability */
  const handleSave = async () => {
    const freeSlots = slots.filter(
      s => !appointments.some(a => a.date === selectedDate && a.time === s)
    );

    await setDoc(
      doc(db, "availability", `${user.uid}_${selectedDate}`),
      {
        doctorId: user.uid,
        date: selectedDate,
        slots: freeSlots,
      },
      { merge: true }
    );

    setChanged(false);
    alert("Alterações salvas!");
  };

  /* 📅 Marcar consulta (LIVRE) */
  const handleBookAppointment = async () => {
    if (!selectedPatient || !selectedTime) {
      setError("Selecione paciente e horário.");
      return;
    }

    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) return;

    const doctorSlug =
      user.displayName
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || "doctor";

    const newAppointment = {
      doctorId: user.uid,
      doctorSlug,
      patientId: patient.id,
      patientName: patient.name,
      patientWhatsapp: patient.whatsapp,
      date: selectedDate,
      time: selectedTime,
      status: "Confirmado",
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, "appointments"), newAppointment);

    setAppointments(prev => [...prev, { id: ref.id, ...newAppointment }]);
    setSelectedPatient("");
    setSelectedTime("");
    setError("");
  };

  /* 🟥🟩 BADGES DO CALENDÁRIO (MANTIDOS) */
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = formatLocalDate(date);
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

  const bookedTimes = appointments
    .filter(a => a.date === selectedDate)
    .map(a => a.time);

  const availableTimes = ALL_TIMES.filter(t => !bookedTimes.includes(t));

  return (
    <>
      <div className="calendar-header">
        <div className="label">Gestão de Agenda</div>
        <h2>Calendário de Disponibilidade</h2>
        <p>Gerencie seus horários e consultas</p>
      </div>

      <div className="calendar-layout">
        <div className="calendar-wrapper">
          <Calendar
            value={calendarValue}
            onClickDay={handleSelectDate}
            tileContent={tileContent}
          />
        </div>

        {selectedDate && (
          <div className="day-slots-card">
            <h3>
              <FaCalendarDay /> DIA {formatDate(selectedDate)}
            </h3>

            {slots.map((slot, i) => {
              const app = getAppointmentBySlot(slot);
              return (
                <div key={i} className={`slot-item ${app ? "booked" : "free"}`}>
                  <span>
                    <FaClock /> {slot}
                    {app && <strong> — {app.patientName}</strong>}
                  </span>
                  <button onClick={() => handleRemoveSlot(slot)}>
                    <FaTimes />
                  </button>
                </div>
              );
            })}

            <div className="mode-toggle">
              <button className={mode === "add" ? "active" : ""} onClick={() => setMode("add")}>
                Adicionar Horário
              </button>
              <button className={mode === "book" ? "active" : ""} onClick={() => setMode("book")}>
                Marcar Consulta
              </button>
            </div>

            {mode === "add" ? (
              <div className="add-slot">
                <input type="time" value={newSlot} onChange={e => setNewSlot(e.target.value)} />
                <button onClick={handleAddSlot}>Adicionar</button>
              </div>
            ) : (
              <div className="book-slot">
                <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                  <option value="">Paciente</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
                  <option value="">Horário</option>
                  {availableTimes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <button onClick={handleBookAppointment}>Confirmar</button>
              </div>
            )}

            {changed && (
              <div className="save-changes">
                <button onClick={handleSave}>
                  <FaCheckCircle /> Salvar Alterações
                </button>
              </div>
            )}

            {error && <p className="error">{error}</p>}
          </div>
        )}
      </div>
    </>
  );
}
