import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      <nav className="sidebar">
        <h2>Meu Painel</h2>
        <ul>
          <li>
            <NavLink to="/dashboard" end>
              🏠 Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/appointments">
              📋 Agenda do dia
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/availability">
              🕒 Disponibilidade
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/allappointments">
              📚 Todas consultas
            </NavLink>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Sair
            </button>
          </li>
        </ul>
      </nav>

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
