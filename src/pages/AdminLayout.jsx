import { Navigate, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAdmin } from "../context/AdminContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/admin/agents", label: "Agents", icon: "activities" },
];

export default function AdminLayout() {
  const { admin, logoutAdmin } = useAdmin();
  const navigate = useNavigate();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return (
    <AppShell
      nav={NAV}
      brandTo="/admin"
      profileTo="/admin"
      name="Admin"
      onLogout={() => {
        logoutAdmin();
        navigate("/", { replace: true });
      }}
    />
  );
}
