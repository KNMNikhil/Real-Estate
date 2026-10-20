import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role = "customer" }) {
  const { user, agent } = useAuth();
  if (role === "agent") return agent ? children : <Navigate to="/agent/login" replace />;
  return user ? children : <Navigate to="/login" replace />;
}
