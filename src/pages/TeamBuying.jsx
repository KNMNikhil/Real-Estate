import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const STEPS = [
  { title: "Buyers come together", text: "Several buyers interested in the same property form one team." },
  { title: "One team, one offer", text: "The team speaks to the seller with a single, united voice." },
  { title: "Stronger bargaining", text: "A group of serious buyers can negotiate better than one person alone." },
  { title: "Fair for the seller", text: "The seller deals with committed buyers and is not at a loss." },
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

      <section className="tbc__section" aria-labelledby="tbc-how">
        <h2 id="tbc-how">Why it works for everyone</h2>
        <ol className="tbc__steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="tbc__num">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="tbc__twin">
          <div>
            <h3>For buyers</h3>
            <p>More bargaining power together than any one buyer could have alone.</p>
          </div>
          <div>
            <h3>For the seller</h3>
            <p>A group of genuine, committed buyers, and a fair deal with no loss.</p>
          </div>
        </div>
      </section>

      <section className="tbc__join" aria-labelledby="tbc-join">
        <h2 id="tbc-join">Join Together Through</h2>
        <a className="tbc__logo-btn" href="https://www.livinggods.in" target="_blank" rel="noopener noreferrer" aria-label="Join together through Living Gods (opens www.livinggods.in)">
          <Logo size={56} />
          <span>
            <strong>Living Gods</strong>
            <small>www.livinggods.in</small>
          </span>
          <span className="tbc__logo-arrow" aria-hidden="true">→</span>
        </a>
        <p className="muted">
          <Link to="/">Back to home</Link>
        </p>
      </section>
    </div>
  );
}
