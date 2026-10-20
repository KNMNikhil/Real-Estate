import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserBookings } from "../utils/bookings";
import { findPropertyById } from "../utils/lookup";

export default function Dashboard() {
  const { user } = useAuth();
  const bookings = getUserBookings(user.contact);
  const sold = bookings.filter((b) => b.kind === "sell");
  const bought = bookings.filter((b) => b.kind === "buy");

  return (
    <div className="narrow dash-home">
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Here is a summary of your activity.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__icon" aria-hidden="true">₹</span>
          <span className="stat-card__value">{sold.length}</span>
          <span className="stat-card__label">Properties Sold</span>
          <Link to="/dashboard/sell">Sell a property →</Link>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon" aria-hidden="true">⌂</span>
          <span className="stat-card__value">{bought.length}</span>
          <span className="stat-card__label">Properties Bought</span>
          <Link to="/dashboard/buy">Buy a property →</Link>
        </div>
      </div>

      <h2 className="dash-home__heading">Recent activity</h2>
      {bookings.length === 0 ? (
        <p className="notice">Nothing yet. Buy or sell a property to see it here.</p>
      ) : (
        <ul className="activity">
          {bookings.slice(0, 6).map((b) => {
            const property = findPropertyById(b.propertyId);
            return (
              <li key={b.id} className="activity__item">
                <span className={`activity__tag ${b.kind === "sell" ? "is-sell" : ""}`}>
                  {b.kind === "sell" ? "Sold" : "Bought"}
                </span>
                <span className="activity__name">{property?.name ?? "Property"}</span>
                <span className="activity__when">
                  {b.date} · {b.time}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
