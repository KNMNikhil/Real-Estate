import { Link } from "react-router-dom";
import { CONTACT } from "../data/contact";
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
            <p>A Unit of McCoy Engineering Private Limited</p>
          </div>
        </div>
        <nav className="site-footer__links" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/about">About us</Link>
          <Link to="/buy">Buy</Link>
          <Link to="/sell">Sell</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/consultant/login">Consultant login</Link>
          <Link to="/admin/login">Admin Login</Link>
        </nav>
      </div>
      <ul className="site-footer__contact" id="contact" aria-label="Contact information">
        <li>
          <span>Phone</span>
          <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a>
        </li>
        <li>
          <span>Email</span>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </li>
        <li>
          <span>Office</span>
          <address>
            <a href={CONTACT.mapUrl} target="_blank" rel="noopener noreferrer" title="Open in Google Maps">
              {CONTACT.address}
            </a>
          </address>
        </li>
        <li>
          <span>Website</span>
          <a href={`https://${CONTACT.site}`} target="_blank" rel="noopener noreferrer">{CONTACT.site}</a>
        </li>
      </ul>
      <div className="site-footer__bottom">
        <span>&copy; {new Date().getFullYear()} Living Gods Real Estates. All rights reserved.</span>
      </div>
    </footer>
  );
}
