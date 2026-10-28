import { Link, useParams } from "react-router-dom";
import SafeImage from "../components/SafeImage";
import { formatLongDate } from "../utils/dates";
import { initials } from "../utils/format";
import useAdminData, { agentStats } from "../utils/useAdminData";

// What one consultant is doing: every booking they have and whether they have called the customer.
export default function AdminAgentDetail() {
  const { agentId } = useParams();
  const { agents, deals, loading, error } = useAdminData();
  const agent = agents.find((a) => a.id === agentId);
  const mine = deals.filter((d) => d.agentId === agentId);
  const s = agentStats(agentId, deals);

  if (!loading && !agent && !error) {
    return (
      <div className="dash-home">
        <p className="notice">That consultant was not found.</p>
        <Link to="/admin/agents" className="btn btn--outline">Back to consultants</Link>
      </div>
    );
  }

  return (
    <div className="dash-home">
      <Link to="/admin/agents" className="back-link">‹ All consultants</Link>
      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      {agent && (
        <>
          <section className="panel agent-row">
            <SafeImage className="agent-row__photo" src={agent.photo} alt={`Photo of ${agent.name}`} fallbackText={initials(agent.name)} />
            <div className="agent-row__info">
              <h1>{agent.name}</h1>
              <p>{agent.areaName} · PIN {agent.pincode}</p>
              <p><a href={`tel:+91${agent.contact}`}>{agent.contact}</a>{agent.email ? ` · ${agent.email}` : ""}</p>
              {agent.address && <p className="muted">{agent.address}</p>}
            </div>
          </section>

          <div className="stat-grid stat-grid--wide">
            {[
              ["Number of deals", s.total],
              ["Buying", s.buy],
              ["Selling", s.sell],
              ["Calls attended", s.called],
              ["Still to call", s.pending],
            ].map(([label, value]) => (
              <div className="stat-card" key={label}>
                <span className="stat-card__value">{value}</span>
                <span className="stat-card__label">{label}</span>
              </div>
            ))}
          </div>

          <section className="panel">
            <h2>Bookings</h2>
            {mine.length === 0 ? (
              <p className="notice">This consultant has no bookings yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Call</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mine.map((d) => (
                      <tr key={d.id}>
                        <td>{d.customerName}</td>
                        <td><a href={`tel:+91${d.customerPhone}`}>{d.customerPhone}</a></td>
                        <td>{d.customerEmail}</td>
                        <td>{d.kind === "sell" ? "Selling" : "Buying"}</td>
                        <td>{formatLongDate(d.date)}</td>
                        <td>
                          <span className={`pill ${d.called ? "pill--done" : "pill--todo"}`}>{d.called ? "Called" : "To call"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
