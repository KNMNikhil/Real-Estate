import { Link } from "react-router-dom";
import Logo from "./Logo";

// Split-screen shell shared by the sign up, login and OTP pages.
export default function AuthLayout({ children }) {
  return (
    <div className="auth-split">
      <div className="auth-split__image">
        <img src="/signup.jpg" alt="Modern apartment buildings" />
      </div>
      <div className="auth-split__panel">
        <Link to="/" className="auth-split__brand" aria-label="Back to home">
          <Logo size={30} />
          <span>Living Gods</span>
        </Link>
        <div className="auth-split__form">{children}</div>
      </div>
    </div>
  );
}
