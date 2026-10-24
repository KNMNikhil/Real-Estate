import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConsultantCard from "../components/ConsultantCard";
import ContactForm from "../components/ContactForm";
import DateStep from "../components/DateStep";
import Modal from "../components/Modal";
import PinForm from "../components/PinForm";
import StepIndicator from "../components/StepIndicator";
import { mouText } from "../data/dummyData";
import { bookAppointment, fetchBookedTimes } from "../lib/api";
import { toISODate, tomorrowISO } from "../utils/dates";
import { findConsultantByPin } from "../utils/lookup";
import useScrollTop from "../utils/useScrollTop";

const STEPS = ["Your details", "Area", "Consultant", "Date", "Agreement"];
const SAMPLE_PINS = ["600089", "600001", "600020", "600041"];

const COPY = {
  sell: {
    eyebrow: "Sell a property",
    title: "List your property with us",
    intro: "No account needed. Meet your area consultant, choose a date and accept the agreement in a few easy steps.",
    pinTitle: "Where is your property?",
    pinHelp: "We will connect you with the consultant who covers that area.",
    consultantTitle: "Your area consultant",
    aside: {
      1: ["Why we ask", ["No account is needed.", "Your consultant uses these details to reach you.", "We never share them outside Living Gods."]],
      2: ["Why your PIN?", ["Each area has its own dedicated consultant.", "Your consultant knows local prices and buyers.", "Enter the PIN where the property is located."]],
      3: ["What your consultant does", ["Visits and verifies your property.", "Helps you set a fair price.", "Handles buyer visits and paperwork with you."]],
      4: ["Choosing a date", ["Bookings open from tomorrow.", "Pick a day when you or a representative can be at the property.", "Use the arrows to see later months."]],
      5: ["About the agreement", ["It sets out how we list and promote your property.", "Read it fully before you accept.", "Your consultant can explain any clause."]],
    },
  },
  buy: {
    eyebrow: "Buy a property",
    title: "Find your next property with us",
    intro: "No account needed. Meet your area consultant, choose a date and accept the agreement in a few easy steps.",
    pinTitle: "Which area are you looking in?",
    pinHelp: "We will connect you with the consultant who covers that area.",
    consultantTitle: "Your area consultant",
    aside: {
      1: ["Why we ask", ["No account is needed.", "Your consultant uses these details to reach you.", "We never share them outside Living Gods."]],
      2: ["Why your PIN?", ["Each area has its own dedicated consultant.", "Your consultant knows the properties on offer locally.", "Enter the PIN of the area you want to buy in."]],
      3: ["What your consultant does", ["Shows you the properties that match your needs.", "Arranges visits and answers your questions.", "Guides you through paperwork and registration."]],
      4: ["Choosing a date", ["Bookings open from tomorrow.", "Pick the day you would like to be contacted.", "Use the arrows to see later months."]],
      5: ["About the agreement", ["It sets out how we work with you as a buyer.", "Read it fully before you accept.", "Your consultant can explain any clause."]],
    },
  },
};

// Same steps for buying and selling: details, PIN, consultant, date, agreement.
// No time slot is chosen; the consultant contacts the customer after the agreement.
export default function ContactFlow({ kind }) {
  const copy = COPY[kind];
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [contact, setContact] = useState(null);
  const [pin, setPin] = useState("");
  const [consultant, setConsultant] = useState(null);
  const [noConsultant, setNoConsultant] = useState(false);
  const [date, setDate] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [doneOpen, setDoneOpen] = useState(false);

  useScrollTop(step);

  // Dates already booked with this consultant (for buying or selling), crossed out in the calendar.
  const [blocked, setBlocked] = useState(() => new Set());
  const loaded = useRef(new Set());
  const loadBlocked = useCallback(
    async ({ y, m }) => {
      if (!consultant) return;
      const key = `${consultant.id}-${y}-${m}`;
      if (loaded.current.has(key)) return;
      loaded.current.add(key);
      const from = tomorrowISO();
      const days = new Date(y, m + 1, 0).getDate();
      const dates = Array.from({ length: days }, (_, i) => toISODate(new Date(y, m, i + 1))).filter((d) => d >= from);
      const results = await Promise.all(
        dates.map((d) =>
          fetchBookedTimes(consultant.id, d).then(
            (times) => (times.length > 0 ? d : null),
            () => null
          )
        )
      );
      setBlocked((prev) => new Set([...prev, ...results.filter(Boolean)]));
    },
    [consultant]
  );

  const handlePin = (value) => {
    const found = findConsultantByPin(value);
    setNoConsultant(!found);
    if (found) {
      setPin(value);
      setConsultant(found);
      setStep(3);
    }
  };

  const handleAgree = async () => {
    setSubmitting(true);
    setError("");
    try {
      // Another customer may have taken this day while the form was open.
      const taken = await fetchBookedTimes(consultant.id, date).catch(() => []);
      if (taken.length > 0) {
        setBlocked((prev) => new Set([...prev, date]));
        setDate("");
        setStep(4);
        setError("Sorry, that date was just booked. Please pick another date.");
        return;
      }
      // The booking record needs a unique "time" value; with no slot chosen we send a placeholder.
      await bookAppointment({
        consultantId: consultant.id,
        kind,
        date,
        time: `TBA-${Math.random().toString(36).slice(2, 8)}`,
        propertyName: `Enquiry in ${consultant.areaName} (${pin})`,
        contact,
      });
      setDoneOpen(true);
    } catch (e) {
      setError(e.message || "Could not save your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const [tipTitle, tipList] = copy.aside[step];

  return (
    <div className="sell site-main">
      <header className="sell__head">
        <span className="lp-eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p className="muted">{copy.intro}</p>
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
              <h2>{copy.pinTitle}</h2>
              <p className="muted">{copy.pinHelp}</p>
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
              <ConsultantCard consultant={consultant} title={copy.consultantTitle} />
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
            <>
              {error && (
                <p className="notice notice--error" role="alert">
                  {error}
                </p>
              )}
              <DateStep
                value={date}
                onChange={(d) => {
                  setDate(d);
                  setError("");
                }}
                onBack={() => setStep(3)}
                onNext={() => setStep(5)}
                blocked={blocked}
                onMonthChange={loadBlocked}
              />
            </>
          )}

          {step === 5 && (
            <section className="card step-card" aria-labelledby="mou-title">
              <h2 id="mou-title">Agreement (MOU)</h2>
              <p className="muted">Please read the terms before continuing.</p>
              <div className="mou-box" tabIndex={0} role="region" aria-label="MOU terms">
                {mouText}
              </div>
              <label className="checkbox">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>I agree to the terms and conditions.</span>
              </label>
              {error && (
                <p className="notice notice--error" role="alert">
                  {error}
                </p>
              )}
              <div className="actions">
                <button type="button" className="btn btn--ghost" onClick={() => setStep(4)}>
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={!agreed || submitting}
                  onClick={handleAgree}
                >
                  {submitting ? "Submitting…" : "Continue"}
                </button>
              </div>
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

      {doneOpen && (
        <Modal
          title="Thank you"
          actions={
            <button type="button" className="btn btn--primary" autoFocus onClick={() => navigate("/")}>
              Okay
            </button>
          }
        >
          <p>
            Thank you, <strong>{contact.name}</strong>. Your consultant, <strong>{consultant.name}</strong>, will
            contact you shortly.
          </p>
        </Modal>
      )}
    </div>
  );
}
