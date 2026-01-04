// CalendarAvailabilityFull.js
import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
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
  const [changed, setChanged] = useState(false); // controla se houve alteração

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Buscar disponibilidade e agendamentos
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoadingData(true);
      try {
        // Disponibilidade
        const availRef = collection(db, "availability");
        const q = query(availRef, where("doctorId", "==", user.uid));
        const snap = await getDocs(q);
        setAvailability(snap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Agendamentos
        const appRef = collection(db, "appointments");
        const qApp = query(appRef, where("doctorId", "==", user.uid));
        const appSnap = await getDocs(qApp);
        setAppointments(appSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  // Atualiza slots do dia selecionado
  const handleSelectDate = (dateStr) => {
    if (changed) {
      const confirmLeave = window.confirm("Você tem alterações não salvas. Deseja continuar sem salvar?");
      if (!confirmLeave) return;
    }
    setSelectedDate(dateStr);
  };

  useEffect(() => {
    if (!selectedDate) return;
    const dayAvail = availability.find(a => a.date === selectedDate)?.slots || [];
    const dayApps = appointments.filter(a => a.date === selectedDate).map(a => a.time);
    const combinedSlots = [...new Set([...dayAvail, ...dayApps])].sort();
    setSlots(combinedSlots);
    setChanged(false);
    setNewSlot("12:00");
    setError("");
  }, [selectedDate, availability, appointments]);

  const handleRemoveSlot = (slot) => {
    const dayApps = appointments.filter(a => a.date === selectedDate).map(a => a.time);
    if (dayApps.includes(slot)) {
      setError("Não é possível remover um horário já agendado!");
      return;
    }

    setSlots(prev => prev.filter(s => s !== slot));
    setChanged(true);
    setError("");
  };

  const handleAddSlot = () => {
    if (!newSlot) return;
    if (slots.includes(newSlot)) {
      setError("Horário já existe!");
      return;
    }
    setSlots(prev => [...prev, newSlot].sort());
    setNewSlot("12:00");
    setChanged(true);
    setError("");
  };

  const handleSave = async () => {
    if (!selectedDate) return;

    const dayAvail = availability.find(a => a.date === selectedDate);
    const currentSlots = slots.filter(s => !appointments.some(a => a.date === selectedDate && a.time === s));

    const docId = dayAvail ? dayAvail.id : `${user.uid}_${selectedDate}`;
    const docRef = doc(db, "availability", docId);

    try {
      await setDoc(docRef, {
        doctorId: user.uid,
        date: selectedDate,
        slots: currentSlots,
      });

      setAvailability(prev => {
        if (dayAvail) {
          return prev.map(a => a.id === dayAvail.id ? { ...a, slots: currentSlots } : a);
        } else {
          return [...prev, { id: docId, date: selectedDate, slots: currentSlots }];
        }
      });

      setChanged(false);
      setError("");
      alert("Alterações salvas com sucesso!");
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar. Tente novamente.");
    }
  };

  const getSlotStatus = (slot) => {
    const dayApps = appointments.filter(a => a.date === selectedDate).map(a => a.time);
    return dayApps.includes(slot) ? "booked" : "free";
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().slice(0,10);
    
    const dayAvail = availability.find(a => a.date === dateStr)?.slots || [];
    const dayApps = appointments.filter(a => a.date === dateStr).map(a => a.time);

    const freeSlots = dayAvail.filter(s => !dayApps.includes(s)).length;
    const bookedSlots = dayApps.length;

    if(freeSlots === 0 && bookedSlots === 0) return null;

    return (
      <div className="calendar-badges">
        {freeSlots > 0 && <span className="badge free">{freeSlots}</span>}
        {bookedSlots > 0 && <span className="badge booked">{bookedSlots}</span>}
      </div>
    );
  };

  if (loading || loadingData) return <p>Carregando...</p>;

  return (
    <div className="calendar-availability-container">
      <h2>Calendário de Disponibilidade</h2>

      <Calendar
        tileContent={tileContent}
        onClickDay={(date) => handleSelectDate(date.toISOString().slice(0,10))}
      />

      {selectedDate && (
        <div className="day-slots">
          <h3>DIA {formatDate(selectedDate)}</h3>

          {slots.length === 0 && <p>Nenhum horário disponível.</p>}

          <div className="slots-list">
            {slots.map((slot, idx) => (
              <div key={idx} className={`slot-item ${getSlotStatus(slot)}`}>
                <span>{slot}</span>
                {getSlotStatus(slot) === "free" && (
                  <button onClick={() => handleRemoveSlot(slot)}>❌</button>
                )}
              </div>
            ))}
          </div>

          <div className="add-slot">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="Selecione o horário"
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
