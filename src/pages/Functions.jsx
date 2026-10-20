import { Link } from "react-router-dom";

export default function Functions() {
  return (
    <div className="narrow">
      <h1>Functions</h1>
      <p className="muted">What would you like to do today?</p>
      <div className="option-grid">
        <Link to="/dashboard/functions/sell" className="option-card card">
          <span className="option-card__icon" aria-hidden="true">
            ₹
          </span>
          <h2>Selling a Property</h2>
          <p>Meet your area consultant and list your property.</p>
        </Link>
        <Link to="/dashboard/functions/buy" className="option-card card">
          <span className="option-card__icon" aria-hidden="true">
            ⌂
          </span>
          <h2>Buying a Property</h2>
          <p>Browse properties in your area and book a visit.</p>
        </Link>
      </div>
    </div>
  );
}
