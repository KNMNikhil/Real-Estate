import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAdmin } from "../context/AdminContext";
import { DEMO_CODE, DEMO_EMAIL, DEMO_ENABLED, sendAdminCode, verifyAdminCode } from "../lib/admin";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s][^@\s]+$/;

// Step 1: email. Step 2: the one-time code that was emailed. Then the admin dashboard opens.
export default function AdminLogin() {
  const { admin, loginAdmin } = useAdmin();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  const sendCode = async (e) => {
    e?.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) return setError("Please enter a valid email address.");
    setBusy(true);
    setError("");
    setNote("");
    try {
      await sendAdminCode(value);
      setEmail(value);
      setStep(2);
      setNote(`We sent a code to ${value}.`);
    } catch (err) {
      setError(
        err.network
          ? "Could not reach the server. Check your internet connection."
          : "We could not send a code to that email. Only registered admin emails can sign in."
      );
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    const digits = code.replace(/\s/g, "");
    if (!/^\d{6,10}$/.test(digits)) return setError("Please enter the code from your email.");
    setBusy(true);
    setError("");
    try {
      const session = await verifyAdminCode(email, digits);
      loginAdmin(session);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.network ? "Could not reach the server." : "That code is wrong or has expired. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <span className="auth-badge">Admin portal</span>
      <h1>Admin login</h1>
      <p className="auth-split__sub">
        {step === 1 ? "Enter your admin email. We will send you a one-time code." : "Enter the one-time code we emailed you."}
      </p>

      {step === 1 ? (
        <form onSubmit={sendCode} noValidate>
          <div className="field">
            <label htmlFor="admin-email" className="field__label">Admin email</label>
            <input
              id="admin-email"
              className={`input ${error ? "input--error" : ""}`}
              type="email"
              autoComplete="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
            {error && <p className="field__error" role="alert">{error}</p>}
          </div>
          <button type="submit" className="btn btn--metal btn--block" disabled={busy}>
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} noValidate>
          {note && <p className="field__hint" role="status">{note}</p>}
          <div className="field">
            <label htmlFor="admin-code" className="field__label">One-time code</label>
            <input
              id="admin-code"
              className={`input input--code ${error ? "input--error" : ""}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              placeholder="Enter the code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/[^\d\s]/g, ""));
                setError("");
              }}
              autoFocus
            />
            {error && <p className="field__error" role="alert">{error}</p>}
          </div>
          <button type="submit" className="btn btn--metal btn--block" disabled={busy}>
            {busy ? "Verifying…" : "Verify and sign in"}
          </button>
          <p className="auth-split__switch">
            <button type="button" className="link-button" onClick={sendCode} disabled={busy}>Resend code</button>
            {" · "}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setStep(1);
                setCode("");
                setError("");
                setNote("");
              }}
            >
              Change email
            </button>
          </p>
        </form>
      )}

      {DEMO_ENABLED && (
        <div className="demo-box" role="note">
          <strong>Demo (test) login</strong>
          <span>Email: <code>{DEMO_EMAIL}</code></span>
          <span>Code: <code>{DEMO_CODE}</code></span>
          <button type="button" className="link-button" onClick={() => { setEmail(DEMO_EMAIL); setStep(1); setError(""); }}>
            Fill in the demo email
          </button>
        </div>
      )}

      <p className="auth-split__switch">
        <Link to="/">← Back to home</Link>
      </p>
    </AuthLayout>
  );
}
