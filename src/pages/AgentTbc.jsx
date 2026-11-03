import { useCallback, useEffect, useState } from "react";
import AppointmentItem from "../components/AppointmentItem";
import { useAuth } from "../context/AuthContext";
import { agentTbcEnquiries, setTbcCalled } from "../lib/api";

const TEAM_NAMES = { RI: "Relatives India Team", FI: "Friends India Team", ABR: "Any Buyer Random Team" };

// Shape a TBC enquiry like a to-do item so it can reuse the same row as the dashboard.
const toItem = (t) => ({
  id: t.id,
  kind: "tbc",
  kindLabel: `TBC · ${t.team}`,
  customerName: t.name,
  customerContact: t.phone,
  customerEmail: t.email,
  propertyName: [TEAM_NAMES[t.team], t.members && `${t.members} buyers`, t.project, t.note].filter(Boolean).join(" · "),
  date: String(t.createdAt).slice(0, 10),
  called: t.called,
  viaBrowser: !!t.viaBrowser,
});

// "TBC" page: people who filled in the Team Buying Concept form for this consultant.
export default function AgentTbc() {
  const { agent, token, logoutAgent } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows((await agentTbcEnquiries(token, agent.id)).map(toItem));
    } catch (e) {
      if (e.code === "28000") logoutAgent();
      else if (e.unavailable) setError("TBC is not set up in the database yet. Run supabase/tbc.sql in the Supabase SQL editor.");
      else setError(e.message || "Could not load the TBC enquiries.");
    } finally {
      setLoading(false);
    }
  }, [token, agent.id, logoutAgent]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (id) => {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    const next = !r.called;
    setError("");
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, called: next } : x)));
    try {
      await setTbcCalled(token, id, next);
    } catch {
      setRows((prev) => prev.map((x) => (x.id === id ? { ...x, called: !next } : x)));
      setError("Could not save that tick. Please try again.");
    }
  };

  const pending = rows.filter((r) => !r.called);
  const finished = rows.filter((r) => r.called);

  return (
    <div className="dash-home">
      <div className="title-row">
        <h1>TBC enquiries</h1>
        <span className="auth-badge">Team Buying Concept</span>
      </div>
      <p className="muted">
        {agent.name}, these people joined through the Team Buying Concept page. Call each one, then tick them as done.
      </p>

      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {rows.some((r) => r.viaBrowser) && (
        <p className="notice" role="status">
          The database is not set up for TBC yet, so these enquiries were saved in this browser only. Run
          supabase/tbc.sql in the Supabase SQL editor to receive them everywhere.
        </p>
      )}
      {loading && <p className="muted">Loading…</p>}

      <div className="stat-grid stat-grid--three">
        {[
          ["All TBC enquiries", rows.length],
          ["Still to call", pending.length],
          ["Done", finished.length],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <span className="stat-card__value">{value}</span>
            <span className="stat-card__label">{label}</span>
          </div>
        ))}
      </div>

      <section className="panel">
        <h2>To-do list</h2>
        {!loading && !error && rows.length === 0 && <p className="notice">No TBC enquiries yet.</p>}
        {pending.length > 0 && (
          <ul className="todo-list">
            {pending.map((r) => (
              <AppointmentItem key={r.id} item={r} done={false} onToggle={toggle} showDate />
            ))}
          </ul>
        )}
        {rows.length > 0 && pending.length === 0 && <p className="notice">All done. You have called everyone.</p>}
        {finished.length > 0 && (
          <>
            <h3 className="todo__section">Done</h3>
            <ul className="todo-list">
              {finished.map((r) => (
                <AppointmentItem key={r.id} item={r} done onToggle={toggle} showDate />
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
