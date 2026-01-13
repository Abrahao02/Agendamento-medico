// ============================================
// 📁 src/components/layout/MenuItem.jsx - NOVO
// ============================================
import { NavLink } from "react-router-dom";

export default function MenuItem({ item, isDesktop, closeSidebar }) {
  const Icon = item.icon;

  const handleClick = () => {
    if (!isDesktop) closeSidebar();
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