import { Outlet, NavLink, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../services/firebase";
import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

// Ícones
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

import "./DashboardLayout.css";
import Button from "../../common/Button";

// ========================================
// CONSTANTES
// ========================================

const APPOINTMENT_LIMIT = 10;
const PLAN_LABELS = {
  free: "Gratuito",
  pro: "PRO"
};

const MENU_ITEMS = [
  { to: "/dashboard", icon: FiHome, text: "Home", end: true },
  { to: "/dashboard/appointments", icon: FiCalendar, text: "Agenda do dia" },
  { to: "/dashboard/availability", icon: FiClock, text: "Agenda do mês" },
  { to: "/dashboard/allappointments", icon: FiBookOpen, text: "Todos agendamentos" },
  { to: "/dashboard/clients", icon: FiUser, text: "Clientes" },
  { to: "/dashboard/settings", icon: FiSettings, text: "Configurações" }
];

// ========================================
// HOOKS CUSTOMIZADOS
// ========================================

/**
 * Hook para gerenciar o estado responsivo da sidebar
 */
function useSidebarState() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);

      // Em mobile, sidebar sempre começa fechada
      if (!desktop) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Executar na montagem

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return {
    sidebarOpen,
    isDesktop,
    toggleSidebar,
    closeSidebar
  };
}

/**
 * Hook para gerenciar dados do usuário e plano
 */
function useUserData() {
  const [user, setUser] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [plan, setPlan] = useState("free");
  const [appointmentsThisMonth, setAppointmentsThisMonth] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      setUser(currentUser);
      setLoading(true);

      try {
        // Buscar dados do médico
        const doctorDoc = await getDoc(doc(db, "doctors", currentUser.uid));

        if (doctorDoc.exists()) {
          const data = doctorDoc.data();
          setDoctorName(data.name || currentUser.email);
          setPlan(data.plan || "free");

          // Calcular consultas do mês
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, "0");
          const startDate = `${year}-${month}-01`;
          const endDate = `${year}-${month}-31`;

          const appointmentsSnapshot = await getDocs(
            query(
              collection(db, "appointments"),
              where("doctorId", "==", currentUser.uid)
            )
          );

          const appointments = appointmentsSnapshot.docs.map(d => d.data());
          const confirmedThisMonth = appointments.filter(
            appointment =>
              appointment.status === "Confirmado" &&
              appointment.date >= startDate &&
              appointment.date <= endDate
          ).length;

          setAppointmentsThisMonth(confirmedThisMonth);

          const userPlan = data.plan || "free";
          setIsLimitReached(
            userPlan === "free" && confirmedThisMonth >= APPOINTMENT_LIMIT
          );
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    doctorName,
    plan,
    appointmentsThisMonth,
    isLimitReached,
    loading
  };
}

// ========================================
// COMPONENTES
// ========================================

/**
 * Componente do item de menu
 */
function MenuItem({ item, isDesktop, closeSidebar }) {
  const Icon = item.icon;

  const handleClick = () => {
    if (!isDesktop) {
      closeSidebar();
    }
  };

  return (
    <li role="none">
      <NavLink
        to={item.to}
        end={item.end}
        className="menu-link"
        role="menuitem"
        aria-label={item.text}
        onClick={handleClick}
      >
        <span className="icon" aria-hidden="true">
          <Icon />
        </span>
        <span className="text fade-slide">{item.text}</span>
      </NavLink>
    </li>
  );
}

/**
 * Componente da caixa do plano
 */
function PlanBox({ plan, appointmentsThisMonth, isLimitReached, sidebarOpen }) {
  const navigate = useNavigate();
  const remainingAppointments = 10 - appointmentsThisMonth;

  if (!sidebarOpen) return null;

  // Função para rolar até a seção de planos na landing page
  const handleScrollToPlans = (e) => {
    e.preventDefault();
    navigate("/#plans"); // Navega para / com hash #plans
  };

  return (
    <div
      className={`plan-box ${isLimitReached ? "limit-reached" : ""}`}
      role="region"
      aria-label="Informações do plano"
    >
      <span className="plan-badge">
        Plano {plan === "free" ? "Gratuito" : "PRO"}
      </span>

      <p>
        {plan === "free" ? (
          <>
            Você ainda possui:{" "}
            <strong className="remaining-appointments">
              {remainingAppointments}
            </strong>{" "}
            {remainingAppointments === 1 ? "consulta" : "consultas"}
          </>
        ) : (
          <>✨ Consultas ilimitadas</>
        )}
      </p>

      {plan === "free" && (
        <div className="plan-actions">
          {/* Botão para assinar PRO */}
          <a
            href="https://mpago.la/1TYVDfE"
            target="_blank"
            rel="noopener noreferrer"
            className="pro-subscribe-btn"
            aria-label="Assinar plano PRO"
          >
            <span>Assinar PRO</span> <br />
            <span className="plan-payment-info">
              Pix, Cartão ou Boleto
            </span>
          </a>

          {/* Botão para conhecer planos */}
          <Button
            onClick={handleScrollToPlans}
            className="free-plan-btn"
            aria-label="Conhecer todos os planos"
          >
            Conhecer planos
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Componente da Sidebar
 */
function Sidebar({
  sidebarOpen,
  toggleSidebar,
  closeSidebar,
  isDesktop,
  user,
  doctorName,
  plan,
  appointmentsThisMonth,
  isLimitReached,
  handleLogout
}) {
  return (
    <nav
      className={`sidebar ${sidebarOpen ? "open" : "compact"}`}
      aria-label="Menu principal"
    >
      {/* Header */}
      <div className="sidebar-header">
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? "Encolher menu" : "Expandir menu"}
          title={sidebarOpen ? "Encolher menu" : "Expandir menu"}
        >
          <FiMenu />
        </button>

        {sidebarOpen && (
          <h2 className="fade-slide">
            {user ? `Olá, ${doctorName}` : "Bem-vindo"}
          </h2>
        )}
      </div>

      {/* Menu Items */}
      <ul className="menu" role="menu">
        {MENU_ITEMS.map(item => (
          <MenuItem
            key={item.to}
            item={item}
            isDesktop={isDesktop}
            closeSidebar={closeSidebar}
          />
        ))}
      </ul>

      {/* Plan Box */}
      {user && (
        <PlanBox
          plan={plan}
          appointmentsThisMonth={appointmentsThisMonth}
          isLimitReached={isLimitReached}
          sidebarOpen={sidebarOpen}
        />
      )}

      {/* Logout Button */}
      {sidebarOpen && (
        <button
          onClick={handleLogout}
          className="logout-btn"
          aria-label="Sair da conta"
        >
          <FiLogOut />
          Sair
        </button>
      )}
    </nav>
  );
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function DashboardLayout() {
  const {
    sidebarOpen,
    isDesktop,
    toggleSidebar,
    closeSidebar
  } = useSidebarState();

  const {
    user,
    doctorName,
    plan,
    appointmentsThisMonth,
    isLimitReached,
    loading
  } = useUserData();

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, []);

  // Loading state
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
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
        isDesktop={isDesktop}
        user={user}
        doctorName={doctorName}
        plan={plan}
        appointmentsThisMonth={appointmentsThisMonth}
        isLimitReached={isLimitReached}
        handleLogout={handleLogout}
      />

      {/* Botão Hambúrguer Mobile Fixo */}
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

          {/* Overlay */}
          <div
            className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
            onClick={closeSidebar}
            aria-hidden="true"
          />
        </>
      )}

      {/* Main Content */}
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
