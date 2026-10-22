import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Logo from "./Logo";

// Shared shell for every public page: glass navbar on top, footer at the bottom.
export default function PublicLayout() {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="landing site-page">
      <nav className="landing__nav" aria-label="Main">
        <Link className="landing__brand" to="/" aria-label="Living Gods Real Estates home">
          <Logo size={30} />
          <span className="landing__brand-name">Living Gods</span>
        </Link>
        <ul className="landing__links">
          <li><Link to="/#about">About</Link></li>
          <li><Link to="/#featured">Properties</Link></li>
          <li><Link to="/#services">Services</Link></li>
          <li><Link to="/#consultants">Consultants</Link></li>
          <li><Link to="/#faq">FAQ</Link></li>
        </ul>
        <div className="landing__actions">
          <button type="button" className="btn btn--gold btn--pill" onClick={() => navigate("/marketplace")}>
            Marketplace
          </button>
        </div>
      </nav>
      <Outlet />
      <Footer />
    </div>
  );
}
