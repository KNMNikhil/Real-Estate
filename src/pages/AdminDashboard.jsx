import DemoBanner from "../components/DemoBanner";
import { Link } from "react-router-dom";
import BarChart from "../components/BarChart";
import { useAdmin } from "../context/AdminContext";
import { formatLongDate } from "../utils/dates";
import useAdminData, { agentStats } from "../utils/useAdminData";

const SERIES = [
  { key: "buy", label: "Buying", className: "is-blue" },
  { key: "sell", label: "Selling", className: "is-gold" },
];

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const { agents, deals, loading, error } = useAdminData();

  const called = deals.filter((d) => d.called).length;
  const stats = [
    { label: "Number of deals", value: deals.length },
    { label: "Buying", value: deals.filter((d) => d.kind === "buy").length },
    { label: "Selling", value: deals.filter((d) => d.kind === "sell").length },
    { label: "Calls attended", value: called },
    { label: "Still to call", value: deals.length - called },
    { label: "Agents", value: agents.length },
  ];

  const rows = agents.map((a) => ({ agent: a, ...agentStats(a.id, deals) }));
  const chart = rows.map((r) => ({ label: r.agent.name.split(" ")[0], buy: r.buy, sell: r.sell }));
  const recent = deals.slice(0, 8);

  return (
    <div className="dash-home">
      <div className="title-row">
        <h1>Admin dashboard</h1>
        <span className="auth-badge">Admin</span>
      </div>
      <p className="muted">Signed in as {admin.email}</p>
      <DemoBanner />

      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      <div className="stat-grid stat-grid--wide">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <span className="stat-card__value">{s.value}</span>
            <span className="stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>

      {agents.length > 0 && (
        <section className="panel">
          <h2>Deals per agent</h2>
          <BarChart data={chart} series={SERIES} />
        </section>
      )}

      <section className="panel">
        <h2>How each agent is doing</h2>
        {rows.length === 0 ? (
          !loading && <p className="notice">No agents yet. Add one from the Agents page.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Area</th>
                  <th>Deals</th>
                  <th>Buying</th>
                  <th>Selling</th>
                  <th>Calls attended</th>
                  <th>Still to call</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.agent.id}>
                    <td>
                      <Link to={`/admin/agents/${r.agent.id}`}>{r.agent.name}</Link>
                    </td>
                    <td>{r.agent.areaName} ({r.agent.pincode})</td>
                    <td>{r.total}</td>
                    <td>{r.buy}</td>
                    <td>{r.sell}</td>
                    <td>{r.called}</td>
                    <td>{r.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Latest bookings</h2>
        {recent.length === 0 ? (
          !loading && <p className="notice">No bookings yet.</p>
        ) : (
          <ul className="activity-list">
            {recent.map((d) => (
              <li key={d.id}>
                <div>
                  <strong>{d.customerName}</strong> · {d.kind === "sell" ? "Selling" : "Buying"}
                  <em>
                    with <Link to={`/admin/agents/${d.agentId}`}>{d.agentName}</Link> · {formatLongDate(d.date)}
                  </em>
                </div>
                <span className={`pill ${d.called ? "pill--done" : "pill--todo"}`}>{d.called ? "Called" : "To call"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
