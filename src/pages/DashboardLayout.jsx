import { Outlet, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useState, useEffect } from "react";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

// Ícones do react-icons
import { FiSettings, FiHome, FiCalendar, FiClock, FiBookOpen, FiUser, FiLogOut, FiMenu } from "react-icons/fi";

import "./DashboardLayout.css";

const APPOINTMENT_LIMIT = 10;
const PLAN_LABELS = { free: "Gratuito", pro: "PRO" };

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [plan, setPlan] = useState("free");
  const [appointmentsThisMonth, setAppointmentsThisMonth] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (!desktop) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) return (window.location.href = "/login");
      setUser(u);

      const snap = await getDoc(doc(db, "doctors", u.uid));
      if (snap.exists()) {
        const data = snap.data();
        setDoctorName(data.name || u.email);
        setPlan(data.plan || "free");
      }

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const start = `${year}-${month}-01`;
      const end = `${year}-${month}-31`;

      const appSnap = await getDocs(
        query(collection(db, "appointments"), where("doctorId", "==", u.uid))
      );

      const appointments = appSnap.docs.map((d) => d.data());
      const attendedThisMonth = appointments.filter(
        (a) => a.status === "Confirmado" && a.date >= start && a.date <= end
      ).length;

      setAppointmentsThisMonth(attendedThisMonth);
      setIsLimitReached(
        (snap.exists() ? snap.data().plan || "free" : "free") === "free" &&
        attendedThisMonth >= APPOINTMENT_LIMIT
      );
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const menuItems = [
    { to: "/dashboard", icon: <FiHome />, text: "Home" },
    { to: "/dashboard/appointments", icon: <FiCalendar />, text: "Agenda do dia" },
    { to: "/dashboard/availability", icon: <FiClock />, text: "Agenda do mês" },
    { to: "/dashboard/allappointments", icon: <FiBookOpen />, text: "Todos agendamentos" },
    { to: "/dashboard/clients", icon: <FiUser />, text: "Clientes" },
    { to: "/dashboard/settings", icon: <FiSettings />, text: "Configurações" }
  ];

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <nav className={`sidebar ${sidebarOpen ? "open" : "compact"}`} aria-hidden={false}>
        <div className="sidebar-header">
          {/* Botão hamburguer topo para desktop */}
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Encolher menu" : "Expandir menu"}
          >
            <FiMenu />
          </button>

          {/* Nome do médico */}
          {sidebarOpen && <h2 className="fade-slide">{user ? `Olá, ${doctorName}` : "Bem-vindo"}</h2>}
        </div>

        <ul className="menu" role="menu" aria-label="Navegação principal">
          {menuItems.map((item) => (
            <li key={item.to} role="none">
              <NavLink
                to={item.to}
                end
                className="menu-link"
                role="menuitem"
                aria-label={item.text}
                onClick={() => { if (!isDesktop) setSidebarOpen(false); }}
              >
                <span className="icon" aria-hidden="true">{item.icon}</span>
                <span className="text fade-slide">{item.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Plan box */}
        {user && (
          <>
            <div className={`plan-box ${isLimitReached ? "limit-reached" : ""}`} aria-hidden={!sidebarOpen}>
              <span className="plan-badge">Plano {PLAN_LABELS[plan]}</span>
              <p>
                {plan === "free" ? (
                  <>Consultas atendidas este mês: <strong>{appointmentsThisMonth} / {APPOINTMENT_LIMIT}</strong></>
                ) : (
                  <>✨ Consultas ilimitadas</>
                )}
              </p>

              {plan === "free" && (
                <div className="plan-actions">
                  {/* Assinar PRO */}
                  <a
                    href="https://mpago.la/1TYVDfE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pro-subscribe-btn"
                  >
                    Assinar PRO <br />
                                      {/* Texto de formas de pagamento */}
                  <span className="plan-payment-info">Pix, cartão ou Mercado Pago</span>
                  </a>

                  {/* Conhecer planos */}
                  <a
                    href="/#plans"
                    className="free-plan-btn"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Conhecer planos
                  </a>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="logout-btn" aria-hidden={!sidebarOpen}>
              <FiLogOut /> Sair
            </button>
          </>
        )}
      </nav>

      {/* BOTÃO FIXO MOBILE */}
      {!isDesktop && (
        <>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-expanded={sidebarOpen}
            className="hamburger-fixed"
            title="Abrir menu"
          >
            <FiMenu />
          </button>
          <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
        </>
      )}

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
