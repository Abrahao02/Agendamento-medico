// ============================================
// 📁 src/pages/DashboardLayout.jsx - REFATORADO
// ============================================
import { Outlet, NavLink } from "react-router-dom";
import { useDashboardLayout } from "../hooks/common/useDashboardLayout";

import {
  FiSettings,
  FiHome,
  FiCalendar,
  FiClock,
  FiBookOpen,
  FiUser,
  FiLogOut,
  FiMenu
} from "react-icons/fi";

import Sidebar from "../components/layout/Sidebar/Sidebar";

import "./DashboardLayout.css";

const MENU_ITEMS = [
  { to: "/dashboard", icon: FiHome, text: "Home", end: true },
  { to: "/dashboard/appointments", icon: FiCalendar, text: "Agenda do dia" },
  { to: "/dashboard/availability", icon: FiClock, text: "Agenda do mês" },
  { to: "/dashboard/allappointments", icon: FiBookOpen, text: "Todos agendamentos" },
  { to: "/dashboard/clients", icon: FiUser, text: "Clientes" },
  { to: "/dashboard/settings", icon: FiSettings, text: "Configurações" }
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
    handleLogout,
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
            <FiMenu />
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