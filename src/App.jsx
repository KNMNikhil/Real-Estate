import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import BuyList from "./pages/BuyList";
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
        <Route path="buy" element={<BuyList />} />
        <Route path="buy/:propertyId" element={<PropertyDetails />} />
        <Route path="sell" element={<SellFlow />} />
        <Route path="profile" element={<Profile />} />
        <Route path="consultants" element={<Consultants />} />
        <Route path="services" element={<Navigate to="/dashboard" replace />} />
        <Route path="functions/*" element={<Navigate to="/dashboard/buy" replace />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
