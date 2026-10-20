import BarChart from "../components/BarChart";
import { useAuth } from "../context/AuthContext";
import { byDateTime, getAppointmentsForAgent, toISO, todayISO } from "../utils/appointments";
import { formatPriceShort } from "../utils/format";
import { findPropertyById } from "../utils/lookup";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AgentDashboard() {
  const { agent } = useAuth();
  const all = getAppointmentsForAgent(agent.id).sort(byDateTime);
  const today = todayISO();

  const done = all.filter((a) => a.status === "completed");
  const sold = done.filter((a) => a.kind === "sell");
  const bought = done.filter((a) => a.kind === "buy");
  const customers = new Set(all.map((a) => a.customerContact));
  const todays = all.filter((a) => a.date === today);
  const weekEnd = toISO(new Date(Date.now() + 7 * 864e5));
  const thisWeek = all.filter((a) => a.date >= today && a.date <= weekEnd);
  const value = done.reduce((sum, a) => sum + (findPropertyById(a.propertyId)?.price ?? 0), 0);

  // Last 14 days: customers seen per day, split by buying / selling.
  const days = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = toISO(d);
    const items = all.filter((a) => a.date === iso);
    days.push({
      label: `${d.getDate()}`,
      sub: DAY[d.getDay()],
      buy: items.filter((a) => a.kind === "buy").length,
      sell: items.filter((a) => a.kind === "sell").length,
      total: items.length,
      iso,
    });
  }
  const busiest = days.reduce((best, d) => (d.total > best.total ? d : best), days[0]);

  // Weekday pattern across all history.
  const byWeekday = DAY.map((label, idx) => ({
    label,
    buy: done.filter((a) => new Date(a.date).getDay() === idx && a.kind === "buy").length,
    sell: done.filter((a) => new Date(a.date).getDay() === idx && a.kind === "sell").length,
  }));

  const stats = [
    { icon: "☺", label: "Total Customers", value: customers.size },
    { icon: "▤", label: "Appointments Today", value: todays.length },
    { icon: "⌂", label: "Properties Bought", value: bought.length },
    { icon: "₹", label: "Properties Sold", value: sold.length },
    { icon: "☰", label: "Next 7 Days", value: thisWeek.length },
    { icon: "◈", label: "Deal Value", value: `₹${formatPriceShort(value) || 0}`, small: true },
  ];
  const series = [
    { key: "buy", label: "Buying", className: "is-blue" },
    { key: "sell", label: "Selling", className: "is-gold" },
  ];

  return (
    <div className="dash-home">
      <div className="title-row">
        <h1>Welcome, {agent.name}</h1>
        <span className="auth-badge">Agent</span>
      </div>
      <p className="muted">
        {agent.areaName} · PIN {agent.pincode}
      </p>

      <div className="stat-grid stat-grid--wide">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <span className="stat-card__icon" aria-hidden="true">{s.icon}</span>
            <span className={`stat-card__value ${s.small ? "is-small" : ""}`}>{s.value}</span>
            <span className="stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>

      <section className="panel">
        <h2>Customers per day, last 14 days</h2>
        <BarChart data={days} series={series} />
        <p className="muted chart__note">
          Busiest day: {busiest.sub} {busiest.iso.slice(5)} with {busiest.total} customers.
        </p>
      </section>

      <div className="dash-two">
        <section className="panel">
          <h2>Deals by weekday</h2>
          <BarChart data={byWeekday} series={series} height={130} />
        </section>
        <section className="panel">
          <h2>Today&rsquo;s appointments</h2>
          {todays.length === 0 ? (
            <p className="notice">No appointments today.</p>
          ) : (
            <ul className="agenda">
              {todays.map((a) => (
                <li key={a.id}>
                  <strong>{a.time}</strong>
                  <span>
                    {a.customerName}
                    <em>{a.kind === "sell" ? "Selling" : "Buying"} · {findPropertyById(a.propertyId)?.name ?? "Property"}</em>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
