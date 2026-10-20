import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/agent", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/agent/calendar", label: "Calendar", icon: "calendar" },
];

export default function AgentLayout() {
  const { agent, logoutAgent } = useAuth();
  const navigate = useNavigate();
  return (
    <AppShell
      nav={NAV}
      brandTo="/agent"
      profileTo="/agent/profile"
      name={agent?.name}
      onLogout={() => {
        logoutAgent();
        navigate("/", { replace: true });
      }}
    />
  );
}
