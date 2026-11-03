import { Link } from "react-router-dom";

const FACTS = [
  { big: "₹500", small: "fixed price per sq.ft." },
  { big: "2%", small: "commission to L.G. Consultant only" },
  { big: "0", small: "hidden deals of any kind" },
  { big: "1", small: "free visit from Arakkonam Jn." },
];

const PERKS = [
  "Direct owner–buyer contact",
  "DTCP approved layout",
  "Ideal for building houses immediately; nearby houses are there",
  "5% extra for East facing and North facing plots",
  "10% extra for corner plots",
];

// "TBC projects ready": projects that are ready to be bought as a team.
export default function TbcProjects() {
  return (
    <div className="tbc site-main">
      <header className="tbc__hero tbc__hero--projects">
        <span className="tbc__badge">TBC projects ready</span>
        <h1>
          <span className="tbc__letters tbc__letters--sm">Ready</span>
          Projects for Team Buying
        </h1>
        <p className="tbc__lead">Pick a project, join as a team, buy smart.</p>
      </header>

      <article className="proj" aria-labelledby="proj-1">
        <div className="proj__top">
          <span className="proj__no">1</span>
          <div>
            <h2 id="proj-1">Baba Pasumai Nagar</h2>
            <p className="proj__sub">DTCP approved plots · Near Arakkonam Junction</p>
            <p className="proj__loc">9 kms from the railway station</p>
          </div>
        </div>

        <div className="proj__offer">
          <span className="proj__ribbon">Special offer price by the owner</span>
          <p>for immediate house builders</p>
          <strong>Fixed price Rs.500/- per sq.ft.</strong>
          <span className="proj__flag">Direct owner–buyer contact</span>
        </div>

        <ul className="proj__facts">
          {FACTS.map((f) => (
            <li key={f.small}>
              <strong>{f.big}</strong>
              <span>{f.small}</span>
            </li>
          ))}
        </ul>

        <div className="proj__cols">
          <section className="proj__box">
            <h3>Pricing</h3>
            <p>
              Rs.500/- per sq.ft. <strong>5% extra</strong> for East facing and North facing plots.{" "}
              <strong>10% extra</strong> for corner plots.
            </p>
            <p>Only 2% commission to L.G. Consultant. No hidden deals of any kind.</p>
          </section>
          <section className="proj__box">
            <h3>Why this project</h3>
            <ol className="proj__roman">
              <li>
                DTCP approved layout. Near Arakkonam Junction, 9 kms from the railway station, from where you
                can reach Chennai Central within one hour.
              </li>
              <li>
                Ideal for building houses immediately. Nearby houses are there. Arrangement of free Panchayat
                water and EB connection with deposits to those who start construction within 3 months from the
                date of registration.
              </li>
            </ol>
          </section>
        </div>

        <ul className="proj__perks">
          {PERKS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <div className="proj__cta">
          <Link to="/tbc/get-started?project=baba-pasumai-nagar" className="tbc__cta-btn tbc__cta-btn--primary">
            Join this project as a team <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <p className="muted proj__back">
        <Link to="/tbc">← Back to Team Buying Concept</Link>
      </p>
    </div>
  );
}
