import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { agentLogin } from "../lib/api";
import { validateContact } from "../utils/validators";

export default function AgentLogin() {
  const { agent, loginAgent } = useAuth();
  const navigate = useNavigate();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (agent) return <Navigate to="/agent" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const err = validateContact(contact);
    if (err) return setError(err);
    if (!password) return setError("Please enter your password.");
    setBusy(true);
    setError("");
    try {
      const session = await agentLogin(contact.trim(), password);
      if (!session) {
        setError("Wrong contact number or password.");
        return;
      }
      loginAgent(session);
      navigate("/agent", { replace: true });
    } catch (e2) {
      setError(
        e2.unavailable
          ? "The database is not set up yet. Run supabase/schema.sql in the Supabase SQL editor."
          : "Could not sign in. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <span className="auth-badge">Agent portal</span>
      <h1>Agent login</h1>
      <p className="auth-split__sub">Sign in with your registered contact number and password.</p>

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="agent-contact" className="field__label">Contact number</label>
          <input
            id="agent-contact"
            className={`input ${error ? "input--error" : ""}`}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="username"
            placeholder="Enter your 10-digit mobile number"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              setError("");
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="agent-password" className="field__label">Password</label>
          <input
            id="agent-password"
            className={`input ${error ? "input--error" : ""}`}
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
          {error && <p className="field__error" role="alert">{error}</p>}
        </div>
        <button type="submit" className="btn btn--metal btn--block" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="auth-split__switch">
        <Link to="/">← Back to home</Link>
      </p>
    </AuthLayout>
  );
}
