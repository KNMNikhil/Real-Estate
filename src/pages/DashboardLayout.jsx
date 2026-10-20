import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { STORE_KEY } from "../components/Sidebar";

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORE_KEY) === "1";
  } catch {
    return false;
  }
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORE_KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });

  return (
    <div className={`dashboard ${collapsed ? "is-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} />
      <button
        type="button"
        className="sidebar__toggle"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
      >
        {collapsed ? "›" : "‹"}
      </button>
      <div className="dashboard__main">
        <main className="dashboard__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
