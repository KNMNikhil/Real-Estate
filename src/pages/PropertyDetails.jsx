import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConsultantCard from "../components/ConsultantCard";
import ContactForm from "../components/ContactForm";
import DateStep from "../components/DateStep";
import Gallery from "../components/Gallery";
import Modal from "../components/Modal";
import SlotConfirmModal from "../components/SlotConfirmModal";
import StepIndicator from "../components/StepIndicator";
import TimeStep from "../components/TimeStep";
import { SlotTakenError, bookAppointment } from "../lib/api";
import { formatINR, formatPriceShort } from "../utils/format";
import { findConsultantById } from "../utils/lookup";
import useProperties from "../utils/useProperties";
import useScrollTop from "../utils/useScrollTop";

const BUY_STEPS = ["Property", "Your details", "Date", "Time", "Confirmed"];
const STAGE_STEP = { details: 1, info: 2, date: 3, time: 4 };

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const { properties, loading } = useProperties();
  const property = properties.find((p) => p.id === propertyId) ?? null;
  const consultant = property ? findConsultantById(property.consultantId) : null;

  const [stage, setStage] = useState("details"); // details | info | date | time
  const [contact, setContact] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useScrollTop(stage);

  if (!property && loading) {
    return (
      <div className="narrow site-main">
        <p className="muted">Loading property…</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="narrow site-main">
        <p className="notice">This property could not be found.</p>
        <Link to="/marketplace" className="btn btn--outline">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const backToList = `/marketplace?pin=${property.pincode}`;
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

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await bookAppointment({
        consultantId: consultant.id,
        kind: "buy",
        date,
        time,
        contact,
        propertyId: property.id,
        propertyName: property.name,
      });
      setConfirmOpen(false);
      setVisitOpen(true);
    } catch (e) {
      setConfirmOpen(false);
      if (e instanceof SlotTakenError) setTime("");
      setError(e.message || "Could not book the visit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="narrow site-main">
      <Link to={backToList} className="back-link">
        ‹ Back to marketplace
      </Link>
      <StepIndicator steps={BUY_STEPS} current={visitOpen ? 5 : STAGE_STEP[stage]} />

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
                <button type="button" className="btn btn--primary btn--large" onClick={() => setStage("info")}>
                  Book a visit
                </button>
              </div>
            </>
          ) : (
            <p className="notice">No consultant is assigned to this property yet.</p>
          )}
        </article>
      )}

      {stage === "info" && (
        <section className="card step-card" aria-labelledby="info-title">
          <h2 id="info-title">Your details</h2>
          <p className="muted">
            We share these with your consultant, {consultant.name}, so they can confirm your visit. No account is needed.
          </p>
          <ContactForm
            initial={contact ?? {}}
            onBack={() => setStage("details")}
            onSubmit={(c) => {
              setContact(c);
              setStage("date");
            }}
          />
        </section>
      )}

      {stage === "date" && (
        <DateStep
          value={date}
          onChange={(d) => {
            setDate(d);
            setTime("");
          }}
          onBack={() => setStage("info")}
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
          busy={saving}
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
              onClick={() => navigate("/marketplace")}
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
