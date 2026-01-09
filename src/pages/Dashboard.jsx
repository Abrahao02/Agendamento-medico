// src/pages/Dashboard/Dashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";

// Components
import DashboardLayout from "../components/layout/Sidebar";
import PublicLinkCard from "../components/dashboard/PublicLinkCard";
import DashboardFilters from "../components/dashboard/DashboardFilters";
import StatsCard from "../components/dashboard/StatsCard";
import StatusSummary from "../components/dashboard/StatusSummary";
import AppointmentsChart from "../components/dashboard/AppointmentsChart";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";


import "./Dashboard.css";

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const [doctorSlug, setDoctorSlug] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Filtros
  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Dados
  const [appointments, setAppointments] = useState([]);
  const [priceMap, setPriceMap] = useState({});
  const [slotsOpen, setSlotsOpen] = useState(0);

  // Auth Protection
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Buscar dados do médico
  useEffect(() => {
    if (!user) return;

    const fetchDoctor = async () => {
      const snap = await getDoc(doc(db, "doctors", user.uid));
      if (snap.exists()) {
        setDoctorSlug(snap.data().slug || user.uid);
      }
    };

    fetchDoctor();
  }, [user]);

  // Buscar appointments e patients
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Appointments
        const appSnap = await getDocs(
          query(collection(db, "appointments"), where("doctorId", "==", user.uid))
        );
        const appointmentsData = appSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setAppointments(appointmentsData);

        // Patients (para pegar preços)
        const patientSnap = await getDocs(
          query(collection(db, "patients"), where("doctorId", "==", user.uid))
        );
        const prices = {};
        patientSnap.docs.forEach((d) => {
          prices[d.data().whatsapp] = d.data().price || 0;
        });
        setPriceMap(prices);

        // Slots disponíveis
        const slots = await fetchSlotsOpen(user.uid);
        setSlotsOpen(slots);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  // Buscar slots disponíveis
  const fetchSlotsOpen = async (uid) => {
    const snap = await getDocs(
      query(collection(db, "availability"), where("doctorId", "==", uid))
    );
    return snap.docs.reduce((sum, d) => sum + (d.data().slots?.length || 0), 0);
  };

  // Filtrar appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    if (selectedDateFrom && selectedDateTo) {
      filtered = filtered.filter(
        (a) => a.date >= selectedDateFrom && a.date <= selectedDateTo
      );
    } else if (selectedMonth && selectedYear) {
      filtered = filtered.filter((a) => {
        const [year, month] = a.date.split("-").map(Number);
        return month === Number(selectedMonth) && year === Number(selectedYear);
      });
    }

    return filtered;
  }, [appointments, selectedDateFrom, selectedDateTo, selectedMonth, selectedYear]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    let revenue = 0;
    let attended = 0;

    filteredAppointments.forEach((a) => {
      const appointmentDate = new Date(a.date);
      if (a.status === "Confirmado" && appointmentDate <= today) {
        attended++;
        const value =
          a.value !== undefined ? a.value : priceMap[a.patientWhatsapp] || 0;
        revenue += value;
      }
    });

    const totalValue = Object.values(priceMap).reduce((sum, price) => sum + price, 0);
    const patientCount = Object.keys(priceMap).length;

    return {
      slotsOpen,
      totalAppointments: filteredAppointments.length,
      attendedAppointments: attended,
      totalRevenue: revenue,
      averageTicket: patientCount ? Math.round(totalValue / patientCount) : 0,
    };
  }, [filteredAppointments, priceMap, slotsOpen, today]);

  // Status summary
  const statusSummary = useMemo(() => {
    const summary = { Confirmado: 0, Pendente: 0, "Não Compareceu": 0 };
    filteredAppointments.forEach((a) => {
      if (summary.hasOwnProperty(a.status)) {
        summary[a.status]++;
      }
    });
    return summary;
  }, [filteredAppointments]);

  // Dados para gráfico
  const chartData = useMemo(() => {
    const byDay = {};
    filteredAppointments.forEach((a) => {
      if (!byDay[a.date]) {
        byDay[a.date] = {
          date: a.date,
          Confirmado: 0,
          Pendente: 0,
          "Não Compareceu": 0,
        };
      }
      byDay[a.date][a.status]++;
    });
    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredAppointments]);

  // Próximas consultas
  const upcomingAppointments = useMemo(() => {
    return filteredAppointments
      .filter((a) => new Date(`${a.date}T${a.time || "00:00"}:00`) >= today)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || "00:00"}:00`);
        const dateB = new Date(`${b.date}T${b.time || "00:00"}:00`);
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [filteredAppointments, today]);

  // Reset filtros
  const handleResetFilters = useCallback(() => {
    setSelectedDateFrom("");
    setSelectedDateTo("");
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, [currentMonth, currentYear]);

  // Available years para o filtro
  const availableYears = useMemo(() => {
    const years = new Set();
    years.add(currentYear);
    years.add(currentYear - 1);
    years.add(currentYear + 1);
    return Array.from(years).sort((a, b) => b - a);
  }, [currentYear]);

  if (loading || loadingData) {
  }

  // Remover DashboardLayout aqui
  return (
    <div className="dashboard-content">
      {/* Public Link */}
      <PublicLinkCard slug={doctorSlug} />

      {/* Filtros */}
      <DashboardFilters
        dateFrom={selectedDateFrom}
        dateTo={selectedDateTo}
        month={selectedMonth}
        year={selectedYear}
        onDateFromChange={setSelectedDateFrom}
        onDateToChange={setSelectedDateTo}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onReset={handleResetFilters}
        availableYears={availableYears}
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard
          icon={Clock}
          value={stats.slotsOpen}
          title="Horários disponíveis"
          color="blue"
          onClick={() => navigate("/dashboard/availability")}
        />
        <StatsCard
          icon={Calendar}
          value={stats.totalAppointments}
          title="Total de consultas"
          color="green"
          onClick={() => navigate("/dashboard/allappointments")}
        />
        <StatsCard
          icon={DollarSign}
          value={`R$ ${stats.totalRevenue.toFixed(2)}`}
          title="Faturamento previsto"
          color="amber"
        />
        <StatsCard
          icon={Users}
          value={`R$ ${stats.averageTicket}`}
          title="Ticket médio"
          color="purple"
        />
      </div>

      {/* Status Summary */}
      <StatusSummary
        confirmed={statusSummary.Confirmado}
        pending={statusSummary.Pendente}
        missed={statusSummary["Não Compareceu"]}
      />

      {/* Charts Section */}
      <div className="charts-section">
        <AppointmentsChart data={chartData} />
        <UpcomingAppointments appointments={upcomingAppointments} />
      </div>
    </div>
  );

}