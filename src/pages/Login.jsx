import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { demoUser } from "../data/dummyData";
import Logo from "../components/Logo";
import { validateAge, validateContact, validateName } from "../utils/validators";

export default function Login() {
  const { user, requestOtp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", age: "", contact: "" });
  const [errors, setErrors] = useState({});

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {
      name: validateName(form.name),
      age: validateAge(form.age),
      contact: validateContact(form.contact),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    requestOtp({ name: form.name.trim(), age: Number(form.age), contact: form.contact.trim() });
    navigate("/otp");
  };

  const field = (key, label, inputProps) => (
    <div className="field">
      <label htmlFor={`login-${key}`} className="field__label">
        {label}
      </label>
      <input
        id={`login-${key}`}
        className={`input ${errors[key] ? "input--error" : ""}`}
        value={form[key]}
        onChange={set(key)}
        aria-invalid={errors[key] ? "true" : "false"}
        aria-describedby={errors[key] ? `login-${key}-error` : undefined}
        {...inputProps}
      />
      {errors[key] && (
        <p id={`login-${key}-error`} className="field__error" role="alert">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <Link to="/" className="auth-card__brand" aria-label="Back to home">
          <Logo size={52} />
        </Link>
        <h1>Welcome</h1>
        <p className="muted">Tell us a little about yourself to get started.</p>

        <form onSubmit={handleSubmit} noValidate>
          {field("name", "Name", { type: "text", autoComplete: "name" })}
          {field("age", "Age", { type: "number", inputMode: "numeric", min: 18, max: 100 })}
          {field("contact", "Contact Number", {
            type: "tel",
            inputMode: "numeric",
            maxLength: 10,
            autoComplete: "tel-national",
            placeholder: "10-digit mobile number",
          })}
          <button type="submit" className="btn btn--primary btn--block">
            Confirm
          </button>
        </form>

        <button
          type="button"
          className="link-button auth-card__demo"
          onClick={() =>
            setForm({ name: demoUser.name, age: String(demoUser.age), contact: demoUser.contact })
          }
        >
          Fill demo details
        </button>
      </div>
    </div>
  );
}
