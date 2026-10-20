import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import OtpInput from "../components/OtpInput";
import { useAuth } from "../context/AuthContext";
import { DEMO_OTP, consultants } from "../data/dummyData";
import { validateContact } from "../utils/validators";

export default function AgentLogin() {
  const { agent, loginAgent } = useAuth();
  const navigate = useNavigate();
  const [contact, setContact] = useState("");
  const [match, setMatch] = useState(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  if (agent) return <Navigate to="/agent" replace />;

  const sendOtp = (e) => {
    e.preventDefault();
    const err = validateContact(contact);
    if (err) return setError(err);
    const found = consultants.find((c) => c.contact === contact.trim());
    if (!found) return setError("This number is not registered as an agent.");
    setError("");
    setMatch(found);
  };

  const verify = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Please enter the 6-digit OTP.");
    if (otp !== DEMO_OTP) return setError("Incorrect OTP. Please try again.");
    loginAgent(match);
    navigate("/agent", { replace: true });
  };

  return (
    <AuthLayout>
      <span className="auth-badge">Agent portal</span>
      <h1>{match ? "Verify OTP" : "Agent login"}</h1>
      <p className="auth-split__sub">
        {match ? `OTP sent to +91 XXXXX X${match.contact.slice(-4)}` : "Sign in with your registered contact number."}
      </p>

      {!match ? (
        <form onSubmit={sendOtp} noValidate>
          <div className="field">
            <label htmlFor="agent-contact" className="field__label">Contact number</label>
            <input
              id="agent-contact"
              className={`input ${error ? "input--error" : ""}`}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter your 10-digit mobile number"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                setError("");
              }}
            />
            {error && <p className="field__error" role="alert">{error}</p>}
          </div>
          <button type="submit" className="btn btn--metal btn--block">Send OTP</button>
          <button type="button" className="link-button auth-card__demo" onClick={() => setContact(consultants[0].contact)}>
            Fill demo agent ({consultants[0].name})
          </button>
        </form>
      ) : (
        <form onSubmit={verify} noValidate>
          <div className="field">
            <p className="field__label otp-label">Enter 6-digit OTP</p>
            <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} invalid={Boolean(error)} />
            {error && <p className="field__error" role="alert">{error}</p>}
          </div>
          <button type="submit" className="btn btn--metal btn--block">Verify</button>
          <p className="demo-note">Demo OTP: {DEMO_OTP}</p>
          <button type="button" className="link-button" onClick={() => { setMatch(null); setOtp(""); setError(""); }}>
            Change number
          </button>
        </form>
      )}

      <p className="auth-split__switch">
        Not an agent? <Link to="/login">Customer login</Link>
      </p>
    </AuthLayout>
  );
}
