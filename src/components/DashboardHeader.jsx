import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo";
import ProfileMenu from "./ProfileMenu";

const NAV = [
  { to: "/dashboard/consultants", label: "LG Consultants View" },
  { to: "/dashboard/services", label: "Services" },
  { to: "/dashboard/functions", label: "Functions" },
];

export default function DashboardHeader() {
  return (
    <header className="dash-header">
      <div className="dash-header__inner">
        <Link to="/dashboard" className="brand-link" aria-label="Living Gods Real Estates home">
          <Logo size={42} />
          <span className="brand-link__text">
            Living Gods <span>Real Estates</span>
          </span>
        </Link>
        <nav className="dash-nav" aria-label="Dashboard">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `dash-nav__link ${isActive ? "is-active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <ProfileMenu />
      </div>
    </header>
  );
}
