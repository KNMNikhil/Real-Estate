import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__logo">
            <Logo size={40} />
          </span>
          <div>
            <strong>Living Gods Real Estates</strong>
            <p>A unit of McCoy Engineering Private Limited</p>
          </div>
        </div>
        <nav className="site-footer__links" aria-label="Footer">
          <Link to="/#about">About</Link>
          <Link to="/#services">Services</Link>
          <Link to="/#consultants">Consultants</Link>
          <Link to="/login">Login</Link>
        </nav>
      </div>
      <div className="site-footer__bottom">
        <span>&copy; {new Date().getFullYear()} Living Gods Real Estates. All rights reserved.</span>
        <a href="https://www.livingarts.in" target="_blank" rel="noopener noreferrer">
          www.livingarts.in
        </a>
      </div>
    </footer>
  );
}
