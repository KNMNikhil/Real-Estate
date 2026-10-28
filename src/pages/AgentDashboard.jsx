import { useState } from "react";
import AppointmentItem from "../components/AppointmentItem";
import { useAuth } from "../context/AuthContext";
import { setAppointmentCalled } from "../lib/api";
import { byDateTime, todayISO } from "../utils/appointments";
import { formatLongDate } from "../utils/dates";
import useAgentAppointments from "../utils/useAgentAppointments";
import useContacted from "../utils/useContacted";

export default function AgentDashboard() {
  const { agent, token } = useAuth();
  const { items, loading, error, patch } = useAgentAppointments();
  const local = useContacted(); // browser-only fallback when the database cannot store ticks
  const [tickError, setTickError] = useState("");
  const today = todayISO();

  // "Called" is stored in the database (the admin can see it). Older databases without
  // supabase/admin.sql report no value, so those ticks stay in this browser.
  const isDone = (a) => (a.called === undefined ? local.done.has(a.id) : a.called);

  const toggle = async (id) => {
    const a = items.find((x) => x.id === id);
    if (!a) return;
    setTickError("");
    if (a.called === undefined) {
      local.toggle(id);
      return;
    }
    const next = !a.called;
    patch(id, { called: next });
    try {
      await setAppointmentCalled(token, id, next);
    } catch (e) {
      patch(id, { called: !next });
      setTickError("Could not save that tick. Please try again.");
    }
  };

  // Everyone who has booked with this consultant. Not-yet-done first (soonest date first),
  // finished ones below.
  const sorted = [...items].sort(byDateTime);
  const pending = sorted.filter((a) => !isDone(a));
  const finished = sorted.filter((a) => isDone(a));
  const todayCount = pending.filter((a) => a.date === today).length;

  const stats = [
    { label: "Today's appointments", value: sorted.filter((a) => a.date === today).length },
    { label: "Still to call", value: pending.length },
    { label: "Done", value: finished.length },
  ];

  return (
    <div className="dash-home">
      <div className="title-row">
        <h1>Welcome, {agent.name}</h1>
        <span className="auth-badge">Consultant</span>
      </div>
      <p className="muted">
        {agent.areaName} · PIN {agent.pincode} · {formatLongDate(today)}
      </p>

      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {tickError && <p className="notice notice--error" role="alert">{tickError}</p>}
      {loading && <p className="muted">Loading your appointments…</p>}

      <div className="stat-grid stat-grid--three">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <span className="stat-card__value">{s.value}</span>
            <span className="stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>

      <section className="panel">
        <h2>To-do list</h2>
        <p className="muted">Call each person, then tick them as done.</p>
        {!loading && sorted.length === 0 && <p className="notice">No one has booked with you yet.</p>}

        {pending.length > 0 && (
          <>
            <p className="todo__count">
              {pending.length} to call{todayCount > 0 ? ` · ${todayCount} due today` : ""}
            </p>
            <ul className="todo-list">
              {pending.map((a) => (
                <AppointmentItem key={a.id} item={a} done={false} onToggle={toggle} showDate />
              ))}
            </ul>
          </>
        )}
        {sorted.length > 0 && pending.length === 0 && (
          <p className="notice">All done. You have spoken to everyone.</p>
        )}

        {finished.length > 0 && (
          <>
            <h3 className="todo__section">Done</h3>
            <ul className="todo-list">
              {finished.map((a) => (
                <AppointmentItem key={a.id} item={a} done onToggle={toggle} showDate />
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
