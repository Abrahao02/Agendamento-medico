import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import "./CalendarView.css";
import formatDate from "../utils/formatDate";

export default function CalendarView() {
  const [viewMode, setViewMode] = useState("calendar"); // 'list' ou 'calendar'
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useState(auth.currentUser);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Disponibilidade
        const availRef = collection(db, "availability");
        const qAvail = query(availRef, where("doctorId", "==", user.uid));
        const availSnap = await getDocs(qAvail);
        setAvailability(availSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Agendamentos
        const appRef = collection(db, "appointments");
        const qApp = query(appRef, where("doctorId", "==", user.uid));
        const appSnap = await getDocs(qApp);
        setAppointments(appSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <p>Carregando...</p>;

  // Datas únicas
  const allDates = [...new Set([...availability.map(a => a.date), ...appointments.map(a => a.date)])]
    .sort((a,b) => a.localeCompare(b));

  const getSlotsForDay = (date) => {
    const dayAvail = availability.find(a => a.date === date)?.slots || [];
    const dayApps = appointments.filter(a => a.date === date).map(a => a.time);
    const combined = [...new Set([...dayAvail, ...dayApps])];
    return combined.map(slot => ({
      time: slot,
      status: dayApps.includes(slot) ? "booked" : "free"
    })).sort((a,b)=> a.time.localeCompare(b.time));
  }

  // Para marcação do calendário com badges
  const tileContent = ({ date, view }) => {
    if(view !== 'month') return null;
    const dateStr = date.toISOString().slice(0,10);
    const dayAvail = availability.find(a => a.date === dateStr)?.slots || [];
    const dayApps = appointments.filter(a => a.date === dateStr);

    if(dayAvail.length === 0 && dayApps.length === 0) return null;

    return (
      <div className="calendar-badges">
        {dayAvail.length > 0 && <span className="badge free">{dayAvail.length}</span>}
        {dayApps.length > 0 && <span className="badge booked">{dayApps.length}</span>}
      </div>
    );
  }

  return (
    <div className="schedule-view-container">
      <div className="view-toggle">
        <button onClick={() => setViewMode('list')}>Lista</button>
        <button onClick={() => setViewMode('calendar')}>Calendário</button>
      </div>

          {viewMode === 'list' && (
        <div className="list-view">
          {allDates.length === 0 && <p>Nenhum horário disponível ou agendado.</p>}
          {allDates.map(date => (
            <div key={date} className="day-container">
              <h3>DIA {formatDate(date)}</h3>
              <div className="slots-container">
                {getSlotsForDay(date).map(({time, status}) => (
                  <span key={time} className={`slot ${status}`}>{time}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="calendar-view">
          <Calendar
            tileContent={tileContent}
            onClickDay={(date) => setSelectedDate(date.toISOString().slice(0,10))}
          />
          {selectedDate && (
            <div className="day-slots">
              <h3>DIA {formatDate(selectedDate)}</h3>
              <div className="slots-container">
                {getSlotsForDay(selectedDate).map(({time,status})=>(
                  <span key={time} className={`slot ${status}`}>{time}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
