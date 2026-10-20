import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SafeImage from "../components/SafeImage";
import { formatINR, formatPriceShort } from "../utils/format";
import { getAllProperties } from "../utils/lookup";
import { validatePin } from "../utils/validators";

const TYPES = ["All", "Apartment", "Villa", "Independent House", "Plot"];
const PRICES = [
  ["any", "Any price", 0, Infinity],
  ["u80", "Under ₹80 L", 0, 8000000],
  ["80-150", "₹80 L – ₹1.5 Cr", 8000000, 15000000],
  ["o150", "Above ₹1.5 Cr", 15000000, Infinity],
];

export default function Marketplace() {
  const all = useMemo(() => getAllProperties(), []);
  const [pin, setPin] = useState("");
  const [type, setType] = useState("All");
  const [price, setPrice] = useState("any");
  const [beds, setBeds] = useState("any");
  const [sort, setSort] = useState("new");

  const pinError = pin && pin.length === 6 ? validatePin(pin) : "";
  const [, , min, max] = PRICES.find((p) => p[0] === price);

  const list = all
    .filter((p) => !pin || p.pincode.startsWith(pin))
    .filter((p) => type === "All" || p.type === type)
    .filter((p) => p.price >= min && p.price < max)
    .filter((p) => beds === "any" || (p.bedrooms ?? 0) >= Number(beds))
    .sort((a, b) =>
      sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );

  const reset = () => {
    setPin("");
    setType("All");
    setPrice("any");
    setBeds("any");
    setSort("new");
  };

  return (
    <div className="market">
      <h1>Marketplace</h1>
      <p className="muted">Browse projects across all areas.</p>

      <div className="market__bar">
        <div className="market__search">
          <span aria-hidden="true">⌕</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Search by PIN code, e.g. 600089"
            value={pin}
            aria-label="Search by PIN code"
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Property type">
          {TYPES.map((t) => (
            <option key={t} value={t}>{t === "All" ? "All types" : t}</option>
          ))}
        </select>
        <select value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price range">
          {PRICES.map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <select value={beds} onChange={(e) => setBeds(e.target.value)} aria-label="Bedrooms">
          <option value="any">Any bedrooms</option>
          <option value="2">2+ BHK</option>
          <option value="3">3+ BHK</option>
          <option value="4">4+ BHK</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="new">Newest first</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>
      {pinError && <p className="field__error">{pinError}</p>}

      <p className="market__count">
        {list.length} {list.length === 1 ? "project" : "projects"}
        {pin && ` for PIN ${pin}`}
        <button type="button" className="link-button" onClick={reset}>Reset filters</button>
      </p>

      {list.length === 0 ? (
        <p className="notice">No projects match these filters.</p>
      ) : (
        <ul className="market__grid">
          {list.map((p) => (
            <li key={p.id}>
              <Link to={`/dashboard/buy/${p.id}`} className="mcard">
                <SafeImage className="mcard__img" src={p.images?.[0]} alt={p.name} fallbackText="" />
                <span className="mcard__type">{p.type}</span>
                <div className="mcard__body">
                  <h3>{p.name}</h3>
                  <p className="muted">{p.area} · {p.pincode}</p>
                  <p className="mcard__meta">
                    {Number(p.sqft).toLocaleString("en-IN")} sq. ft.
                    {p.bedrooms ? ` · ${p.bedrooms} BHK` : ""}
                  </p>
                  <p className="mcard__price">
                    {formatINR(p.price)} <span>{formatPriceShort(p.price)}</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
