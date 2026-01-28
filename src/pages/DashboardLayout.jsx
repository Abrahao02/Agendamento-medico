// ============================================
// 📁 src/pages/DashboardLayout.jsx - REFATORADO
// ============================================
import { Outlet, NavLink } from "react-router-dom";
import { useDashboardLayout } from "../hooks/common/useDashboardLayout";

import {
  BookOpen,
  Calendar,
  Clock,
  Home,
  Menu,
  Settings,
  User,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar/Sidebar";

import "./DashboardLayout.css";

const MENU_ITEMS = [
  { to: "/dashboard", icon: Home, text: "Home", end: true },
  { to: "/dashboard/appointments", icon: Calendar, text: "Agenda do dia" },
  { to: "/dashboard/availability", icon: Clock, text: "Agenda do mês" },
  { to: "/dashboard/allappointments", icon: BookOpen, text: "Todos agendamentos" },
  { to: "/dashboard/clients", icon: User, text: "Clientes" },
  { to: "/dashboard/settings", icon: Settings, text: "Configurações" }
];

export default function DashboardLayout() {
  const {
    sidebarOpen,
    isDesktop,
    toggleSidebar,
    closeSidebar,
    doctorName,
    plan,
    appointmentsThisMonth,
    isLimitReached,
    loading,
  } = useDashboardLayout();

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="loading-container">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
        isDesktop={isDesktop}
        doctorName={doctorName}
        plan={plan}
        appointmentsThisMonth={appointmentsThisMonth}
        isLimitReached={isLimitReached}
        menuItems={MENU_ITEMS}
      />

      {!isDesktop && (
        <>
          <button
            onClick={toggleSidebar}
            aria-expanded={sidebarOpen}
            aria-label="Abrir menu"
            className="hamburger-fixed"
            title="Abrir menu"
          >
            <Menu />
          </button>

          <div
            className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
            onClick={closeSidebar}
            aria-hidden="true"
          />
        </>
      )}

      <main className="dashboard-content">
        <Outlet context={{ isLimitReached }} />
      </main>
    </div>
  );
}