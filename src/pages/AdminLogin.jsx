import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Icon from "../components/Icon";
import { useAdmin } from "../context/AdminContext";
import { adminLogin } from "../lib/admin";
import { validateEmail } from "../utils/validators";

// Admin sign in: the admin email and password.
export default function AdminLogin() {
  const { admin, loginAdmin } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);
    if (!password) return setError("Please enter your password.");
    setBusy(true);
    setError("");
    try {
      const session = await adminLogin(email, password);
      if (!session) {
        setError("Wrong email or password.");
        return;
      }
      loginAdmin(session);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.network
          ? "Could not reach the server. Check your internet connection."
          : err.unavailable
            ? "Admin sign-in is not set up yet. Run supabase/admin_password_login.sql in the Supabase SQL editor."
            : "Could not sign in. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <span className="auth-badge">Admin portal</span>
      <h1>Admin login</h1>
      <p className="auth-split__sub">Sign in with your admin email and password.</p>

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="admin-email" className="field__label">Admin email</label>
          <input
            id="admin-email"
            className={`input ${error ? "input--error" : ""}`}
            type="email"
            autoComplete="username"
            placeholder="Enter your admin email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="admin-password" className="field__label">Password</label>
          <div className="pw-field">
            <input
              id="admin-password"
              className={`input ${error ? "input--error" : ""}`}
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
            <button
              type="button"
              className="pw-field__toggle"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              aria-pressed={showPw}
            >
              <Icon name={showPw ? "eyeOff" : "eye"} size={20} />
            </button>
          </div>
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
