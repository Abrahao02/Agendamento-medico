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
  const [filter, setFilter] = useState("Todos"); // Todos, Confirmado, Pendente, NaoCompareceu
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Buscar todos os agendamentos
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("doctorId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Ordenar por data e horário
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

  const handleStatusChange = (id, newStatus) => {
    setAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = appointments.map(async app => {
        const appRef = doc(db, "appointments", app.id);
        return updateDoc(appRef, { status: app.status });
      });
      await Promise.all(updates);
      alert("Alterações salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      alert("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === "Todos") return true;
    if (filter === "Confirmado") return app.status === "Confirmado";
    if (filter === "Pendente") return app.status === "Pendente";
    if (filter === "NaoCompareceu") return app.status === "Não Compareceu";
    return true;
  });

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="todos-appointments-container">
      <h2>Todos os Agendamentos</h2>

      <div className="filter-buttons">
        {["Todos", "Confirmado", "Pendente", "NaoCompareceu"].map(f => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f === "NaoCompareceu" ? "Não Compareceu" : f}
          </button>
        ))}
      </div>

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

      {appointments.length > 0 && (
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      )}
    </div>
  );
}
