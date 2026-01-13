// ============================================
// 📁 src/components/layout/Sidebar.jsx - NOVO
// ============================================
import { FiMenu, FiLogOut } from "react-icons/fi";
import MenuItem from "./MenuItem";
import PlanBox from "./PlanBox";

export default function Sidebar({
  sidebarOpen,
  toggleSidebar,
  closeSidebar,
  isDesktop,
  doctorName,
  plan,
  appointmentsThisMonth,
  isLimitReached,
  handleLogout,
  menuItems
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
          <h2 className="fade-slide">Olá, {doctorName}</h2>
        )}
      </div>

      {/* Menu Items */}
      <ul className="menu" role="menu">
        {menuItems.map(item => (
          <MenuItem
            key={item.to}
            item={item}
            isDesktop={isDesktop}
            closeSidebar={closeSidebar}
          />
        ))}
      </ul>

      {/* Plan Box */}
      <PlanBox
        plan={plan}
        appointmentsThisMonth={appointmentsThisMonth}
        isLimitReached={isLimitReached}
        sidebarOpen={sidebarOpen}
      />

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