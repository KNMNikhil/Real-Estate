import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guards the agent area only.
export default function ProtectedRoute({ children }) {
  const { agent } = useAuth();
  return agent ? children : <Navigate to="/consultant/login" replace />;
}
