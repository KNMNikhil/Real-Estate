import { initials } from "../utils/format";
import SafeImage from "./SafeImage";

export default function ConsultantCard({ consultant, title }) {
  return (
    <article className="consultant-card card">
      {title && <h3 className="consultant-card__title">{title}</h3>}
      <div className="consultant-card__body">
        <SafeImage
          className="consultant-card__photo"
          src={consultant.photo}
          alt={`Photo of ${consultant.name}`}
          fallbackText={initials(consultant.name)}
        />
        <dl className="consultant-card__details">
          <div>
            <dt>Name</dt>
            <dd className="consultant-card__name">{consultant.name}</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>
              <a href={`tel:+91${consultant.contact}`}>{consultant.contact}</a>
              {consultant.altContact && (
                <>
                  {" / "}
                  <a href={`tel:+91${consultant.altContact}`}>{consultant.altContact}</a>
                </>
              )}
            </dd>
          </div>
          <div>
            <dt>Area</dt>
            <dd>
              {consultant.areaName} ({consultant.pincode})
            </dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{consultant.address}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
