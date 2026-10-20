import { timeSlots } from "../data/dummyData";
import { getBookedTimes } from "../utils/bookings";
import { formatLongDate, formatTime } from "../utils/dates";

// Slot grid for the chosen date; slots already booked for this consultant are disabled.
export default function TimeStep({ consultantId, date, value, onChange, onNext, onBack }) {
  const booked = getBookedTimes(consultantId, date);

  return (
    <section className="card step-card" aria-labelledby="time-title">
      <h2 id="time-title">Select a Time</h2>
      <p className="selection-note">
        Date: <strong>{formatLongDate(date)}</strong>
      </p>
      <p className="muted">Slots run from 9:00 AM to 6:00 PM, every 30 minutes.</p>

      <div className="slot-grid" role="group" aria-label="Available time slots">
        {timeSlots.map((slot) => {
          const taken = booked.includes(slot);
          const selected = slot === value;
          return (
            <button
              key={slot}
              type="button"
              className={`slot ${selected ? "is-selected" : ""}`}
              disabled={taken}
              aria-pressed={selected}
              onClick={() => onChange(slot)}
            >
              {formatTime(slot)}
              {taken && <span className="slot__tag">Booked</span>}
            </button>
          );
        })}
      </div>

      <div className="actions">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn--primary" disabled={!value} onClick={onNext}>
          Next
        </button>
      </div>
    </section>
  );
}
