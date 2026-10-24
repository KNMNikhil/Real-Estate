import { useState } from "react";
import AppointmentItem from "../components/AppointmentItem";
import { byDateTime, toISO, todayISO } from "../utils/appointments";
import useAgentAppointments from "../utils/useAgentAppointments";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AgentCalendar() {
  const { items: all, loading, error } = useAgentAppointments();
  const today = todayISO();
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selected, setSelected] = useState(today);

  const first = month.getDay();
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const iso = (d) => toISO(new Date(month.getFullYear(), month.getMonth(), d));
  const on = (date) => all.filter((a) => a.date === date);
  const day = on(selected).sort(byDateTime);
  const shift = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="cal-page">
      <h1>Calendar</h1>
      <p className="muted">Reminders of who is booked on each day. Tick them off from the Dashboard.</p>
      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {loading && <p className="muted">Loading appointments…</p>}
      <div className="cal-layout">
        <section className="panel cal">
          <div className="cal__head">
            <button type="button" className="cal__arrow" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
            <strong>{month.toLocaleString("en-IN", { month: "long", year: "numeric" })}</strong>
            <button type="button" className="cal__arrow" onClick={() => shift(1)} aria-label="Next month">›</button>
          </div>
          <div className="cal__grid">
            {WD.map((d) => (
              <span key={d} className="cal__wd">{d}</span>
            ))}
            {cells.map((d, i) =>
              d === null ? (
                <span key={`e${i}`} />
              ) : (
                <button
                  key={d}
                  type="button"
                  className={`cal__day ${iso(d) === today ? "is-today" : ""} ${iso(d) === selected ? "is-selected" : ""} ${on(iso(d)).length > 0 ? "has-visit" : ""}`}
                  aria-label={`${d}${on(iso(d)).length ? `, ${on(iso(d)).length} visit${on(iso(d)).length > 1 ? "s" : ""}` : ""}`}
                  onClick={() => setSelected(iso(d))}
                >
                  {d}
                  {on(iso(d)).length > 0 && <span className="cal__badge">{on(iso(d)).length}</span>}
                </button>
              )
            )}
          </div>
        </section>

        <section className="panel">
          <h2>{new Date(`${selected}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</h2>
          {day.length === 0 ? (
            <p className="notice">No appointments on this day.</p>
          ) : (
            <ul className="todo-list">
              {day.map((a) => (
                <AppointmentItem key={a.id} item={a} readOnly />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
