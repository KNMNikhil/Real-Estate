import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { demoUser } from "../data/dummyData";
import { validateAge, validateContact, validateName } from "../utils/validators";

export default function Login({ mode: initialMode = "signup" }) {
  const [mode, setMode] = useState(initialMode);
  const isSignup = mode === "signup";
  const { user, requestOtp, findAccount } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", age: "", contact: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => setMode(initialMode), [initialMode]);

  if (user) return <Navigate to="/dashboard" replace />;

  // Switch tabs in place (no route change) so the layout can animate smoothly.
  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    setErrors({});
    window.history.replaceState(null, "", next === "signup" ? "/signup" : "/login");
  };

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      const next = {
        name: validateName(form.name),
        age: validateAge(form.age),
        contact: validateContact(form.contact),
      };
      setErrors(next);
      if (Object.values(next).some(Boolean)) return;
      requestOtp({ name: form.name.trim(), age: Number(form.age), contact: form.contact.trim() });
      navigate("/otp");
      return;
    }
    const contactError = validateContact(form.contact);
    if (contactError) {
      setErrors({ contact: contactError });
      return;
    }
    const account = findAccount(form.contact.trim());
    if (!account) {
      setErrors({ contact: "No account found for this number. Please sign up first." });
      return;
    }
    requestOtp(account);
    navigate("/otp");
  };

  const field = (key, label, inputProps) => (
    <div className="field">
      <label htmlFor={`auth-${key}`} className="field__label">
        {label}
      </label>
      <input
        id={`auth-${key}`}
        className={`input ${errors[key] ? "input--error" : ""}`}
        value={form[key]}
        onChange={set(key)}
        aria-invalid={errors[key] ? "true" : "false"}
        aria-describedby={errors[key] ? `auth-${key}-error` : undefined}
        {...inputProps}
      />
      {errors[key] && (
        <p id={`auth-${key}-error`} className="field__error" role="alert">
          {errors[key]}
        </p>
      )}
    </div>
  );

  const contactField = field("contact", "Contact number", {
    type: "tel",
    inputMode: "numeric",
    maxLength: 10,
    autoComplete: "tel-national",
    placeholder: "Enter your 10-digit mobile number",
  });

  return (
    <AuthLayout>
      <div className="auth-tabs" role="tablist" aria-label="Account">
        <span className={`auth-tabs__thumb ${isSignup ? "is-right" : ""}`} aria-hidden="true" />
        <button type="button" role="tab" aria-selected={!isSignup} className={`auth-tabs__tab ${!isSignup ? "is-active" : ""}`} onClick={() => switchMode("login")}>
          Login
        </button>
        <button type="button" role="tab" aria-selected={isSignup} className={`auth-tabs__tab ${isSignup ? "is-active" : ""}`} onClick={() => switchMode("signup")}>
          Sign Up
        </button>
      </div>

      <h1 key={`h-${mode}`} className="auth-fade">
        {isSignup ? "Create an account" : "Welcome back"}
      </h1>
      <p key={`s-${mode}`} className="auth-split__sub auth-fade">
        {isSignup
          ? "Please enter your details to create an account."
          : "Enter your contact number to receive an OTP."}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={`auth-collapse ${isSignup ? "is-open" : ""}`} inert={isSignup ? undefined : ""}>
          <div className="auth-collapse__inner">
            {field("name", "Name", { type: "text", autoComplete: "name", placeholder: "Enter your name", tabIndex: isSignup ? 0 : -1 })}
            {field("age", "Age", { type: "number", inputMode: "numeric", min: 18, max: 100, placeholder: "Enter your age", tabIndex: isSignup ? 0 : -1 })}
          </div>
        </div>
        {contactField}
        <button type="submit" className="btn btn--metal btn--block">
          {isSignup ? "Create an account" : "Send OTP"}
        </button>
      </form>

      <div className={`auth-collapse ${isSignup ? "is-open" : ""}`} inert={isSignup ? undefined : ""}>
        <div className="auth-collapse__inner">
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

      <p key={`w-${mode}`} className="auth-split__switch auth-fade">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <button type="button" className="link-button" onClick={() => switchMode(isSignup ? "login" : "signup")}>
          {isSignup ? "Sign in" : "Sign up"}
        </button>
      </p>
    </AuthLayout>
  );
}
