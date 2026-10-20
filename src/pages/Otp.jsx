import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEMO_OTP } from "../data/dummyData";
import OtpInput from "../components/OtpInput";
import AuthLayout from "../components/AuthLayout";
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

  const handleChange = (value) => {
    setOtp(value.replace(/\D/g, "").slice(0, 6));
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
    <AuthLayout>
        <h1>Verify OTP</h1>
        <p className="auth-split__sub">OTP sent to {maskedPhone(pending.contact)}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <p className="field__label otp-label">
              Enter 6-digit OTP
            </p>
            <OtpInput
              value={otp}
              onChange={handleChange}
              invalid={Boolean(error)}
              describedBy={error ? "otp-error" : "otp-demo"}
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
          <button type="submit" className="btn btn--metal btn--block">
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
    </AuthLayout>
  );
}
