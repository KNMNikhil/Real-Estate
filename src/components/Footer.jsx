import { Link } from "react-router-dom";
import Logo from "./Logo";

// TODO: replace with the real contact details.
const CONTACT = {
  phone: "+91 98765 43210",
  email: "livinggodsrealestates@gmail.com",
  address: "Living Gods Real Estates, Chennai, Tamil Nadu, India",
  site: "www.livinggods.in",
};

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
      <ul className="site-footer__contact" aria-label="Contact information">
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
          <address>{CONTACT.address}</address>
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
