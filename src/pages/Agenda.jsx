import { useState, useEffect, useRef } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import "./Agenda.css";
import formatDate from "../utils/formatDate";

// Ícones
import { FiArrowLeft, FiArrowRight, FiSave, FiSmartphone } from "react-icons/fi";

/**
 * 📱 Formata WhatsApp padrão BR
 */
const formatWhatsappNumber = (number) => {
  let clean = number.replace(/\D/g, "");
  if (!clean.startsWith("55")) clean = "55" + clean;
  return clean;
};

export default function Agenda() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());

  // 🔹 config do WhatsApp do médico
  const [whatsappConfig, setWhatsappConfig] = useState(null);

  // 🔹 Mapa appointmentId → referenceName atualizado
  const [referenceNames, setReferenceNames] = useState({});

  const hasUnsavedChanges = useRef(false);

  /**
   * 🔄 Date → YYYY-MM-DD
   */
  const formatDateForQuery = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const currentDateStr = formatDateForQuery(currentDate);

  // 🔐 Proteção de rota
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // 📥 Busca config do médico (1x)
  useEffect(() => {
    if (!user) return;

    const fetchDoctor = async () => {
      const snap = await getDoc(doc(db, "doctors", user.uid));
      if (snap.exists()) {
        setWhatsappConfig(
          snap.data().whatsappConfig || {
            intro: "Olá",
            body: "Sua sessão está agendada",
            footer: "",
          }
        );
      }
    };

    fetchDoctor();
  }, [user]);

  // 📥 Busca agendamentos do dia
  useEffect(() => {
    if (!user) return;

    const fetchAppointments = async () => {
      try {
        const q = query(
          collection(db, "appointments"),
          where("doctorId", "==", user.uid),
          where("date", "==", currentDateStr)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        data.sort((a, b) => a.time.localeCompare(b.time));

        setAppointments(data);

        // Status inicial
        const initialStatus = {};
        data.forEach((a) => {
          initialStatus[a.id] = a.status || "Pendente";
        });
        setStatusUpdates(initialStatus);
        hasUnsavedChanges.current = false;

        // 🔹 Busca referenceName atualizado para cada paciente
        const fetchReferenceNames = async () => {
          const names = {};
          await Promise.all(
            data.map(async (appt) => {
              try {
                const numbers = appt.patientWhatsapp.replace(/\D/g, "");
                const patientId = `${user.uid}_${numbers}`;
                const snap = await getDoc(doc(db, "patients", patientId));
                if (snap.exists() && snap.data().referenceName?.trim() !== "") {
                  names[appt.id] = snap.data().referenceName;
                } else {
                  names[appt.id] = appt.patientName;
                }
              } catch {
                names[appt.id] = appt.patientName;
              }
            })
          );
          setReferenceNames(names);
        };

        fetchReferenceNames();
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      }
    };

    fetchAppointments();
  }, [user, currentDateStr]);

  /**
   * 🔁 Atualiza status
   */
  const handleStatusChange = async (id, value) => {
    setStatusUpdates((prev) => ({ ...prev, [id]: value }));
    hasUnsavedChanges.current = true;

    try {
      await updateDoc(doc(db, "appointments", id), { status: value });

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: value } : a))
      );
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  /**
   * 📱 Envia WhatsApp (mensagem personalizada) sem abrir várias abas
   */
  const handleSendWhatsapp = async (appt) => {
    if (!whatsappConfig) return;

    const { intro, body, footer, showValue } = whatsappConfig;

    const patientDisplayName = referenceNames[appt.id] || appt.patientName;

    let message = `
${intro || "Olá"} ${patientDisplayName},

${body || "Sua sessão está agendada"}

Data: ${formatDate(appt.date)}
Horário: ${appt.time}
`;

    if (showValue && appt.value) {
      message += `\nValor: R$ ${appt.value}`;
    }

    if (footer) {
      message += `\n\n${footer}`;
    }

    const phone = formatWhatsappNumber(appt.patientWhatsapp);

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message.trim())}`,
      "whatsappWindow"
    );

    handleStatusChange(appt.id, "Msg enviada");
  };

  // 📅 Navegação correta
  const goToPreviousDay = () =>
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });

  const goToNextDay = () =>
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });

  const goToToday = () => setCurrentDate(new Date());

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="calendar-availability-container">
      <h2>Agenda</h2>

      <div className="date-navigation">
        <button className="btn-secondary" onClick={goToPreviousDay}>
          <FiArrowLeft /> Anterior
        </button>

        <span>{formatDate(currentDate)}</span>

        <button className="btn-secondary" onClick={goToNextDay}>
          Próximo <FiArrowRight />
        </button>

        <button className="btn-primary" onClick={goToToday}>Hoje</button>
      </div>

      {appointments.length === 0 && <p>Nenhum paciente agendado para este dia.</p>}

      <ul className="appointments-list">
        {appointments.map((app) => (
          <li key={app.id} className="slot-item" data-status={statusUpdates[app.id]}>
            <span className="time">{app.time}</span>
            <span className="patient-name">
              {referenceNames[app.id] || app.patientName}
            </span>
            <span className="patient-whatsapp">{app.patientWhatsapp}</span>

            <select
              className="status-select"
              value={statusUpdates[app.id]}
              onChange={(e) => handleStatusChange(app.id, e.target.value)}
            >
              <option value="Pendente">⏳ Pendente</option>
              <option value="Msg enviada">📩 Msg enviada</option>
              <option value="Confirmado">✔ Confirmado</option>
              <option value="Não Compareceu">❌ Não Compareceu</option>
            </select>

            <button className="btn-primary" onClick={() => handleSendWhatsapp(app)}>
              <FiSmartphone /> WhatsApp
            </button>
          </li>
        ))}
      </ul>

      {hasUnsavedChanges.current && (
        <div className="save-changes">
          <button className="btn-secondary" disabled>
            <FiSave /> Alterações salvas automaticamente
          </button>
        </div>
      )}
    </div>

  );
}
