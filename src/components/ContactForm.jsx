import { useState } from "react";
import { validateContact, validateEmail, validateName } from "../utils/validators";

// Collects the customer's name, email and phone (there are no customer accounts).
export default function ContactForm({ initial, onSubmit, onBack, submitLabel = "Continue" }) {
  const [values, setValues] = useState({ name: "", email: "", phone: "", ...initial });
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: validateName(values.name),
    email: validateEmail(values.email),
    phone: validateContact(values.phone),
  };
  const shown = submitted ? errors : {};
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const handle = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    onSubmit({ name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() });
  };

  const field = (k, label, props) => (
    <div className="field">
      <label htmlFor={`cf-${k}`} className="field__label">{label}</label>
      <input
        id={`cf-${k}`}
        className={`input ${shown[k] ? "input--error" : ""}`}
        value={values[k]}
        onChange={set(k)}
        aria-invalid={shown[k] ? "true" : "false"}
        {...props}
      />
      {shown[k] && <p className="field__error" role="alert">{shown[k]}</p>}
    </div>
  );

  return (
    <form className="contact-form" onSubmit={handle} noValidate>
      {field("name", "Full name", { type: "text", autoComplete: "name", placeholder: "Enter your full name" })}
      {field("email", "Email address", { type: "email", autoComplete: "email", placeholder: "you@gmail.com" })}
      {field("phone", "Phone number", {
        type: "tel",
        inputMode: "numeric",
        maxLength: 10,
        autoComplete: "tel-national",
        placeholder: "10-digit mobile number",
      })}
      <div className="actions">
        {onBack ? (
          <button type="button" className="btn btn--ghost" onClick={onBack}>Back</button>
        ) : (
          <span />
        )}
        <button type="submit" className="btn btn--primary">{submitLabel}</button>
      </div>
    </form>
  );
}
