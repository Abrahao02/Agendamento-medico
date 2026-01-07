import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import "./Agenda.css";
import formatDate from "../utils/formatDate";

/**
 * 🔒 Formata número de WhatsApp para padrão BR
 * Ex: (21) 96012-2111 -> 5521960122111
 */
const formatWhatsappNumber = (number) => {
  let clean = number.replace(/\D/g, "");

  // garante DDI Brasil
  if (!clean.startsWith("55")) {
    clean = "55" + clean;
  }

  return clean;
};

export default function Agenda() {
  const [user, loading] = useAuthState(auth);
  const [appointments, setAppointments] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatDateForQuery = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const currentDateStr = formatDateForQuery(currentDate);

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
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        data.sort((a, b) => a.time.localeCompare(b.time));

        setAppointments(data);

        const initialStatus = {};
        data.forEach(a => {
          initialStatus[a.id] = a.status || "Pendente";
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

  const handleSendWhatsapp = async (appt) => {
    const message = `Olá ${appt.patientName}, sua sessão está agendada para ${formatDate(appt.date)} às ${appt.time}. Caso não possa comparecer, por favor retornar ainda hoje. Obrigada!`;

    const phone = formatWhatsappNumber(appt.patientWhatsapp);

    console.log("WhatsApp enviado para:", phone); // DEBUG

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    const newStatus = "Msg enviada";

    try {
      const apptRef = doc(db, "appointments", appt.id);
      await updateDoc(apptRef, { status: newStatus });

      setStatusUpdates(prev => ({ ...prev, [appt.id]: newStatus }));
      setAppointments(prev =>
        prev.map(a =>
          a.id === appt.id ? { ...a, status: newStatus } : a
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar status após envio:", err);
    }
  };

  const handleSave = async () => {
    try {
      for (const [id, status] of Object.entries(statusUpdates)) {
        await updateDoc(doc(db, "appointments", id), { status });
      }
      alert("Status atualizado com sucesso!");
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
        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}>
          ⬅ Anterior
        </button>

        <span>{formatDate(currentDate)}</span>

        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}>
          Próximo ➡
        </button>

        <button onClick={() => setCurrentDate(new Date())}>
          Hoje
        </button>
      </div>

      <h3>Agendamentos para {formatDate(currentDateStr)}</h3>

      {appointments.length === 0 && (
        <p>Nenhum paciente agendado para este dia.</p>
      )}

      <ul className="appointments-list">
        {appointments.map(app => (
          <li
            key={app.id}
            className={`appointment-item ${app.status?.toLowerCase().replace(" ", "-")}`}
          >
            <span className="time">{app.time}</span>
            <span className="patient-name">{app.patientName}</span>
            <span className="patient-whatsapp">{app.patientWhatsapp}</span>

            <select
              value={statusUpdates[app.id]}
              onChange={(e) => handleStatusChange(app.id, e.target.value)}
            >
              <option value="Pendente">⏳ Pendente</option>
              <option value="Msg enviada">📩 Msg enviada</option>
              <option value="Confirmado">✔ Confirmado</option>
              <option value="Não Compareceu">❌ Não Compareceu</option>
            </select>

            <button onClick={() => handleSendWhatsapp(app)}>
              📱 Enviar WhatsApp
            </button>
          </li>
        ))}
      </ul>

      {appointments.length > 0 && (
        <button className="save-btn" onClick={handleSave}>
          💾 Salvar Alterações
        </button>
      )}
    </div>
  );
}
