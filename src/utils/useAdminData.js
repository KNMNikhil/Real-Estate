import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { adminAgents, adminDeals, adminErrorMessage, isSessionError } from "../lib/admin";

// Loads every consultant and every booking for the admin screens.
export default function useAdminData() {
  const { token, logoutAdmin } = useAdmin();
  const [agents, setAgents] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [a, d] = await Promise.all([adminAgents(token), adminDeals(token)]);
      setAgents(a);
      setDeals(d);
    } catch (e) {
      if (isSessionError(e)) logoutAdmin();
      else setError(adminErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [token, logoutAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  return { agents, deals, loading, error, reload: load };
}

// Per-agent numbers: deals (bookings), buying / selling, calls attended, still to call.
export function agentStats(agentId, deals) {
  const mine = deals.filter((d) => d.agentId === agentId);
  const called = mine.filter((d) => d.called).length;
  return {
    total: mine.length,
    buy: mine.filter((d) => d.kind === "buy").length,
    sell: mine.filter((d) => d.kind === "sell").length,
    called,
    pending: mine.length - called,
  };
}
