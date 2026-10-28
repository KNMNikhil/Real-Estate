import { Link } from "react-router-dom";
import AppointmentItem from "../components/AppointmentItem";
import SafeImage from "../components/SafeImage";
import { useAdmin } from "../context/AdminContext";
import { todayISO } from "../utils/appointments";
import { initials } from "../utils/format";
import useAdminData from "../utils/useAdminData";

// One person is listed once per kind of request (buying / selling), earliest first.
function uniqueDeals(list) {
  const seen = new Set();
  return [...list]
    .sort((a, b) => `${a.date} ${a.createdAt}`.localeCompare(`${b.date} ${b.createdAt}`))
    .filter((d) => {
      const key = `${d.customerPhone}:${d.kind}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

const itemOf = (d) => ({
  id: d.id,
  customerName: d.customerName,
  customerContact: d.customerPhone,
  customerEmail: d.customerEmail,
  kind: d.kind,
  propertyName: d.label,
  date: d.date,
});

// Admin dashboard: for each consultant, exactly what the consultant sees on their own dashboard.
export default function AdminDashboard() {
  const { admin } = useAdmin();
  const { agents, deals, loading, error } = useAdminData();
  const today = todayISO();

  return (
    <div className="dash-home">
      <div className="title-row">
        <h1>Admin dashboard</h1>
        <span className="auth-badge">Admin</span>
      </div>
      <p className="muted">
        Signed in as {admin.email} ·{" "}
        <Link to="/admin/agents">Manage consultants</Link>
      </p>

      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && !error && agents.length === 0 && <p className="notice">No consultants yet.</p>}

      {agents.map((a) => {
        const mine = uniqueDeals(deals.filter((d) => d.agentId === a.id));
        const pending = mine.filter((d) => !d.called);
        const finished = mine.filter((d) => d.called);
        const stats = [
          { label: "Today's appointments", value: mine.filter((d) => d.date === today).length },
          { label: "Still to call", value: pending.length },
          { label: "Done", value: finished.length },
        ];
        return (
          <section key={a.id} className="panel admin-consultant">
            <div className="agent-row admin-consultant__head">
              <SafeImage className="agent-row__photo" src={a.photo} alt={`Photo of ${a.name}`} fallbackText={initials(a.name)} />
              <div className="agent-row__info">
                <h2>{a.name}</h2>
                {a.tagline && <span className="consultant-card__tagline">{a.tagline}</span>}
                <p>{a.areaName} · PIN {a.pincode}</p>
                <p>
                  <a href={`tel:+91${a.contact}`}>{a.contact}</a>
                  {a.altContact && (
                    <>
                      {" / "}
                      <a href={`tel:+91${a.altContact}`}>{a.altContact}</a>
                    </>
                  )}
                  {a.email ? ` · ${a.email}` : ""}
                </p>
                {a.address && <p className="muted">{a.address}</p>}
              </div>
            </div>

            <div className="stat-grid stat-grid--three">
              {stats.map((s) => (
                <div className="stat-card" key={s.label}>
                  <span className="stat-card__value">{s.value}</span>
                  <span className="stat-card__label">{s.label}</span>
                </div>
              ))}
            </div>

            <h3 className="admin-consultant__sub">To-do list</h3>
            {mine.length === 0 && <p className="notice">No one has booked with this consultant yet.</p>}
            {pending.length > 0 && (
              <ul className="todo-list">
                {pending.map((d) => (
                  <AppointmentItem key={d.id} item={itemOf(d)} done={false} viewOnly showDate />
                ))}
              </ul>
            )}
            {finished.length > 0 && (
              <>
                <h3 className="todo__section">Done</h3>
                <ul className="todo-list">
                  {finished.map((d) => (
                    <AppointmentItem key={d.id} item={itemOf(d)} done viewOnly showDate />
                  ))}
                </ul>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
