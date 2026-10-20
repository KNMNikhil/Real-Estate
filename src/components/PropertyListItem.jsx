import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";

// Shows only the name, area, square feet and one thumbnail (or an empty placeholder box).
export default function PropertyListItem({ property }) {
  return (
    <li>
      <Link to={`/dashboard/functions/buy/${property.id}`} className="property-item">
        <SafeImage
          className="property-item__thumb"
          src={property.images?.[0]}
          alt={`${property.name} thumbnail`}
          fallbackText=""
        />
        <div className="property-item__info">
          <h3>{property.name}</h3>
          <p>{property.area}</p>
          <p>{Number(property.sqft).toLocaleString("en-IN")} sq. ft.</p>
        </div>
        <span className="property-item__chev" aria-hidden="true">
          ›
        </span>
      </Link>
    </li>
  );
}
