import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "▦", end: true },
  { to: "/dashboard/buy", label: "Buy a Property", icon: "⌂" },
  { to: "/dashboard/sell", label: "Sell a Property", icon: "₹" },
];

const STORE_KEY = "lg_sidebar_collapsed";

export default function Sidebar({ collapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar__top">
        <Link to="/dashboard" className="sidebar__brand" aria-label="Living Gods Real Estates home">
          <span className="sidebar__slot">
            <Logo size={28} />
          </span>
          <span className="sidebar__label">Living Gods</span>
        </Link>
      </div>

      <nav className="sidebar__nav" aria-label="Dashboard">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}
          >
            <span className="sidebar__slot sidebar__icon" aria-hidden="true">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__foot">
        <NavLink
          to="/dashboard/profile"
          title={collapsed ? user?.name : undefined}
          className={({ isActive }) => `sidebar__link sidebar__user ${isActive ? "is-active" : ""}`}
        >
          <span className="sidebar__slot">
            <span className="sidebar__avatar" aria-hidden="true">{user?.name?.[0] ?? "?"}</span>
          </span>
          <span className="sidebar__label">{user?.name}</span>
        </NavLink>
        <button type="button" className="sidebar__link sidebar__logout" onClick={handleLogout} title={collapsed ? "Logout" : undefined}>
          <span className="sidebar__slot sidebar__icon" aria-hidden="true">⎋</span>
          <span className="sidebar__label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export { STORE_KEY };
