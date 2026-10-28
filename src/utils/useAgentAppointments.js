import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { agentAppointments } from "../lib/api";

// The signed-in agent's appointments, loaded from the database.
export default function useAgentAppointments() {
  const { token, logoutAgent } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await agentAppointments(token));
    } catch (e) {
      if (e.code === "28000") {
        logoutAgent(); // session expired
      } else if (e.unavailable) {
        setError("The database is not set up yet. Run supabase/schema.sql in the Supabase SQL editor.");
      } else {
        setError(e.message || "Could not load appointments.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, logoutAgent]);

  useEffect(() => {
    load();
  }, [load]);

  // Update one item locally (used for instant "called" ticks).
  const patch = useCallback((id, changes) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  }, []);

  return { items, loading, error, reload: load, patch };
}
