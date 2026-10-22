import { useState } from "react";
import Icon from "../components/Icon";
import { CONTACT } from "../data/contact";
import { KEYS, readJSON, writeJSON } from "../utils/storage";
import { validateContact, validateEmail, validateName } from "../utils/validators";

const MAX = 150;

export default function Contact() {
  const [v, setV] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  const errors = {
    name: validateName(v.name),
    email: validateEmail(v.email),
    phone: validateContact(v.phone),
  };
  const shown = submitted ? errors : {};
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    // No backend yet: keep the message in this browser so it is not lost.
    const all = readJSON(KEYS.messages, []);
    writeJSON(KEYS.messages, [{ ...v, id: `M${Date.now()}`, createdAt: new Date().toISOString() }, ...all]);
    setSent(true);
  };

  const field = (k, label, props) => (
    <div className="field">
      <label htmlFor={`ct-${k}`} className="field__label">
        {label} <span className="req">*</span>
      </label>
      <input
        id={`ct-${k}`}
        className={`input ${shown[k] ? "input--error" : ""}`}
        value={v[k]}
        onChange={set(k)}
        aria-invalid={shown[k] ? "true" : "false"}
        {...props}
      />
      {shown[k] && <p className="field__error" role="alert">{shown[k]}</p>}
    </div>
  );

  const rows = [
    { icon: "contactMap", label: "Office address", lines: [CONTACT.address] },
    { icon: "contactPhone", label: "Contact number", lines: [CONTACT.phone], href: `tel:${CONTACT.phone.replace(/\s/g, "")}`, big: true },
    { icon: "contactMail", label: "Email us", lines: [CONTACT.email], href: `mailto:${CONTACT.email}` },
  ];

  return (
    <main className="contact">
      <section className="contact__info">
        <span className="lp-eyebrow">Contact us</span>
        <h1>Get in touch with us today</h1>
        <p>
          For honest guidance on buying, selling or managing property, talk to our team. Your area agent will
          get back to you personally.
        </p>
        <p>
          We help with apartments, villas, independent houses, plots and commercial properties. Tell us what you
          need and we will take it from there.
        </p>

        <ul className="contact__rows">
          {rows.map((r) => (
            <li key={r.label}>
              <span className="contact__icon" aria-hidden="true">
                <Icon name={r.icon} size={28} />
              </span>
              <span className="contact__divider" aria-hidden="true" />
              <div>
                <span className="contact__label">{r.label}</span>
                {r.lines.map((l) =>
                  r.href ? (
                    <a key={l} href={r.href} className={`contact__value ${r.big ? "is-big" : ""}`}>{l}</a>
                  ) : (
                    <span key={l} className="contact__value">{l}</span>
                  )
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="contact__card" aria-labelledby="contact-form-title">
        <div className="contact__card-head">
          <div>
            <h2 id="contact-form-title">Contact us</h2>
            <p className="muted">We will respond as soon as we receive your message.</p>
          </div>
          <span className="contact__chat" aria-hidden="true">
            <Icon name="contactChat" size={38} />
          </span>
        </div>

        {sent ? (
          <div className="contact__thanks" role="status">
            <span aria-hidden="true">✓</span>
            <h3>Thank you, {v.name.split(" ")[0]}!</h3>
            <p>We have your message and will reach you on {v.phone} soon.</p>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                setV({ name: "", email: "", phone: "", message: "" });
                setSubmitted(false);
                setSent(false);
              }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {field("name", "Name", { type: "text", autoComplete: "name", placeholder: "Enter your name" })}
            {field("email", "Email", { type: "email", autoComplete: "email", placeholder: "Enter your email" })}
            {field("phone", "WhatsApp number", {
              type: "tel",
              inputMode: "numeric",
              maxLength: 10,
              placeholder: "Enter your WhatsApp number",
            })}
            <div className="field">
              <label htmlFor="ct-message" className="field__label">Comment or message</label>
              <textarea
                id="ct-message"
                className="input"
                rows={4}
                maxLength={MAX}
                placeholder="Your message"
                value={v.message}
                onChange={set("message")}
              />
              <p className="field__hint">{v.message.length} of {MAX} max characters.</p>
            </div>
            <button type="submit" className="btn btn--gold btn--block contact__submit">Submit</button>
          </form>
        )}
      </section>
    </main>
  );
}
