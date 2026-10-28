import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./components/PublicLayout";
import AdminAgentDetail from "./pages/AdminAgentDetail";
import AdminAgents from "./pages/AdminAgents";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./pages/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AgentCalendar from "./pages/AgentCalendar";
import AgentDashboard from "./pages/AgentDashboard";
import AgentLayout from "./pages/AgentLayout";
import AgentLogin from "./pages/AgentLogin";
import AgentProfile from "./pages/AgentProfile";
import BuyFlow from "./pages/BuyFlow";
import Contact from "./pages/Contact";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import SellFlow from "./pages/SellFlow";
import TeamBuying from "./pages/TeamBuying";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<Navigate to="/#about" replace />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/marketplace" element={<Navigate to="/buy" replace />} />
        <Route path="/property/*" element={<Navigate to="/buy" replace />} />
        <Route path="/buy" element={<BuyFlow />} />
        <Route path="/sell" element={<SellFlow />} />
        <Route path="/tbc" element={<TeamBuying />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="agents" element={<AdminAgents />} />
        <Route path="agents/:agentId" element={<AdminAgentDetail />} />
      </Route>

      <Route path="/consultant/login" element={<AgentLogin />} />
      <Route
        path="/consultant"
        element={
          <ProtectedRoute>
            <AgentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AgentDashboard />} />
        <Route path="calendar" element={<AgentCalendar />} />
        <Route path="profile" element={<AgentProfile />} />
      </Route>

      {/* Customer accounts no longer exist; send old links to the buy page. */}
      <Route path="/agent/login" element={<Navigate to="/consultant/login" replace />} />
      <Route path="/agent/*" element={<Navigate to="/consultant" replace />} />
      <Route path="/login" element={<Navigate to="/buy" replace />} />
      <Route path="/signup" element={<Navigate to="/buy" replace />} />
      <Route path="/otp" element={<Navigate to="/buy" replace />} />
      <Route path="/dashboard/*" element={<Navigate to="/buy" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
