import { Link } from "react-router-dom";

const TEAMS = [
  { code: "RI", name: "Relatives India Team", tone: "ri" },
  { code: "FI", name: "Friends India Team", tone: "fi" },
  { code: "ABR", name: "Any Buyer Random Team", tone: "abr" },
];

function Person() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4.2" />
      <path d="M3.5 21c0-4.4 3.8-7 8.5-7s8.5 2.6 8.5 7z" />
    </svg>
  );
}

export default function TeamBuying() {
  return (
    <div className="tbc site-main">
      <header className="tbc__hero">
        <span className="tbc__badge">Only at Living Gods</span>
        <h1>
          <span className="tbc__letters">TBC</span>
          Team Buying Concept
        </h1>
        <p className="tbc__lead">Many buyers. One seller. One powerful deal.</p>
      </header>

      <section className="tbc__section" aria-labelledby="tbc-what">
        <h2 id="tbc-what">What is TBC?</h2>
        <p>
          The Team Buying Concept brings many buyers together to buy from one seller. Instead of
          every buyer negotiating alone, they act as a team, and a team has far more bargaining
          power than a single buyer.
        </p>

        <div className="tbc__diagram" role="img" aria-label="Many buyers connected by a double-sided arrow to one seller">
          <div className="tbc__side">
            <div className="tbc__people">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="tbc__person">
                  <Person />
                </span>
              ))}
            </div>
            <strong>Many buyers</strong>
            <span>as one team</span>
          </div>

          <div className="tbc__arrow" aria-hidden="true">
            <svg viewBox="0 0 200 40" preserveAspectRatio="none">
              <line x1="22" y1="20" x2="178" y2="20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <path d="M34 6 L10 20 L34 34" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M166 6 L190 20 L166 34" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="tbc__side">
            <div className="tbc__seller">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor" aria-hidden="true">
                <path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z" />
              </svg>
            </div>
            <strong>One seller</strong>
            <span>one property</span>
          </div>
        </div>
      </section>

      <section className="tbc__section" aria-labelledby="tbc-teams">
        <h2 id="tbc-teams">Teams category</h2>
        <ul className="tbc__teams">
          {TEAMS.map((t, i) => (
            <li key={t.code} className={`tbc__team tbc__team--${t.tone}`}>
              <span className="tbc__team-num">{i + 1}</span>
              <span className="tbc__team-code">{t.code}</span>
              <strong>{t.name}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="tbc__section tbc__mind" aria-labelledby="tbc-mindset">
        <h2 id="tbc-mindset">The most common basic mindset and the exception</h2>
        <div className="tbc__mind-text">
          <p>
            The most common basic mindset of any individual is to keep the investment strategy and the
            asset details as <mark>confidential</mark> as possible.
          </p>
          <span className="tbc__mind-divider" aria-hidden="true">
            <i />
            <b>✦</b>
            <i />
          </span>
          <p>
            TBC suggests joining in some potential real estate investment opportunities to get more{" "}
            <mark>buying power</mark> and <mark>bargaining strength</mark> for <mark>mutual benefits</mark>.
          </p>
        </div>
        <blockquote className="tbc__quote">“United We Stand – Divided We Fall”</blockquote>
      </section>

      <section className="tbc__join" aria-labelledby="tbc-join">
        <h2 id="tbc-join">Join as Team; Be Ready for a Smart Buy</h2>
        <div className="tbc__cta">
          <Link to="/tbc/get-started" className="tbc__cta-btn tbc__cta-btn--primary">
            Get started <span aria-hidden="true">→</span>
          </Link>
          <Link to="/tbc/projects" className="tbc__cta-btn tbc__cta-btn--ghost">
            TBC projects ready <span aria-hidden="true">→</span>
          </Link>
        </div>
        <p className="muted">
          <Link to="/">Back to home</Link>
        </p>
      </section>
    </div>
  );
}
