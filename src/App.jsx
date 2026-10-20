import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Activities from "./pages/Activities";
import AgentCalendar from "./pages/AgentCalendar";
import AgentDashboard from "./pages/AgentDashboard";
import AgentLayout from "./pages/AgentLayout";
import AgentLogin from "./pages/AgentLogin";
import AgentProfile from "./pages/AgentProfile";
import Marketplace from "./pages/Marketplace";
import Consultants from "./pages/Consultants";
import DashboardLayout from "./pages/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Otp from "./pages/Otp";
import PropertyDetails from "./pages/PropertyDetails";
import SellFlow from "./pages/SellFlow";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login mode="login" />} />
      <Route path="/signup" element={<Login mode="signup" />} />
      <Route path="/otp" element={<Otp />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="property/:propertyId" element={<PropertyDetails />} />
        <Route path="buy" element={<Navigate to="/dashboard/marketplace" replace />} />
        <Route path="sell" element={<SellFlow />} />
        <Route path="profile" element={<Profile />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="activities" element={<Activities />} />
        <Route path="consultants" element={<Consultants />} />
        <Route path="services" element={<Navigate to="/dashboard" replace />} />
        <Route path="functions/*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="/agent/login" element={<AgentLogin />} />
      <Route
        path="/agent"
        element={
          <ProtectedRoute role="agent">
            <AgentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AgentDashboard />} />
        <Route path="calendar" element={<AgentCalendar />} />
        <Route path="profile" element={<AgentProfile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
