import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEMO_OTP } from "../data/dummyData";
import Logo from "../components/Logo";
import { maskedPhone } from "../utils/format";

export default function Otp() {
  const { user, getPending, completeLogin, requestOtp } = useAuth();
  const navigate = useNavigate();
  const [pending] = useState(getPending);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;
  if (!pending) return <Navigate to="/login" replace />;

  const handleChange = (e) => {
    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
    setError("");
    setResent(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    if (otp !== pending.otp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }
    completeLogin(pending);
    navigate("/dashboard", { replace: true });
  };

  const handleResend = () => {
    requestOtp({ name: pending.name, age: pending.age, contact: pending.contact });
    setOtp("");
    setError("");
    setResent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <Link to="/" className="auth-card__brand" aria-label="Back to home">
          <Logo size={52} />
        </Link>
        <h1>Verify OTP</h1>
        <p className="muted">OTP sent to {maskedPhone(pending.contact)}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="otp" className="field__label">
              Enter 6-digit OTP
            </label>
            <input
              id="otp"
              className={`input input--otp ${error ? "input--error" : ""}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={handleChange}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "otp-error" : "otp-demo"}
              autoFocus
            />
            {error && (
              <p id="otp-error" className="field__error" role="alert">
                {error}
              </p>
            )}
            {resent && (
              <p className="field__success" role="status">
                A new OTP has been sent.
              </p>
            )}
          </div>
          <button type="submit" className="btn btn--primary btn--block">
            Verify
          </button>
        </form>

        <p id="otp-demo" className="demo-note">
          Demo OTP: {DEMO_OTP}
        </p>
        <div className="auth-card__links">
          <button type="button" className="link-button" onClick={handleResend}>
            Resend OTP
          </button>
          <Link to="/login">Change details</Link>
        </div>
      </div>
    </div>
  );
}
