import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Copy,
  ExternalLink,
  LogOut,
  CheckCircle,
} from "lucide-react";

import "./Dashboard.css";

const STATUS_COLORS = {
  Confirmado: "#16a34a",
  Pendente: "#f59e0b",
  "Não Compareceu": "#ef4444",
};

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const [doctorName, setDoctorName] = useState("");
  const [doctorSlug, setDoctorSlug] = useState("");
  const [copied, setCopied] = useState(false);

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [appointmentsByDay, setAppointmentsByDay] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [statusSummary, setStatusSummary] = useState({
    Confirmado: 0,
    Pendente: 0,
    "Não Compareceu": 0,
  });
  const [stats, setStats] = useState({
    slotsOpen: 0,
    totalAppointments: 0,
    attendedAppointments: 0,
    totalRevenue: 0,
    averageTicket: 0,
  });

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
        const data = snap.data();
        setDoctorName(data.name || user.email);
        setDoctorSlug(data.slug || user.uid);
      }
    };
    fetchDoctor();
  }, [user]);

  // 📊 Dashboard Data
  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      // Consultas
      const appSnap = await getDocs(
        query(collection(db, "appointments"), where("doctorId", "==", user.uid))
      );
      const appointments = appSnap.docs.map((d) => d.data());

      // Pacientes e preços
      const patientSnap = await getDocs(
        query(collection(db, "patients"), where("doctorId", "==", user.uid))
      );
      const priceMap = {};
      patientSnap.docs.forEach((d) => {
        priceMap[d.data().whatsapp] = d.data().price || 0;
      });

      // Filtrar por mês, semana ou dia
      let filteredAppointments = appointments;

      const today = new Date();
      const [year, month] = selectedMonth.split("-");
      const startMonth = `${year}-${month}-01`;
      const endMonth = `${year}-${month}-31`;

      if (selectedDay) {
        filteredAppointments = appointments.filter(
          (a) => a.date === selectedDay
        );
      } else if (selectedWeek) {
        const [weekYear, weekNumber] = selectedWeek.split("-W");
        filteredAppointments = appointments.filter((a) => {
          const d = new Date(a.date);
          const w = getWeekNumber(d);
          return w.week === parseInt(weekNumber) && w.year === parseInt(weekYear);
        });
      } else if (selectedMonth) {
        filteredAppointments = appointments.filter(
          (a) => a.date >= startMonth && a.date <= endMonth
        );
      } else if (selectedYear) {
        filteredAppointments = appointments.filter(
          (a) => new Date(a.date).getFullYear() === parseInt(selectedYear)
        );
      }

      // Status resumido
      const summary = { Confirmado: 0, Pendente: 0, "Não Compareceu": 0 };
      let attended = 0;
      filteredAppointments.forEach((a) => {
        summary[a.status] = (summary[a.status] || 0) + 1;
        if (a.status === "Confirmado" && new Date(a.date) <= today) attended++;
      });
      setStatusSummary(summary);

      // Gráfico por dia
      const byDay = {};
      filteredAppointments.forEach((a) => {
        if (!byDay[a.date])
          byDay[a.date] = { date: a.date, Confirmado: 0, Pendente: 0, "Não Compareceu": 0 };
        byDay[a.date][a.status] = (byDay[a.date][a.status] || 0) + 1;
      });
      setAppointmentsByDay(Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)));

      // Faturamento e ticket médio
      let revenue = 0;
      filteredAppointments.forEach((a) => {
        if (a.status === "Confirmado") revenue += priceMap[a.patientWhatsapp] || 0;
      });

      let totalValue = 0;
      patientSnap.docs.forEach((d) => (totalValue += d.data().price || 0));

      setStats({
        slotsOpen: await getSlotsOpen(user.uid),
        totalAppointments: filteredAppointments.length,
        attendedAppointments: attended,
        totalRevenue: revenue,
        averageTicket: patientSnap.size ? (totalValue / patientSnap.size).toFixed(2) : 0,
      });

      // Próximas consultas
      const upcoming = filteredAppointments
        .filter((a) => new Date(a.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
      setUpcomingAppointments(upcoming);
    };

    fetchDashboard();
  }, [user, selectedDay, selectedWeek, selectedMonth, selectedYear]);

  // Copiar link público
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/public/${doctorSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Funções auxiliares
  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getWeekNumber = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return { week: weekNo, year: date.getUTCFullYear() };
  };

  const getSlotsOpen = async (uid) => {
    const snap = await getDocs(query(collection(db, "availability"), where("doctorId", "==", uid)));
    return snap.docs.reduce((sum, d) => sum + (d.data().slots?.length || 0), 0);
  };

  // Resetar filtros
  const handleResetFilters = () => {
    setSelectedDay("");
    setSelectedWeek("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setSelectedYear(new Date().getFullYear());

    // Rolagem suave até o topo do dashboard
    document.querySelector(".dashboard-content").scrollIntoView({ behavior: "smooth" });
  };


  if (loading) return <p>Carregando...</p>;

  return (

    <div className="dashboard-content">
      {/* Public Link */}
      <div className="public-link-card fade-up">
        <p className="public-link-label">Seu link público</p>
        <div className="public-link-box">
          <span className="public-link-text">{`${window.location.origin}/public/${doctorSlug}`}</span>
          <button className="copy-btn" onClick={handleCopyLink}>
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <a href={`${window.location.origin}/public/${doctorSlug}`} target="_blank" rel="noopener noreferrer" className="open-btn">
            <ExternalLink size={16} /> Abrir
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-line">
        <div className="filter-item">
          <label>Dia</label>
          <div className="input-icon-wrapper">
            <input type="date" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} />
            <Calendar size={16} className="input-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>Semana</label>
          <div className="input-icon-wrapper">
            <input type="week" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} />
            <Clock size={16} className="input-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>Mês</label>
          <div className="input-icon-wrapper">
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            <TrendingUp size={16} className="input-icon" />
          </div>
        </div>

        <div className="filter-item">
          <label>Ano</label>
          <div className="input-icon-wrapper">
            <input type="number" min="2020" max="2100" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} />
            <Users size={16} className="input-icon" />
          </div>
        </div>

        <button className="reset-btn" onClick={handleResetFilters}>
          Resetar filtros
        </button>
      </div>


      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card fade-up delay-1">
          <div className="stat-icon blue"><Clock size={24} /></div>
          <div className="stat-info">
            <p className="stat-value">{stats.slotsOpen}</p>
            <p className="stat-title">Horários abertos</p>
          </div>
        </div>
        <div className="stat-card fade-up delay-2">
          <div className="stat-icon green"><Calendar size={24} /></div>
          <div className="stat-info">
            <p className="stat-value">{stats.totalAppointments}</p>
            <p className="stat-title">Total de consultas</p>
          </div>
        </div>
        <div className="stat-card fade-up delay-3">
          <div className="stat-icon amber"><DollarSign size={24} /></div>
          <div className="stat-info">
            <p className="stat-value">R$ {stats.totalRevenue}</p>
            <p className="stat-title">Faturamento previsto</p>
          </div>
        </div>
        <div className="stat-card fade-up delay-4">
          <div className="stat-icon purple"><Users size={24} /></div>
          <div className="stat-info">
            <p className="stat-value">R$ {stats.averageTicket}</p>
            <p className="stat-title">Ticket médio</p>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="status-summary">
        <div className="status-card confirmed">
          <div className="status-dot confirmed"></div>
          <div className="status-info">
            <h4>{statusSummary.Confirmado}</h4>
            <p>Confirmados</p>
          </div>
        </div>
        <div className="status-card pending">
          <div className="status-dot pending"></div>
          <div className="status-info">
            <h4>{statusSummary.Pendente}</h4>
            <p>Pendentes</p>
          </div>
        </div>
        <div className="status-card missed">
          <div className="status-dot missed"></div>
          <div className="status-info">
            <h4>{statusSummary["Não Compareceu"]}</h4>
            <p>Não compareceram</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card fade-up">
          <h3>Consultas por dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsByDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Confirmado" stackId="a" fill={STATUS_COLORS.Confirmado} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pendente" stackId="a" fill={STATUS_COLORS.Pendente} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Não Compareceu" stackId="a" fill={STATUS_COLORS["Não Compareceu"]} radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card fade-up">
          <h3>Próximas consultas</h3>
          <div className="upcoming-list">
            {upcomingAppointments.map((a, idx) => (
              <div key={idx} className="upcoming-item">
                <div className="upcoming-avatar">{getInitials(a.patientName)}</div>
                <div className="upcoming-info">
                  <h4>{a.patientName}</h4>
                  <p>{a.date} às {a.time}</p>
                </div>
                <span className={`upcoming-status ${a.status === "Confirmado" ? "confirmed" : "pending"}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
