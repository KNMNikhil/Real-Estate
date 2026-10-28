import { useEffect, useState } from "react";
import {
  formatLongDate,
  formatMonthYear,
  getMonthMatrix,
  isBookableDate,
  todayISO,
} from "../utils/dates";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// "Book your slot" - month calendar with month navigation. Today and the past are disabled.
const NONE = new Set();

// blocked: Set of ISO dates already booked with this consultant (shown crossed out).
// onMonthChange({ y, m }) lets the parent load blocked dates for the visible month.
export default function DateStep({ value, onChange, onNext, onBack, blocked = NONE, onMonthChange, submitting = false }) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const today = todayISO();
  const weeks = getMonthMatrix(view.y, view.m);
  const isCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth();

  useEffect(() => {
    onMonthChange?.(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.y, view.m]);

  const atCurrentMonth = isCurrentMonth;
  const shiftMonth = (delta) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <section className="card step-card" aria-labelledby="book-slot-title">
      <h2 id="book-slot-title">Book Your Slot</h2>
      <p className="muted">Choose a date. Bookings open from tomorrow onward; use the arrows to see later months.</p>

      <div className="calendar">
        <div className="calendar__head">
          <button
            type="button"
            className="calendar__arrow"
            aria-label="Previous month"
            disabled={atCurrentMonth}
            onClick={() => shiftMonth(-1)}
          >
            ‹
          </button>
          <strong aria-live="polite">{formatMonthYear(view.y, view.m)}</strong>
          <button
            type="button"
            className="calendar__arrow"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
          >
            ›
          </button>
        </div>
        <div className="calendar__grid" role="grid" aria-label={formatMonthYear(view.y, view.m)}>
          {WEEKDAYS.map((d) => (
            <div key={d} className="calendar__weekday" role="columnheader">
              {d}
            </div>
          ))}
          {weeks.flat().map((iso, i) => {
            if (!iso) return <div key={`blank-${i}`} className="calendar__blank" />;
            const booked = blocked.has(iso);
            const disabled = !isBookableDate(iso) || booked;
            const selected = iso === value;
            return (
              <button
                key={iso}
                type="button"
                className={`calendar__day ${selected ? "is-selected" : ""} ${
                  iso === today ? "is-today" : ""
                } ${booked ? "is-booked" : ""}`}
                disabled={disabled}
                aria-pressed={selected}
                aria-label={booked ? `${formatLongDate(iso)}, already booked` : formatLongDate(iso)}
                title={booked ? "Already booked. Please pick another date." : undefined}
                onClick={() => onChange(iso)}
              >
                {Number(iso.slice(8))}
              </button>
            );
          })}
        </div>
      </div>

      <p className="muted calendar__legend">Crossed-out dates are not available. Dates already booked with your consultant are shown in red.</p>

      {value && (
        <p className="selection-note">
          Selected: <strong>{formatLongDate(value)}</strong>
        </p>
      )}

      <div className="actions">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn--primary" disabled={!value || submitting} onClick={onNext}>
          {submitting ? "Confirming…" : "Confirm date"}
        </button>
      </div>
    </section>
  );
}
