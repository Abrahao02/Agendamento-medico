import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import "./AllAppointments.css";
import formatDate from "../utils/formatDate";

export default function AllAppointments() {
  const [user, loading] = useAuthState(auth);
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Todos"); // Todos, Confirmado, Pendente, NaoCompareceu
  const [dateFilter, setDateFilter] = useState("Todos");     // Todos, Futuros, Passados
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);            // Detecta alterações
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().slice(0,10);

  // Redireciona caso não esteja logado
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Buscar agendamentos
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      try {
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("doctorId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        data.sort((a, b) => {
          if (a.date === b.date) return a.time.localeCompare(b.time);
          return a.date.localeCompare(b.date);
        });

        setAppointments(data);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      }
    };

    fetchAppointments();
  }, [user]);

  // Alterar status de um agendamento
  const handleStatusChange = (id, newStatus) => {
    setAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
    );
    setChanged(true);
  };

  // Salvar alterações
  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = appointments.map(async app => {
        const appRef = doc(db, "appointments", app.id);
        return updateDoc(appRef, { status: app.status });
      });
      await Promise.all(updates);
      alert("Alterações salvas com sucesso!");
      setChanged(false);
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      alert("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  // Contagem para badges
  const counts = {
    Todos: appointments.length,
    Confirmado: appointments.filter(a => a.status === "Confirmado").length,
    Pendente: appointments.filter(a => a.status === "Pendente").length,
    NaoCompareceu: appointments.filter(a => a.status === "Não Compareceu").length,
  };

  // Confirmação antes de mudar filtros
  const handleSelectStatusFilter = (filter) => {
    if (changed) {
      const confirmLeave = window.confirm("Você tem alterações não salvas. Deseja continuar sem salvar?");
      if (!confirmLeave) return;
    }
    setStatusFilter(filter);
  };

  const handleSelectDateFilter = (filter) => {
    if (changed) {
      const confirmLeave = window.confirm("Você tem alterações não salvas. Deseja continuar sem salvar?");
      if (!confirmLeave) return;
    }
    setDateFilter(filter);
  };

  // Filtragem combinada
  const filteredAppointments = appointments.filter(app => {
    // Filtro status
    if (statusFilter !== "Todos") {
      if (statusFilter === "Confirmado" && app.status !== "Confirmado") return false;
      if (statusFilter === "Pendente" && app.status !== "Pendente") return false;
      if (statusFilter === "NaoCompareceu" && app.status !== "Não Compareceu") return false;
    }

    // Filtro datas
    if (dateFilter === "Futuros" && app.date < todayStr) return false;
    if (dateFilter === "Passados" && app.date >= todayStr) return false;

    return true;
  });

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="todos-appointments-container">
      <h2>Todos os Agendamentos</h2>

      {/* Filtro de datas */}
      <div className="date-filter-buttons">
        {["Todos", "Futuros", "Passados"].map(f => (
          <button
            key={f}
            className={dateFilter === f ? "active" : ""}
            onClick={() => handleSelectDateFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Filtro de status com badges */}
      <div className="filter-buttons">
        {["Todos", "Confirmado", "Pendente", "NaoCompareceu"].map(f => (
          <button
            key={f}
            className={statusFilter === f ? "active" : ""}
            onClick={() => handleSelectStatusFilter(f)}
          >
            {f === "NaoCompareceu" ? "Não Compareceu" : f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Lista de agendamentos */}
      {filteredAppointments.length === 0 ? (
        <p>Nenhum agendamento encontrado.</p>
      ) : (
        <ul className="appointments-list">
          {filteredAppointments.map(app => (
            <li
              key={app.id}
              className={`appointment-item ${app.status.toLowerCase().replace(" ", "-")}`}
            >
              <span className="date">{formatDate(app.date)}</span>
              <span className="time">{app.time}</span>
              <span className="patient-name">{app.patientName}</span>
              <span className="patient-whatsapp">{app.patientWhatsapp}</span>

              <select
                value={app.status}
                onChange={e => handleStatusChange(app.id, e.target.value)}
              >
                <option value="Pendente">Pendente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Não Compareceu">Não Compareceu</option>
              </select>
            </li>
          ))}
        </ul>
      )}

      {/* Botão salvar só aparece se houver alterações */}
      {changed && (
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      )}
    </div>
  );
}
