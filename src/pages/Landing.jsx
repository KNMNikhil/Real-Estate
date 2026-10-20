import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

const SERVICE_INFO = [
  { title: "Buying of Property", text: "Browse verified properties in your area and book a visit with your consultant.", icon: "⌂" },
  { title: "Selling of Property", text: "Meet your area consultant and list your property with complete transparency.", icon: "₹" },
  { title: "Property Management", text: "Collection of rent out and building maintenance, handled for you.", icon: "⚙" },
  { title: "Layout Approval", text: "Guidance and support through layout approvals from start to finish.", icon: "✓" },
  { title: "Plots Promotions", text: "Reach genuine buyers with focused promotion of your plots.", icon: "◈" },
];

const TESTIMONIALS = [
  {
    name: "Ravi Kumar",
    role: "Property buyer, Chennai",
    text: "Everything was explained clearly and there were no hidden surprises. My consultant stayed with me until the visit was done.",
  },
  {
    name: "Meena Lakshmi",
    role: "Property seller, Parrys",
    text: "Listing my property was simple. I met my area consultant, shared the details, and the process was respectful and quick.",
  },
  {
    name: "Suresh Babu",
    role: "Landlord, Adyar",
    text: "Rent collection and building maintenance are handled for me now. I finally have peace of mind.",
  },
];

const FAQS = [
  { q: "How do I get started?", a: "Click Get started, log in with your mobile number and OTP, then choose whether you want to buy or sell a property." },
  { q: "Who are the Living Gods Consultants?", a: "Consultants associated with spiritual organizations that focus on the divine jyoti. Each serves a specific area and is your point of contact." },
  { q: "How do I book a property visit?", a: "Open a property from the Buy list, pick a date and time slot, and confirm. Your consultant will meet you there." },
  { q: "Can I sell my property through you?", a: "Yes. Choose Selling a Property, meet your area consultant and share your property details and photos." },
  { q: "Do you help with layout approvals and plot promotions?", a: "Yes. We guide you through layout approvals and promote plots to genuine buyers." },
];

export default function Landing() {
  const navigate = useNavigate();
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="landing">
      <nav className="landing__nav" aria-label="Main">
        <a className="landing__brand" href="#top" aria-label="Living Gods Real Estates home">
          <Logo size={30} />
          <span className="landing__brand-name">Living Gods</span>
        </a>
        <ul className="landing__links">
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#consultants">Consultants</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div className="landing__actions">
          <Link to="/login" className="landing__login">Login</Link>
          <button type="button" className="btn btn--soft" onClick={() => navigate("/login")}>
            Get started
          </button>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero__text">
          <h1>Living Gods Real Estates</h1>
          <p className="hero__sub">(A unit of McCoy Engineering Private Limited)</p>
          <p className="hero__lead">
            Highly transparent real estate service. Buy, sell and manage property with consultants
            you can trust.
          </p>
        </div>
        <div className="hero__media">
          <img src="/hero.png" alt="" />
        </div>
      </header>

      <main className="lp">
        <section id="about" className="lp-section" aria-labelledby="about-heading">
          <span className="lp-eyebrow">About</span>
          <div className="about">
            <h2 id="about-heading" className="lp-title">
              Real estate service, <em>redefined.</em>
            </h2>
            <div className="about__body">
              <p className="about__lead">
                Highly transparent, no words, no intricate literature, only work and service.
              </p>
              <p>
                We believe in the maxim, &lsquo;Action speaks louder than words.&rsquo; Our deeds
                will speak, of course, with smiling face, respect, and honour.
              </p>
              <ul className="about__tags">
                <li>Transparent</li>
                <li>Respectful</li>
                <li>Action first</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="services" className="lp-section" aria-labelledby="services-heading">
          <span className="lp-eyebrow">Services</span>
          <h2 id="services-heading" className="lp-title">Everything property, in one place</h2>
          <ul className="svc-grid">
            {SERVICE_INFO.map((s) => (
              <li key={s.title} className="svc-card">
                <span className="svc-card__icon" aria-hidden="true">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="consultants" className="lp-section" aria-labelledby="consultants-heading">
          <div className="consult">
            <span className="lp-eyebrow">Our Living Gods Consultants</span>
            <h2 id="consultants-heading" className="lp-title">Guided by faith, grounded in service</h2>
            <p>
              They are compulsorily associated with any of the spiritual organizations like{" "}
              <a href="https://en.wikipedia.org/wiki/Satyagnana_Sabha,_Vadalur" target="_blank" rel="noopener noreferrer">
                Sathya Jnanasabha
              </a>
              . Established in the year 1872 by Vallalar,{" "}
              <a href="https://en.wikipedia.org/wiki/Yogoda_Satsanga_Society_of_India" target="_blank" rel="noopener noreferrer">
                YSS
              </a>
              . Established by Sri Paramahamsa Yogananda, the third lieutenant disciple of Mahavatar
              Babaji, and any similar such organization which focus on the divine jyoti as the
              divine power.
            </p>
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
                  <span className="quote__avatar" aria-hidden="true">{t.name[0]}</span>
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

      <Footer />
    </div>
  );
}
