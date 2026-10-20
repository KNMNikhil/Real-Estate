import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { consultants } from "../data/dummyData";
import { byDateTime, getAppointmentsForCustomer } from "../utils/appointments";
import { findPropertyById } from "../utils/lookup";

const TABS = [
  ["all", "All"],
  ["upcoming", "Upcoming"],
  ["completed", "Completed"],
];

export default function Activities() {
  const { user } = useAuth();
  const [tab, setTab] = useState("all");
  const all = getAppointmentsForCustomer(user.contact).sort((a, b) => byDateTime(b, a));
  const list = tab === "all" ? all : all.filter((a) => a.status === tab);

  return (
    <div className="narrow">
      <h1>Activities</h1>
      <p className="muted">Your appointments with agents for buying and selling.</p>

      <div className="pill-tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`pill-tabs__tab ${tab === key ? "is-active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="notice">No activities here yet.</p>
      ) : (
        <ul className="act-list">
          {list.map((a) => {
            const agent = consultants.find((c) => c.id === a.consultantId);
            const property = findPropertyById(a.propertyId);
            return (
              <li key={a.id} className="act-card">
                <div className="act-card__date">
                  <strong>{a.date.slice(8)}</strong>
                  <span>{new Date(a.date).toLocaleString("en-IN", { month: "short" })}</span>
                </div>
                <div className="act-card__body">
                  <div className="act-card__row">
                    <h3>{property?.name ?? "Property visit"}</h3>
                    <span className={`activity__tag ${a.kind === "sell" ? "is-sell" : ""}`}>
                      {a.kind === "sell" ? "Selling" : "Buying"}
                    </span>
                    <span className={`status status--${a.status}`}>{a.status}</span>
                  </div>
                  <p>
                    {a.time} · Agent {agent?.name ?? "—"} ({agent?.areaName})
                  </p>
                  {agent && <p className="muted">{agent.contact}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
