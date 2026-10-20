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

const STEPS = ["Area", "Agent", "Date", "Time", "MOU", "Property"];

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
    });
    setSaveNote(
      result.photosDropped ? "Your photos were too large to store in this demo, so the listing was saved without them." : ""
    );
    setFormError("");
    setSuccessOpen(true);
  };

  return (
    <div className="narrow">
      <h1>Selling a Property</h1>
      <StepIndicator steps={STEPS} current={step} />

      {step === 1 && (
        <div className="narrow">
          <div className="card step-card">
            <PinForm
              label="Enter the Area PIN Code"
              buttonLabel="Enter"
              initialValue={pin}
              onChange={() => setNoConsultant(false)}
              onSubmit={handlePin}
            />
            {noConsultant && <p className="notice">No consultant available for this area yet.</p>}
          </div>
        </div>
      )}

      {step === 2 && consultant && (
        <div className="narrow">
          <ConsultantCard consultant={consultant} title="Your area consultant" />
          <div className="actions">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
              Change PIN
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setStep(3)}>
              Proceed
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="narrow">
          <DateStep
            value={date}
            onChange={handleDateChange}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        </div>
      )}

      {step === 4 && (
        <div className="narrow">
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
        </div>
      )}

      {step === 5 && (
        <div className="narrow">
          <section className="card step-card" aria-labelledby="mou-title">
            <h2 id="mou-title">Enter MOU</h2>
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
              {agreed && (
                <button type="button" className="btn btn--primary" onClick={() => setStep(6)}>
                  Next
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {step === 6 && (
        <section className="card step-card" aria-labelledby="details-title">
          <h2 id="details-title">Property Details</h2>
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
          />
          <div className="actions">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(5)}>
              Back
            </button>
          </div>
        </section>
      )}

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
              onClick={() => navigate("/dashboard/functions")}
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
