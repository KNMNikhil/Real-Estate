import { Link } from "react-router-dom";
import BarChart from "../components/BarChart";
import { useAuth } from "../context/AuthContext";
import { byDateTime, getAppointmentsForCustomer, todayISO } from "../utils/appointments";
import { formatPriceShort } from "../utils/format";
import { findPropertyById } from "../utils/lookup";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function lastSixMonths(items) {
  const now = new Date();
  const rows = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const inMonth = items.filter((a) => a.date.startsWith(key));
    rows.push({
      label: MONTHS[d.getMonth()],
      buy: inMonth.filter((a) => a.kind === "buy").length,
      sell: inMonth.filter((a) => a.kind === "sell").length,
    });
  }
  return rows;
}

export default function Dashboard() {
  const { user } = useAuth();
  const all = getAppointmentsForCustomer(user.contact).sort(byDateTime);
  const today = todayISO();
  const done = all.filter((a) => a.status === "completed");
  const upcoming = all.filter((a) => a.status === "upcoming");
  const sold = done.filter((a) => a.kind === "sell");
  const bought = done.filter((a) => a.kind === "buy");
  const value = (list) => list.reduce((sum, a) => sum + (findPropertyById(a.propertyId)?.price ?? 0), 0);
  const nextVisit = upcoming[0];

  const stats = [
    { icon: "₹", label: "Properties Sold", value: sold.length },
    { icon: "⌂", label: "Properties Bought", value: bought.length },
    { icon: "▤", label: "Upcoming Visits", value: upcoming.length },
    { icon: "☰", label: "Total Activities", value: all.length },
    { icon: "◈", label: "Sale Value", value: `₹${formatPriceShort(value(sold)) || 0}`, small: true },
    { icon: "✓", label: "Purchase Value", value: `₹${formatPriceShort(value(bought)) || 0}`, small: true },
  ];

  return (
    <div className="dash-home">
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Here is a summary of your activity.</p>

      <div className="stat-grid stat-grid--wide">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <span className="stat-card__icon" aria-hidden="true">{s.icon}</span>
            <span className={`stat-card__value ${s.small ? "is-small" : ""}`}>{s.value}</span>
            <span className="stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="dash-two">
        <section className="panel">
          <h2>Activity, last 6 months</h2>
          <BarChart
            data={lastSixMonths(all)}
            series={[
              { key: "buy", label: "Buying", className: "is-blue" },
              { key: "sell", label: "Selling", className: "is-gold" },
            ]}
          />
        </section>

        <section className="panel">
          <h2>Next appointment</h2>
          {nextVisit ? (
            <div className="next">
              <span className={`activity__tag ${nextVisit.kind === "sell" ? "is-sell" : ""}`}>
                {nextVisit.kind === "sell" ? "Selling" : "Buying"}
              </span>
              <strong>{findPropertyById(nextVisit.propertyId)?.name ?? "Property visit"}</strong>
              <span className="muted">
                {nextVisit.date === today ? "Today" : nextVisit.date} at {nextVisit.time}
              </span>
              <Link to="/dashboard/activities">View all activities →</Link>
            </div>
          ) : (
            <p className="notice">No upcoming appointments.</p>
          )}
        </section>
      </div>

      <h2 className="dash-home__heading">Recent activity</h2>
      <ul className="activity">
        {[...all].reverse().slice(0, 5).map((a) => (
          <li key={a.id} className="activity__item">
            <span className={`activity__tag ${a.kind === "sell" ? "is-sell" : ""}`}>
              {a.kind === "sell" ? "Selling" : "Buying"}
            </span>
            <span className="activity__name">{findPropertyById(a.propertyId)?.name ?? "Property"}</span>
            <span className="activity__when">
              {a.date} · {a.time}
            </span>
          </li>
        ))}
        {all.length === 0 && <li className="notice">Nothing yet. Buy or sell a property to see it here.</li>}
      </ul>
    </div>
  );
}
