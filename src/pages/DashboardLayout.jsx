import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "▦", end: true },
  { to: "/dashboard/marketplace", label: "Marketplace", icon: "◈" },
  { to: "/dashboard/buy", label: "Buy a Property", icon: "⌂" },
  { to: "/dashboard/sell", label: "Sell a Property", icon: "₹" },
  { to: "/dashboard/activities", label: "Activities", icon: "☰" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <AppShell
      nav={NAV}
      brandTo="/dashboard"
      profileTo="/dashboard/profile"
      name={user?.name}
      onLogout={() => {
        logout();
        navigate("/", { replace: true });
      }}
    />
  );
}
