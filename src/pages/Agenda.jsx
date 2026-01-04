import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import "./Agenda.css";
import formatDate from "../utils/formatDate";

export default function Agenda() {
  const [user, loading] = useAuthState(auth);
  const [appointments, setAppointments] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Formata data para YYYY-MM-DD
  const formatDateForQuery = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const currentDateStr = formatDateForQuery(currentDate);

  // Funções para navegar datas
  const goToPreviousDay = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const goToNextDay = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Busca agendamentos do dia selecionado
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("doctorId", "==", user.uid),
          where("date", "==", currentDateStr)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => a.time.localeCompare(b.time));
        setAppointments(data);

        // Inicializa statusUpdates
        const initialStatus = {};
        data.forEach(a => {
          initialStatus[a.id] = a.status;
        });
        setStatusUpdates(initialStatus);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      }
    };

    fetchAppointments();
  }, [user, currentDateStr]);

  const handleStatusChange = (id, value) => {
    setStatusUpdates(prev => ({ ...prev, [id]: value }));
  };

  const handleSendWhatsapp = (appt) => {
    const message = `Olá ${appt.patientName}, seu horário com Dr(a) está agendado para ${formatDate(appt.date)} às ${appt.time}.`;
    window.open(`https://wa.me/${appt.patientWhatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSave = async () => {
    try {
      for (const [id, status] of Object.entries(statusUpdates)) {
        const apptRef = doc(db, "appointments", id);
        await updateDoc(apptRef, { status });
      }
      alert("Status atualizado com sucesso!");
      // Atualiza localmente
      setAppointments(prev => prev.map(a => ({ ...a, status: statusUpdates[a.id] })));
    } catch (err) {
      console.error("Erro ao salvar status:", err);
      alert("Erro ao salvar. Tente novamente.");
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="agenda-container">
      <h2>Agenda</h2>
      
      <div className="date-navigation">
        <button onClick={goToPreviousDay}>⬅ Anterior</button>
        <span>{formatDate(currentDate)}</span>
        <button onClick={goToNextDay}>Próximo ➡</button>
        <button onClick={goToToday}>Hoje</button>
      </div>

      <h3>Agendamentos para {formatDate(currentDateStr)}</h3>

      {appointments.length === 0 && <p>Nenhum paciente agendado para este dia.</p>}

      <ul className="appointments-list">
        {appointments.map(app => (
          <li key={app.id} className={`appointment-item ${app.status.toLowerCase().replace(" ", "-")}`}>
            <span className="time">{app.time}</span>
            <span className="patient-name">{app.patientName}</span>
            <span className="patient-whatsapp">{app.patientWhatsapp}</span>

            <select
              value={statusUpdates[app.id]}
              onChange={(e) => handleStatusChange(app.id, e.target.value)}
            >
              <option value="Pendente">⏳ Pendente</option>
              <option value="Confirmado">✔ Confirmado</option>
              <option value="Não Compareceu">❌ Não Compareceu</option>
            </select>

            <button onClick={() => handleSendWhatsapp(app)}>📱 Enviar WhatsApp</button>
          </li>
        ))}
      </ul>

      {appointments.length > 0 && (
        <button className="save-btn" onClick={handleSave}>💾 Salvar Alterações</button>
      )}
    </div>
  );
}
