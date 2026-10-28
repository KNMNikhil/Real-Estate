import { Link } from "react-router-dom";

// Eye-catching teaser for the Team Buying Concept, placed right under the landing hero.
export default function TbcBanner() {
  return (
    <section className="tbc-banner" aria-labelledby="tbc-banner-title">
      <div className="tbc-banner__glow" aria-hidden="true" />
      <div className="tbc-banner__inner">
        <span className="tbc-banner__badge">
          <span className="tbc-banner__dot" aria-hidden="true" /> New &amp; only at Living Gods
        </span>
        <div className="tbc-banner__main">
          <div className="tbc-banner__letters" aria-hidden="true">TBC</div>
          <div className="tbc-banner__copy">
            <h2 id="tbc-banner-title">Team Buying Concept</h2>
            <p className="tbc-banner__tag">Many buyers. One seller. One powerful deal.</p>
            <p className="tbc-banner__text">
              Join other buyers as a team and bargain together, while the seller still gets a fair price.
            </p>
            <Link to="/tbc" className="tbc-banner__btn">
              Discover TBC <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
