import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { byDateTime, getAppointmentsForAgent, toISO, todayISO } from "../utils/appointments";
import { findPropertyById } from "../utils/lookup";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AgentCalendar() {
  const { agent } = useAuth();
  const all = getAppointmentsForAgent(agent.id);
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
                  className={`cal__day ${iso(d) === today ? "is-today" : ""} ${iso(d) === selected ? "is-selected" : ""}`}
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
          <h2>{new Date(selected).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</h2>
          {day.length === 0 ? (
            <p className="notice">No appointments on this day.</p>
          ) : (
            <ul className="agenda">
              {day.map((a) => (
                <li key={a.id}>
                  <strong>{a.time}</strong>
                  <span>
                    {a.customerName}
                    <em>
                      {a.kind === "sell" ? "Selling" : "Buying"} · {findPropertyById(a.propertyId)?.name ?? "Property"} · {a.customerContact}
                    </em>
                  </span>
                  <span className={`status status--${a.status}`}>{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
