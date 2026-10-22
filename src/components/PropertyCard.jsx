import { Link } from "react-router-dom";
import { formatINR, formatPriceShort } from "../utils/format";
import SafeImage from "./SafeImage";

export default function PropertyCard({ property: p }) {
  return (
    <Link to={`/property/${p.id}`} className="mcard">
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
  );
}
