// ============================================
// 📁 src/components/layout/Sidebar.jsx - REFATORADO
// ============================================
import { FiMenu } from "react-icons/fi";
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
  menuItems
}) {
  // Separar itens de navegação principal e configurações
  const mainNavItems = menuItems.filter(item => item.to !== "/dashboard/settings");
  const settingsItem = menuItems.find(item => item.to === "/dashboard/settings");

  return (
    <nav
      className={`sidebar ${sidebarOpen ? "open" : "compact"}`}
      aria-label="Menu principal"
    >
      {/* Header Compacto - Hambúrguer integrado */}
      <div className="sidebar-header">
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleSidebar();
            }
          }}
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? "Encolher menu" : "Expandir menu"}
          title={sidebarOpen ? "Encolher menu" : "Expandir menu"}
        >
          <FiMenu />
        </button>
        {sidebarOpen && (
          <h2 className="sidebar-user-name fade-slide">Olá, {doctorName}</h2>
        )}
      </div>

      {/* Navegação Principal */}
      <ul className="menu menu-main" role="menu">
        {mainNavItems.map(item => (
          <MenuItem
            key={item.to}
            item={item}
            isDesktop={isDesktop}
            closeSidebar={closeSidebar}
          />
        ))}
      </ul>

      {/* Divisor Visual */}
      {sidebarOpen && settingsItem && (
        <div className="menu-divider" aria-hidden="true"></div>
      )}

      {/* Seção Configurações */}
      {settingsItem && (
        <ul className="menu menu-settings" role="menu">
          <MenuItem
            key={settingsItem.to}
            item={settingsItem}
            isDesktop={isDesktop}
            closeSidebar={closeSidebar}
          />
        </ul>
      )}

      {/* Footer Fixo - Badge do Plano */}
      <div className="sidebar-footer">
        <PlanBox
          plan={plan}
          appointmentsThisMonth={appointmentsThisMonth}
          isLimitReached={isLimitReached}
          sidebarOpen={sidebarOpen}
        />
      </div>
    </nav>
  );
}