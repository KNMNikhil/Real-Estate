import { Link, NavLink } from "react-router-dom";
import Icon from "./Icon";
import Logo from "./Logo";

export const STORE_KEY = "lg_sidebar_collapsed";

// Generic app sidebar used by the customer and agent dashboards.
export default function Sidebar({ collapsed, onToggle, nav, brandTo, profileTo, name, onLogout }) {
  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar__top">
        <Link to={brandTo} className="sidebar__brand" aria-label="Living Gods Real Estates home">
          <Logo size={28} />
          <span className="sidebar__brand-text">Living Gods</span>
        </Link>
        <button
          type="button"
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}
          >
            <span className="sidebar__slot sidebar__icon" aria-hidden="true"><Icon name={item.icon} /></span>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__foot">
        <NavLink
          to={profileTo}
          title={collapsed ? name : undefined}
          className={({ isActive }) => `sidebar__link sidebar__user ${isActive ? "is-active" : ""}`}
        >
          <span className="sidebar__slot">
            <span className="sidebar__avatar" aria-hidden="true">{name?.[0] ?? "?"}</span>
          </span>
          <span className="sidebar__label">{name}</span>
        </NavLink>
        <button type="button" className="sidebar__logout" onClick={onLogout} aria-label="Logout">
          <span className="sidebar__logout-text">Logout</span>
          <span className="sidebar__logout-icon" aria-hidden="true"><Icon name="logout" size={18} /></span>
        </button>
      </div>
    </aside>
  );
}
