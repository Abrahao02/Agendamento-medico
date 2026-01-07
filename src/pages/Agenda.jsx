import { useState, useEffect, useRef } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import "./Agenda.css";
import formatDate from "../utils/formatDate";

// Ícones
import { FiArrowLeft, FiArrowRight, FiSave, FiSmartphone } from "react-icons/fi";

const formatWhatsappNumber = (number) => {
  let clean = number.replace(/\D/g, "");
  if (!clean.startsWith("55")) clean = "55" + clean;
  return clean;
};

export default function Agenda() {
  const [user, loading] = useAuthState(auth);
  const [appointments, setAppointments] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [originalStatus, setOriginalStatus] = useState({});
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const hasUnsavedChanges = useRef(false);

  const formatDateForQuery = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const currentDateStr = formatDateForQuery(currentDate);

  // Confirmação de saída sem salvar
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "appointments"),
          where("doctorId", "==", user.uid),
          where("date", "==", currentDateStr)
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        data.sort((a, b) => a.time.localeCompare(b.time));

        setAppointments(data);

        const initialStatus = {};
        data.forEach(a => initialStatus[a.id] = a.status || "Pendente");
        setStatusUpdates(initialStatus);
        setOriginalStatus(initialStatus);
        hasUnsavedChanges.current = false;
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      }
    };

    fetchAppointments();
  }, [user, currentDateStr]);

  const handleStatusChange = async (id, value) => {
    setStatusUpdates(prev => ({ ...prev, [id]: value }));
    hasUnsavedChanges.current = true;

    // Atualiza também instantaneamente no Firestore
    try {
      await updateDoc(doc(db, "appointments", id), { status: value });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: value } : a));
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const handleSendWhatsapp = async (appt) => {
    const message = `Olá ${appt.patientName}, sua sessão está agendada para ${formatDate(appt.date)} às ${appt.time}. Caso não possa comparecer, por favor retornar ainda hoje. Obrigada!`;
    const phone = formatWhatsappNumber(appt.patientWhatsapp);

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

    const newStatus = "Msg enviada";
    handleStatusChange(appt.id, newStatus);
  };

  const handleSave = async () => {
    try {
      for (const [id, status] of Object.entries(statusUpdates)) {
        await updateDoc(doc(db, "appointments", id), { status });
      }
      alert("Status atualizado com sucesso!");
      setOriginalStatus({ ...statusUpdates });
      hasUnsavedChanges.current = false;
    } catch (err) {
      console.error("Erro ao salvar status:", err);
      alert("Erro ao salvar. Tente novamente.");
    }
  };

  const goToPreviousDay = () => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 1)));
  const goToNextDay = () => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 1)));
  const goToToday = () => setCurrentDate(new Date());

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="calendar-availability-container">
      <h2>Agenda</h2>

      <div className="date-navigation">
        <button onClick={goToPreviousDay}><FiArrowLeft /> Anterior</button>
        <span>{formatDate(currentDate)}</span>
        <button onClick={goToNextDay}>Próximo <FiArrowRight /></button>
        <button onClick={goToToday}>Hoje</button>
      </div>

      {appointments.length === 0 && <p>Nenhum paciente agendado para este dia.</p>}

      <ul className="appointments-list">
        {appointments.map(app => (
          <li key={app.id} className={`slot-item ${app.status?.toLowerCase().replace(" ", "-")}`}>
            <span>{app.time}</span>
            <span>{app.patientName}</span>
            <span>{app.patientWhatsapp}</span>

            <select
              value={statusUpdates[app.id]}
              onChange={(e) => handleStatusChange(app.id, e.target.value)}
            >
              <option value="Pendente">⏳ Pendente</option>
              <option value="Msg enviada">📩 Msg enviada</option>
              <option value="Confirmado">✔ Confirmado</option>
              <option value="Não Compareceu">❌ Não Compareceu</option>
            </select>

            <button onClick={() => handleSendWhatsapp(app)} title="Enviar WhatsApp">
              <FiSmartphone /> Enviar mensagem
            </button>
          </li>
        ))}
      </ul>

      {/* Salvar alterações apenas se houver mudanças */}
      {hasUnsavedChanges.current && (
        <div className="save-changes">
          <button onClick={handleSave}><FiSave /> Salvar Alterações</button>
        </div>
      )}
    </div>
  );
}
