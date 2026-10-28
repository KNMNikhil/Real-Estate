import { formatLongDate } from "../utils/dates";

// One customer request as a to-do item: tick it once you have spoken to them.
// readOnly = reminder card (calendar): no tick box, no to-do state.
// viewOnly = admin view: shows the To call / Done state but has no tick box.
export default function AppointmentItem({ item, done = false, onToggle, showDate = false, readOnly = false, viewOnly = false }) {
  const phone = item.customerContact;
  return (
    <li className={`todo ${done ? "is-done" : ""} ${readOnly ? "is-reminder" : ""}`}>
      {!readOnly && !viewOnly && (
        <label className="todo__tick">
          <input type="checkbox" checked={done} onChange={() => onToggle(item.id)} />
          <span className="visually-hidden">Mark {item.customerName} as done</span>
        </label>
      )}
      <div className="todo__body">
        <div className="todo__top">
          <strong className="todo__name">{item.customerName}</strong>
          <span className={`todo__kind todo__kind--${item.kind}`}>{item.kind === "sell" ? "Selling" : "Buying"}</span>
        </div>
        <a className="todo__phone" href={`tel:+91${phone}`}>
          {phone}
        </a>
        {item.customerEmail && (
          <a className="todo__email" href={`mailto:${item.customerEmail}`}>
            {item.customerEmail}
          </a>
        )}
        <span className="todo__meta">
          {item.propertyName ?? "Enquiry"}
          {showDate ? ` · ${formatLongDate(item.date)}` : ""}
        </span>
      </div>
      {!readOnly && <span className="todo__state">{done ? "Done" : "To call"}</span>}
    </li>
  );
}
