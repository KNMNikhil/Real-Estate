import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import PropertyCard from "../components/PropertyCard";
import PropertyTypes from "../components/PropertyTypes";
import { getAllProperties } from "../utils/lookup";

const SERVICE_INFO = [
  { title: "Buying of Property", text: "Browse verified properties in your area and book a visit with your consultant.", icon: "svcBuy", cta: { to: "/marketplace", label: "Buy a property" } },
  { title: "Selling of Property", text: "Meet your area consultant and list your property with complete transparency.", icon: "svcSell", cta: { to: "/sell", label: "Sell a property" } },
  { title: "Property Management", text: "Collection of rent out and building maintenance, handled for you.", icon: "svcManage" },
  { title: "Layout Approval", text: "Guidance and support through layout approvals from start to finish.", icon: "svcLayout" },
  { title: "Plots Promotions", text: "Reach genuine buyers with focused promotion of your plots.", icon: "svcPlots" },
];

const TESTIMONIALS = [
  {
    name: "Ravi Kumar",
    photo: "https://i.pravatar.cc/120?img=8",
    role: "Property buyer, Chennai",
    text: "Everything was explained clearly and there were no hidden surprises. My consultant stayed with me until the visit was done.",
  },
  {
    name: "Meena Lakshmi",
    photo: "https://i.pravatar.cc/120?img=47",
    role: "Property seller, Parrys",
    text: "Listing my property was simple. I met my area consultant, shared the details, and the process was respectful and quick.",
  },
  {
    name: "Suresh Babu",
    photo: "https://i.pravatar.cc/120?img=15",
    role: "Landlord, Adyar",
    text: "Rent collection and building maintenance are handled for me now. I finally have peace of mind.",
  },
];

const FAQS = [
  { q: "How do I get started?", a: "No account needed. Open the Marketplace to buy a property, or use Sell a property from the Services section. We only ask for your name, email and phone number when you book." },
  { q: "Who are the Living Gods Consultants?", a: "Consultants associated with spiritual organizations that focus on the divine jyoti. Each serves a specific area and is your point of contact." },
  { q: "How do I book a property visit?", a: "Open a property from the Marketplace, pick a date and time slot, and confirm. Your consultant will meet you there." },
  { q: "Can I sell my property through you?", a: "Yes. Choose Sell a property under Services, meet your area consultant and share your property details and photos." },
  { q: "Do you help with layout approvals and plot promotions?", a: "Yes. We guide you through layout approvals and promote plots to genuine buyers." },
];

export default function Landing() {
  const navigate = useNavigate();
  const all = getAllProperties().sort((x, y) => new Date(y.uploadedAt) - new Date(x.uploadedAt));
  const featured = all.slice(0, 6);

  return (
    <>
      <header className="hero" id="top">
        <div className="hero__text">
          <h1>Living Gods Real Estates</h1>
          <p className="hero__sub">(A unit of McCoy Engineering Private Limited)</p>
          <p className="hero__lead">
            Highly transparent real estate service. Buy, sell and manage property with consultants
            you can trust.
          </p>
          <button type="button" className="btn btn--gold btn--pill btn--hero" onClick={() => navigate("/marketplace")}>
            Marketplace
          </button>
        </div>
        <div className="hero__media">
          <img src="/hero.png" alt="" />
        </div>
      </header>

      <PropertyTypes />

      <main className="lp">
        <section id="featured" className="lp-section" aria-labelledby="featured-heading">
          <span className="lp-eyebrow">Featured properties</span>
          <h2 id="featured-heading" className="lp-title">Properties available to buy</h2>
          <ul className="market__grid featured__grid">
            {featured.map((p) => (
              <li key={p.id}>
                <PropertyCard property={p} />
              </li>
            ))}
          </ul>
          <div className="featured__cta">
            <Link to="/marketplace" className="btn btn--gold btn--pill btn--hero">
              View all properties
            </Link>
          </div>
        </section>

        <section id="services" className="lp-section" aria-labelledby="services-heading">
          <span className="lp-eyebrow">Services</span>
          <h2 id="services-heading" className="lp-title">Everything about property</h2>
          <div className="bento">
            {SERVICE_INFO.slice(0, 2).map((s, i) => (
              <article key={s.title} className={`bento__big ${i === 0 ? "is-buy" : "is-sell"}`}>
                <span className="bento__ghost" aria-hidden="true">
                  <Icon name={s.icon} size={220} />
                </span>
                <span className="bento__icon" aria-hidden="true">
                  <Icon name={s.icon} size={46} />
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <Link to={s.cta.to} className="bento__btn">
                  {s.cta.label} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
            {SERVICE_INFO.slice(2).map((s, i) => (
              <article key={s.title} className="bento__small">
                <span className="bento__num" aria-hidden="true">0{i + 3}</span>
                <span className="bento__icon is-small" aria-hidden="true">
                  <Icon name={s.icon} size={30} />
                </span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="testimonials" className="lp-section" aria-labelledby="testimonials-heading">
          <span className="lp-eyebrow">Testimonials</span>
          <h2 id="testimonials-heading" className="lp-title">What our customers say</h2>
          <ul className="quote-grid">
            {TESTIMONIALS.map((t) => (
              <li key={t.name} className="quote">
                <p>&ldquo;{t.text}&rdquo;</p>
                <div className="quote__who">
                  <img className="quote__avatar" src={t.photo} alt={`Photo of ${t.name}`} loading="lazy" width="44" height="44" />
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="faq" className="lp-section" aria-labelledby="faq-heading">
          <span className="lp-eyebrow">FAQ</span>
          <h2 id="faq-heading" className="lp-title">Frequently asked questions</h2>
          <div className="faq">
            {FAQS.map((f) => (
              <details key={f.q} className="faq__item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
