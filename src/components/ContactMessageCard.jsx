import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { sendContactMessage } from "../lib/api";
import { KEYS, readJSON, writeJSON } from "../utils/storage";
import { cleanPhone, validateContact, validateEmail, validateName } from "../utils/validators";

const MAX = 150;

export default function ContactMessageCard() {
  const [v, setV] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState("");

  const errors = {
    name: validateName(v.name),
    email: validateEmail(v.email),
    phone: validateContact(v.phone),
  };
  const shown = submitted ? errors : {};
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: k === "phone" ? cleanPhone(e.target.value) : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFailed("");
    if (Object.values(errors).some(Boolean)) return;
    setSending(true);
    try {
      const res = await sendContactMessage(v);
      if (res.stored === "browser") {
        // Database not available: keep the message in this browser so it is not lost.
        const all = readJSON(KEYS.messages, []);
        writeJSON(KEYS.messages, [{ ...v, id: `M${Date.now()}`, createdAt: new Date().toISOString() }, ...all]);
      }
      setSent(true);
    } catch (err) {
      setFailed("We could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
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

  return (
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
            <p className="consent">
              By submitting you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
            </p>
            {failed && <p className="field__error" role="alert">{failed}</p>}
            <button type="submit" className="btn btn--gold btn--block contact__submit" disabled={sending}>
              {sending ? "Sending…" : "Submit"}
            </button>
          </form>
        )}
    </section>
  );
}
