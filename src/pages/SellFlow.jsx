import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConsultantCard from "../components/ConsultantCard";
import ContactForm from "../components/ContactForm";
import DateStep from "../components/DateStep";
import Modal from "../components/Modal";
import PinForm from "../components/PinForm";
import PropertyForm from "../components/PropertyForm";
import SlotConfirmModal from "../components/SlotConfirmModal";
import StepIndicator from "../components/StepIndicator";
import TimeStep from "../components/TimeStep";
import { mouText } from "../data/dummyData";
import { SlotTakenError, bookAppointment } from "../lib/api";
import { formatLongDate, formatTime } from "../utils/dates";
import { findConsultantByPin } from "../utils/lookup";
import useScrollTop from "../utils/useScrollTop";

const STEPS = ["Your details", "Area", "Consultant", "Date", "Time", "Agreement", "Property"];
const SAMPLE_PINS = ["600089", "600001", "600020", "600041"];
const DOCS = ["Sale deed or title document", "Encumbrance certificate", "Latest property tax receipt", "Your photo ID"];

const TIPS = {
  1: ["Why we ask", ["No account is needed.", "Your consultant uses these details to confirm your meeting.", "We never share them outside Living Gods."]],
  2: ["Why your PIN?", ["Each area has its own dedicated consultant.", "Your consultant knows local prices and buyers.", "Enter the PIN where the property is located."]],
  3: ["What your consultant does", ["Visits and verifies your property.", "Helps you set a fair price.", "Handles buyer visits and paperwork with you."]],
  4: ["Choosing a date", ["Bookings open from tomorrow.", "Pick a day when you or a representative can be at the property.", "Use the arrows to see later months."]],
  5: ["Choosing a time", ["Slots are 30 minutes apart.", "Greyed-out slots are already booked.", "Morning slots usually have the best light for photos."]],
  6: ["About the agreement", ["It sets out how we list and promote your property.", "Read it fully before you accept.", "Your consultant can explain any clause."]],
  7: ["Tips for a great listing", ["Add clear, well-lit photos of every room.", "Use the real built-up area and expected price.", "A detailed description gets more visits."]],
};

export default function SellFlow() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [contact, setContact] = useState(null);
  const [pin, setPin] = useState("");
  const [consultant, setConsultant] = useState(null);
  const [noConsultant, setNoConsultant] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveNote, setSaveNote] = useState("");
  const [formError, setFormError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  useScrollTop(step);

  const handlePin = (value) => {
    const found = findConsultantByPin(value);
    setNoConsultant(!found);
    if (found) {
      setPin(value);
      setConsultant(found);
      setStep(3);
    }
  };

  const handleSubmit = async (values, media) => {
    setSubmitting(true);
    setFormError("");

    const floor = values.type === "Plot" ? "N/A" : `${values.floor.trim()} of ${values.totalFloors}`;
    const hasRooms = values.type !== "Plot";
    const property = {
      id: `U${Date.now()}`,
      name: values.name.trim(),
      type: values.type,
      pincode: pin,
      area: values.area.trim(),
      sqft: Number(values.sqft),
      bedrooms: hasRooms && values.bedrooms !== "" ? Number(values.bedrooms) : null,
      bathrooms: hasRooms && values.bathrooms !== "" ? Number(values.bathrooms) : null,
      floor,
      facing: values.facing,
      price: Number(values.price),
      address: values.address.trim(),
      description: values.description.trim(),
      images: media.filter((m) => m.kind === "image").map((m) => m.url),
      consultantId: consultant.id,
      uploadedAt: new Date().toISOString(),
      owner: { name: contact.name, contact: contact.phone, email: contact.email },
    };

    try {
      const result = await bookAppointment({
        consultantId: consultant.id,
        kind: "sell",
        date,
        time,
        contact,
        property,
      });
      setSaveNote(
        result.photosDropped ? "Your photos were too large to store in this demo, so the listing was saved without them." : ""
      );
      setSuccessOpen(true);
    } catch (e) {
      if (e instanceof SlotTakenError) {
        setFormError(e.message);
        setTime("");
        setStep(5);
      } else {
        setFormError(e.message || "Could not save the property. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const [tipTitle, tipList] = TIPS[step];

  return (
    <div className="sell site-main">
      <header className="sell__head">
        <span className="lp-eyebrow">Sell a property</span>
        <h1>List your property with us</h1>
        <p className="muted">No account needed. Meet your area consultant, sign the agreement and list your property in a few easy steps.</p>
      </header>
      <StepIndicator steps={STEPS} current={step} />

      <div className="sell__layout">
        <div className="sell__main">
          {step === 1 && (
            <section className="card step-card" aria-labelledby="who-title">
              <h2 id="who-title">Your details</h2>
              <p className="muted">Tell us how to reach you.</p>
              <ContactForm
                initial={contact ?? {}}
                onSubmit={(c) => {
                  setContact(c);
                  setStep(2);
                }}
              />
            </section>
          )}

          {step === 2 && (
            <section className="card step-card sell-card">
              <span className="sell-card__icon" aria-hidden="true">⌖</span>
              <h2>Where is your property?</h2>
              <p className="muted">We will connect you with the consultant who covers that area.</p>
              <PinForm
                label="Area PIN code"
                buttonLabel="Find consultant"
                initialValue={pin}
                onChange={() => setNoConsultant(false)}
                onSubmit={handlePin}
              />
              {noConsultant && <p className="notice">No consultant available for this area yet.</p>}
              <div className="chips">
                <span className="muted">Try:</span>
                {SAMPLE_PINS.map((p) => (
                  <button key={p} type="button" className="chip" onClick={() => handlePin(p)}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="actions">
                <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
                  Back
                </button>
                <span />
              </div>
            </section>
          )}

          {step === 3 && consultant && (
            <>
              <ConsultantCard consultant={consultant} title="Your area consultant" />
              <div className="actions">
                <button type="button" className="btn btn--ghost" onClick={() => setStep(2)}>
                  Change PIN
                </button>
                <button type="button" className="btn btn--primary" onClick={() => setStep(4)}>
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <DateStep
              value={date}
              onChange={(d) => {
                setDate(d);
                setTime("");
              }}
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
            />
          )}

          {step === 5 && (
            <>
              {formError && (
                <p className="notice notice--error" role="alert">
                  {formError}
                </p>
              )}
              <TimeStep
                consultantId={consultant.id}
                date={date}
                value={time}
                onChange={(t) => {
                  setTime(t);
                  setFormError("");
                }}
                onBack={() => setStep(4)}
                onNext={() => setConfirmOpen(true)}
              />
            </>
          )}

          {step === 6 && (
            <section className="card step-card" aria-labelledby="mou-title">
              <h2 id="mou-title">Agreement (MOU)</h2>
              <p className="muted">Please read the terms before listing your property.</p>
              <div className="mou-box" tabIndex={0} role="region" aria-label="MOU terms">
                {mouText}
              </div>
              <label className="checkbox">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>I agree to the terms and conditions.</span>
              </label>
              <div className="actions">
                <button type="button" className="btn btn--ghost" onClick={() => setStep(5)}>
                  Back
                </button>
                <button type="button" className="btn btn--primary" disabled={!agreed} onClick={() => setStep(7)}>
                  Continue
                </button>
              </div>
            </section>
          )}

          {step === 7 && (
            <section aria-labelledby="details-title">
              <h2 id="details-title" className="sell__section-title">Property details</h2>
              {formError && (
                <p className="notice notice--error" role="alert">
                  {formError}
                </p>
              )}
              <PropertyForm
                initial={{ pincode: pin, area: consultant.areaName }}
                pinLocked
                submitting={submitting}
                onSubmit={handleSubmit}
                onBack={() => setStep(6)}
              />
            </section>
          )}
        </div>

        <aside className="sell__aside" aria-label="Helpful information">
          <section>
            <h3>{tipTitle}</h3>
            <ul className="tips">
              {tipList.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          {step >= 4 && (
            <section>
              <h3>Keep these ready</h3>
              <ul className="docs">
                {DOCS.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </section>
          )}

          {consultant && (
            <section className="help">
              <h3>Need help?</h3>
              <p>
                Call <strong>{consultant.name}</strong>
                <br />
                <a href={`tel:+91${consultant.contact}`}>{consultant.contact}</a>
              </p>
            </section>
          )}
        </aside>
      </div>

      {confirmOpen && (
        <SlotConfirmModal
          date={date}
          time={time}
          onConfirm={() => {
            setConfirmOpen(false);
            setStep(6);
          }}
          onChange={() => setConfirmOpen(false)}
        />
      )}

      {successOpen && (
        <Modal
          title="Meeting booked"
          actions={
            <button
              type="button"
              className="btn btn--primary"
              autoFocus
              onClick={() => navigate(`/marketplace?pin=${pin}`)}
            >
              View in marketplace
            </button>
          }
        >
          <p>
            Thank you, <strong>{contact.name}</strong>. You have booked a meeting with{" "}
            <strong>{consultant.name}</strong> on <strong>{formatLongDate(date)}</strong> at{" "}
            <strong>{formatTime(time)}</strong>. We will reach you at {contact.email}.
          </p>
          {saveNote && <p className="muted">{saveNote}</p>}
        </Modal>
      )}
    </div>
  );
}
