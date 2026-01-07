import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import "./Dashboard.css";

const PIE_COLORS = ["#16a34a", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  // Médico
  const [doctorName, setDoctorName] = useState("");
  const [doctorSlug, setDoctorSlug] = useState("");
  const [copied, setCopied] = useState(false);

  // Filtro mês
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Indicadores
  const [slotsOpen, setSlotsOpen] = useState(0);
  const [appointmentsConfirmed, setAppointmentsConfirmed] = useState(0);
  const [clientsPending, setClientsPending] = useState(0);
  const [appointmentsAttended, setAppointmentsAttended] = useState(0);
  const [noShows, setNoShows] = useState(0);

  // Financeiro
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageTicket, setAverageTicket] = useState(0);

  // Gráficos
  const [appointmentsByDay, setAppointmentsByDay] = useState([]);
  const [statusChart, setStatusChart] = useState([]);

  // 🔐 Auth
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // 👨‍⚕️ Médico
  useEffect(() => {
    if (!user) return;

    const fetchDoctor = async () => {
      const snap = await getDoc(doc(db, "doctors", user.uid));
      if (snap.exists()) {
        setDoctorName(snap.data().name || user.email);
        setDoctorSlug(snap.data().slug);
      }
    };

    fetchDoctor();
  }, [user]);

  // 📊 Dashboard
  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      const [year, month] = selectedMonth.split("-");
      const start = `${year}-${month}-01`;
      const end = `${year}-${month}-31`;
      const today = new Date().toISOString().slice(0, 10);

      // 🔹 Consultas
      const appSnap = await getDocs(
        query(collection(db, "appointments"), where("doctorId", "==", user.uid))
      );
      const appointments = appSnap.docs.map(d => d.data());

      // 🔹 Pacientes cadastrados
      const patientSnap = await getDocs(
        query(collection(db, "patients"), where("doctorId", "==", user.uid))
      );

      const priceMap = {};
      patientSnap.docs.forEach(d => {
        const p = d.data();
        priceMap[p.whatsapp] = p.price || 0;
      });

      const totalRegisteredPatients = patientSnap.size;
      setTotalPatients(totalRegisteredPatients);

      // 🔹 Filtro por mês
      const monthly = appointments.filter(
        a => a.date >= start && a.date <= end
      );

      // 🔹 Status
      let confirmed = 0;
      let pending = 0;
      let attended = 0;
      let noshow = 0;

      monthly.forEach(a => {
        if (a.status === "Confirmado") {
          confirmed++;
          if (a.date < today) attended++;
        }
        if (a.status === "Pendente") pending++;
        if (a.status === "Não Compareceu") noshow++;
      });

      setAppointmentsConfirmed(confirmed);
      setClientsPending(pending);
      setAppointmentsAttended(attended);
      setNoShows(noshow);

      setStatusChart([
        { name: "Confirmado", value: confirmed },
        { name: "Pendente", value: pending },
        { name: "Não Compareceu", value: noshow }
      ]);

      // 💰 Faturamento previsto
      let revenue = 0;
      monthly.forEach(a => {
        if (a.status === "Confirmado") {
          revenue += priceMap[a.patientWhatsapp] || 0;
        }
      });

      setTotalRevenue(revenue);

      // 🎟️ Ticket médio baseado no valor dos pacientes
      let totalPatientValue = 0;

      patientSnap.docs.forEach(d => {
        totalPatientValue += d.data().price || 0;
      });

      setAverageTicket(
        totalRegisteredPatients
          ? (totalPatientValue / totalRegisteredPatients).toFixed(2)
          : 0
      );


      // 📅 Consultas por dia
      const byDay = {};
      monthly.forEach(a => {
        byDay[a.date] = (byDay[a.date] || 0) + 1;
      });

      setAppointmentsByDay(
        Object.keys(byDay).sort().map(d => ({
          date: d,
          total: byDay[d]
        }))
      );

      // 🟢 Horários abertos
      const availSnap = await getDocs(
        query(collection(db, "availability"), where("doctorId", "==", user.uid))
      );

      setSlotsOpen(
        availSnap.docs.reduce(
          (sum, d) => sum + (d.data().slots?.length || 0),
          0
        )
      );
    };

    fetchDashboard();
  }, [user, selectedMonth]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/public/${doctorSlug}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="dashboard-container">
      <h2>Bem-vindo(a), {doctorName}</h2>

      {/* Filtro mês */}
      <div className="month-filter">
        <label>Mês:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        />
      </div>

      {/* Link público */}
      <div className="public-link-card">
        <p className="public-link-label">Seu link público</p>

        <div className="public-link-box">
          <span className="public-link-text">
            {`${window.location.origin}/public/${doctorSlug}`}
          </span>

          <button onClick={handleCopyLink} className="copy-btn">
            {copied ? "✔ Copiado" : "📋 Copiar"}
          </button>

          <a
            href={`${window.location.origin}/public/${doctorSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="open-btn"
          >
            🔗 Abrir
          </a>
        </div>
      </div>

      {/* Cards */}
      <div className="stats-container">
        <Stat title="Horários abertos" value={slotsOpen} variant="slots-open" />
        <Stat title="Confirmados" value={appointmentsConfirmed} variant="appointments-confirmed" />
        <Stat title="Pendentes" value={clientsPending} variant="clients-pending" />
        <Stat title="Atendidos" value={appointmentsAttended} variant="appointments-attended" />
        <Stat title="Não compareceram" value={noShows} variant="no-shows" />
        <Stat title="Pacientes cadastrados" value={totalPatients} variant="appointments-confirmed" />
        <Stat title="Faturamento previsto" value={`R$ ${totalRevenue}`} variant="slots-open" />
        <Stat title="Ticket médio" value={`R$ ${averageTicket}`} variant="appointments-attended" />
      </div>

      {/* Gráficos */}
      <div className="charts">
        <div className="chart-card">
          <h3>Consultas por dia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={appointmentsByDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Status das consultas</h3>
          <PieChart width={260} height={260}>
            <Pie data={statusChart} dataKey="value" outerRadius={90} label>
              {statusChart.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, variant }) {
  return (
    <div className={`stat-card ${variant}`}>
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  );
}
