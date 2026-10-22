import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Logo from "./Logo";

// Shared shell for every public page: glass navbar on top, footer at the bottom.
export default function PublicLayout() {
  const navigate = useNavigate();
  const { pathname, hash, key } = useLocation();
  const [atHero, setAtHero] = useState(true);
  const [inAbout, setInAbout] = useState(false);

  // Home is highlighted only while the hero is on screen; scrolling down turns it off.
  useEffect(() => {
    const onScroll = () => {
      setAtHero(window.scrollY < window.innerHeight * 0.5);
      const about = document.getElementById("about");
      const cons = document.getElementById("consultants");
      if (about && cons) {
        const line = 140;
        setInAbout(about.getBoundingClientRect().top <= line && cons.getBoundingClientRect().bottom > line);
      } else {
        setInAbout(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const goHome = (e) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash, key]);

  return (
    <div className="landing site-page">
      <nav className="landing__nav" aria-label="Main">
        <Link className="landing__brand" to="/" aria-label="Living Gods Real Estates home">
          <Logo size={30} />
          <span className="landing__brand-name">Living Gods</span>
        </Link>
        <ul className="landing__links">
          <li>
            <Link to="/" onClick={goHome} className={pathname === "/" && atHero && !inAbout ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/#about" className={pathname === "/" && inAbout ? "active" : ""}>
              About us
            </Link>
          </li>
          <li><Link to="/marketplace">Buy</Link></li>
          <li><NavLink to="/sell">Sell</NavLink></li>
          <li><NavLink to="/marketplace" end>All properties</NavLink></li>
          <li><NavLink to="/contact">Contact us</NavLink></li>
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
