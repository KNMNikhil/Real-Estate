import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConsultantCard from "../components/ConsultantCard";
import DateStep from "../components/DateStep";
import Modal from "../components/Modal";
import PinForm from "../components/PinForm";
import PropertyForm from "../components/PropertyForm";
import SlotConfirmModal from "../components/SlotConfirmModal";
import StepIndicator from "../components/StepIndicator";
import TimeStep from "../components/TimeStep";
import { useAuth } from "../context/AuthContext";
import { mouText } from "../data/dummyData";
import { isSlotTaken, saveBooking } from "../utils/bookings";
import { formatLongDate, formatTime } from "../utils/dates";
import { findConsultantByPin, saveSubmittedProperty } from "../utils/lookup";
import useScrollTop from "../utils/useScrollTop";

const STEPS = ["Area", "Agent", "Date", "Time", "Agreement", "Property"];

export default function SellFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
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
      setStep(2);
    }
  };

  const handleDateChange = (value) => {
    setDate(value);
    setTime("");
  };

  const handleConfirmSlot = () => {
    setConfirmOpen(false);
    setStep(5);
  };

  const handleSubmit = (values, media) => {
    // Another booking may have taken the slot while the form was open.
    if (isSlotTaken(consultant.id, date, time)) {
      setFormError("That time slot was just taken. Please choose another time.");
      setTime("");
      setStep(4);
      return;
    }
    setSubmitting(true);

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
      owner: { name: values.ownerName.trim(), contact: values.ownerContact.trim() },
    };

    const result = saveSubmittedProperty(property);
    if (!result.ok) {
      setSubmitting(false);
      setFormError("Could not save the property (browser storage is full). Try removing some photos.");
      return;
    }
    saveBooking({
      consultantId: consultant.id,
      date,
      time,
      kind: "sell",
      propertyId: property.id,
      userContact: user.contact,
      userName: user.name,
    });
    setSaveNote(
      result.photosDropped ? "Your photos were too large to store in this demo, so the listing was saved without them." : ""
    );
    setFormError("");
    setSuccessOpen(true);
  };

  const TIPS = {
    1: ["Why your PIN?", ["Each area has its own dedicated agent.", "Your agent knows local prices and buyers.", "Enter the PIN where the property is located, not where you live."]],
    2: ["What your agent does", ["Visits and verifies your property.", "Helps you set a fair price.", "Handles buyer visits and paperwork with you."]],
    3: ["Choosing a date", ["Bookings open from tomorrow.", "Pick a day when you or a representative can be at the property.", "You can pick a later month with the arrows."]],
    4: ["Choosing a time", ["Slots are 30 minutes apart.", "Greyed-out slots are already booked.", "Morning slots usually have the best light for photos."]],
    5: ["About the agreement", ["It sets out how we list and promote your property.", "Read it fully before you accept.", "Your agent can explain any clause."]],
    6: ["Tips for a great listing", ["Add clear, well-lit photos of every room.", "Use the real built-up area and expected price.", "A detailed description gets more visits."]],
  };
  const [tipTitle, tipList] = TIPS[step];
  const DOCS = ["Sale deed or title document", "Encumbrance certificate", "Latest property tax receipt", "Your photo ID"];

  const SAMPLE_PINS = ["600089", "600001", "600020", "600041"];

  return (
    <div className="sell">
      <header className="sell__head">
        <h1>Sell your property</h1>
        <p className="muted">Meet your area agent, sign the agreement and list your property in a few easy steps.</p>
      </header>
      <StepIndicator steps={STEPS} current={step} />

      <div className="sell__layout">
        <div className="sell__main">
          {step === 1 && (
            <section className="card step-card sell-card">
              <span className="sell-card__icon" aria-hidden="true">⌖</span>
              <h2>Where is your property?</h2>
              <p className="muted">We will connect you with the agent who covers that area.</p>
              <PinForm
                label="Area PIN code"
                buttonLabel="Find agent"
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
            </section>
          )}

          {step === 2 && consultant && (
            <>
              <ConsultantCard consultant={consultant} title="Your area agent" />
              <div className="actions">
                <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
                  Change PIN
                </button>
                <button type="button" className="btn btn--primary" onClick={() => setStep(3)}>
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <DateStep value={date} onChange={handleDateChange} onBack={() => setStep(2)} onNext={() => setStep(4)} />
          )}

          {step === 4 && (
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
                onBack={() => setStep(3)}
                onNext={() => setConfirmOpen(true)}
              />
            </>
          )}

          {step === 5 && (
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
                <button type="button" className="btn btn--ghost" onClick={() => setStep(4)}>
                  Back
                </button>
                <button type="button" className="btn btn--primary" disabled={!agreed} onClick={() => setStep(6)}>
                  Continue
                </button>
              </div>
            </section>
          )}

          {step === 6 && (
            <section aria-labelledby="details-title">
              <h2 id="details-title" className="sell__section-title">Property details</h2>
              {formError && (
                <p className="notice notice--error" role="alert">
                  {formError}
                </p>
              )}
              <PropertyForm
                initial={{
                  pincode: pin,
                  area: consultant.areaName,
                  ownerName: user.name,
                  ownerContact: user.contact,
                }}
                pinLocked
                submitting={submitting}
                onSubmit={handleSubmit}
                onBack={() => setStep(5)}
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

          {step >= 3 && (
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
          onConfirm={handleConfirmSlot}
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
              onClick={() => navigate(`/dashboard/marketplace?pin=${pin}`)}
            >
              Okay
            </button>
          }
        >
          <p>
            You have booked a meeting with <strong>{consultant.name}</strong> on{" "}
            <strong>{formatLongDate(date)}</strong> at <strong>{formatTime(time)}</strong>.
          </p>
          {saveNote && <p className="muted">{saveNote}</p>}
        </Modal>
      )}
    </div>
  );
}
