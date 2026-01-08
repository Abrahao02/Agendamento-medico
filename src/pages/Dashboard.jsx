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
  Copy,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

import "./Dashboard.css";
import formatDate from "../utils/formatDate";

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

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // Janeiro = 0
  const currentYear = today.getFullYear();

  // 🔹 Filtros
  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

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
      const appSnap = await getDocs(
        query(collection(db, "appointments"), where("doctorId", "==", user.uid))
      );
      const appointments = appSnap.docs.map((d) => d.data());

      const patientSnap = await getDocs(
        query(collection(db, "patients"), where("doctorId", "==", user.uid))
      );
      const priceMap = {};
      patientSnap.docs.forEach((d) => {
        priceMap[d.data().whatsapp] = d.data().price || 0;
      });

      let filteredAppointments = appointments;

      // 🔹 Se houver filtro de datas, ele tem prioridade
      if (selectedDateFrom && selectedDateTo) {
        filteredAppointments = filteredAppointments.filter(
          (a) => a.date >= selectedDateFrom && a.date <= selectedDateTo
        );
      } else {
        // 🔹 Caso contrário, filtrar pelo mês e ano selecionados (padrão: mês atual)
        filteredAppointments = filteredAppointments.filter((a) => {
          const d = new Date(a.date);
          const matchesMonth = selectedMonth ? d.getMonth() + 1 === Number(selectedMonth) : true;
          const matchesYear = selectedYear ? d.getFullYear() === Number(selectedYear) : true;
          return matchesMonth && matchesYear;
        });
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

      // Faturamento: apenas consultas confirmadas que já passaram
      let revenue = 0;
      filteredAppointments.forEach((a) => {
        const appointmentDate = new Date(a.date);
        if (a.status === "Confirmado" && appointmentDate <= today) {
          const value = a.value !== undefined ? a.value : priceMap[a.patientWhatsapp] || 0;
          revenue += value;
        }
      });

      let totalValue = 0;
      patientSnap.docs.forEach((d) => (totalValue += d.data().price || 0));

      setStats({
        slotsOpen: await getSlotsOpen(user.uid),
        totalAppointments: filteredAppointments.length,
        attendedAppointments: attended,
        totalRevenue: revenue,
        averageTicket: patientSnap.size ? Math.round(totalValue / patientSnap.size) : 0,
      });

      // Próximas consultas
      const upcoming = filteredAppointments
        .filter((a) => new Date(a.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
      setUpcomingAppointments(upcoming);
    };

    fetchDashboard();
  }, [user, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear]);

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

  const getSlotsOpen = async (uid) => {
    const snap = await getDocs(query(collection(db, "availability"), where("doctorId", "==", uid)));
    return snap.docs.reduce((sum, d) => sum + (d.data().slots?.length || 0), 0);
  };

  const handleResetFilters = () => {
    setSelectedDateFrom("");
    setSelectedDateTo("");
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
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
      <div className="filters-line" role="region" aria-label="Filtros de data e período">
        <div className="filter-item">
          <label htmlFor="date-from">Data de</label>
          <div className="input-icon-wrapper">
            <input
              id="date-from"
              type="date"
              value={selectedDateFrom}
              onChange={(e) => setSelectedDateFrom(e.target.value)}
              aria-label="Data de início"
            />
            {/* ícone apenas para inputs date (opcional) */}
            {!false && <Calendar size={16} className="input-icon" aria-hidden="true" />}
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="date-to">Data até</label>
          <div className="input-icon-wrapper">
            <input
              id="date-to"
              type="date"
              value={selectedDateTo}
              onChange={(e) => setSelectedDateTo(e.target.value)}
              aria-label="Data de término"
            />
            {!false && <Calendar size={16} className="input-icon" aria-hidden="true" />}
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="month">Mês</label>
          <div className="input-icon-wrapper">
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={!!(selectedDateFrom && selectedDateTo)}
              aria-label="Selecionar mês"
            >
              <option value="">Todos</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {/* não renderizar ícone extra aqui; o CSS já mostra a seta do select */}
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="year">Ano</label>
          <div className="input-icon-wrapper">
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              aria-label="Selecionar ano"
            >
              <option value={today.getFullYear()}>{today.getFullYear()}</option>
              {/* se quiser listar mais anos, mapeie um array de anos aqui */}
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button
            className="reset-btn"
            onClick={handleResetFilters}
            type="button"
            aria-label="Limpar filtros"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card fade-up delay-1 clickable" onClick={() => navigate("/dashboard/availability")}>
          <div className="stat-icon blue"><Clock size={24} /></div>
          <div className="stat-info">
            <p className="stat-value">{stats.slotsOpen}</p>
            <p className="stat-title">Disponibilidade</p>
          </div>
        </div>

        <div className="stat-card fade-up delay-2 clickable" onClick={() => navigate("/dashboard/allappointments")}>
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
            <p className="stat-title">Faturamento previsto clientes confirmados</p>
          </div>
        </div>

        <div className="stat-card fade-up delay-4">
          <div className="stat-icon purple"><Users size={24} /></div>
          <div className="stat-info">
            <p className="stat-value">R$ {stats.averageTicket}</p>
            <p className="stat-title">Ticket médio por cliente cadastrado</p>
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
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip labelFormatter={formatDate} />
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
                  <p>{formatDate(a.date)} às {a.time}</p>
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
