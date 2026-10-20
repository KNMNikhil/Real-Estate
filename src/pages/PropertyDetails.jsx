import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConsultantCard from "../components/ConsultantCard";
import DateStep from "../components/DateStep";
import Gallery from "../components/Gallery";
import Modal from "../components/Modal";
import SlotConfirmModal from "../components/SlotConfirmModal";
import StepIndicator from "../components/StepIndicator";
import TimeStep from "../components/TimeStep";
import { useAuth } from "../context/AuthContext";
import { isSlotTaken, saveBooking } from "../utils/bookings";
import { formatINR, formatPriceShort } from "../utils/format";
import { findConsultantById, findPropertyById } from "../utils/lookup";
import useScrollTop from "../utils/useScrollTop";
import { BUY_STEPS } from "./BuyList";

const STAGE_STEP = { details: 3, date: 4, time: 5 };

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const property = findPropertyById(propertyId);
  const consultant = property ? findConsultantById(property.consultantId) : null;

  const [stage, setStage] = useState("details"); // details | date | time
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [error, setError] = useState("");

  useScrollTop(stage);

  if (!property) {
    return (
      <div className="narrow">
        <p className="notice">This property could not be found.</p>
        <Link to="/dashboard/buy" className="btn btn--outline">
          Back to search
        </Link>
      </div>
    );
  }

  const backToList = `/dashboard/buy?pin=${property.pincode}`;
  const short = formatPriceShort(property.price);
  const rooms = (n) => (n === null || n === undefined ? "N/A" : n);

  const rows = [
    ["Type", property.type],
    ["Price", `${formatINR(property.price)}${short ? ` (${short})` : ""}`],
    ["Area", `${Number(property.sqft).toLocaleString("en-IN")} sq. ft.`],
    ["Bedrooms", rooms(property.bedrooms)],
    ["Bathrooms", rooms(property.bathrooms)],
    ["Floor", property.floor],
    ["Facing", property.facing],
    ["Locality", `${property.area} - ${property.pincode}`],
  ];

  const handleConfirm = () => {
    if (isSlotTaken(consultant.id, date, time)) {
      setConfirmOpen(false);
      setTime("");
      setError("That time slot was just taken. Please choose another time.");
      return;
    }
    saveBooking({
      consultantId: consultant.id,
      date,
      time,
      kind: "buy",
      propertyId: property.id,
      userContact: user.contact,
      userName: user.name,
    });
    setConfirmOpen(false);
    setVisitOpen(true);
  };

  return (
    <div className="narrow">
      <Link to={backToList} className="back-link">
        ‹ Back to properties
      </Link>
      <StepIndicator steps={BUY_STEPS} current={visitOpen ? 6 : STAGE_STEP[stage]} />

      {stage === "details" && (
        <article className="property-detail">
          <Gallery images={property.images} name={property.name} />
          <div className="card">
            <h1 className="property-detail__title">{property.name}</h1>
            <dl className="spec-grid">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <h2 className="subhead">Address</h2>
            <p>{property.address}</p>
            <h2 className="subhead">Description</h2>
            <p>{property.description}</p>
          </div>

          {consultant ? (
            <>
              <ConsultantCard consultant={consultant} title="Your consultant" />
              <div className="actions actions--end">
                <button type="button" className="btn btn--primary btn--large" onClick={() => setStage("date")}>
                  Contact Agent
                </button>
              </div>
            </>
          ) : (
            <p className="notice">No consultant is assigned to this property yet.</p>
          )}
        </article>
      )}

      {stage === "date" && (
        <DateStep
          value={date}
          onChange={(d) => {
            setDate(d);
            setTime("");
          }}
          onBack={() => setStage("details")}
          onNext={() => setStage("time")}
        />
      )}

      {stage === "time" && (
        <>
          {error && (
            <p className="notice notice--error" role="alert">
              {error}
            </p>
          )}
          <TimeStep
            consultantId={consultant.id}
            date={date}
            value={time}
            onChange={(t) => {
              setTime(t);
              setError("");
            }}
            onBack={() => setStage("date")}
            onNext={() => setConfirmOpen(true)}
          />
        </>
      )}

      {confirmOpen && (
        <SlotConfirmModal
          date={date}
          time={time}
          onConfirm={handleConfirm}
          onChange={() => setConfirmOpen(false)}
        />
      )}

      {visitOpen && (
        <Modal
          title="Visit booked"
          actions={
            <button
              type="button"
              className="btn btn--primary"
              autoFocus
              onClick={() => navigate("/dashboard/buy")}
            >
              Okay
            </button>
          }
        >
          <p>Visit the property soon. We&rsquo;ll see you on the day and time you have selected.</p>
        </Modal>
      )}
    </div>
  );
}
