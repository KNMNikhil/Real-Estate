import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import ContactMessageCard from "../components/ContactMessageCard";
import GuruCarousel from "../components/GuruCarousel";
import MaximCard from "../components/MaximCard";
import TbcBanner from "../components/TbcBanner";

const SERVICE_INFO = [
  { title: "Buying of Property", text: "Tell us the area you want and your consultant will help you find the right property.", icon: "svcBuy", cta: { to: "/buy", label: "Buy a property" } },
  { title: "Selling of Property", text: "Meet your area consultant and list your property with complete transparency.", icon: "svcSell", cta: { to: "/sell", label: "Sell a property" } },
  { title: "Property Management", text: "Collection of rent out and building maintenance, handled for you.", icon: "svcManage" },
  { title: "Layout Approval and Promotions of Plots", text: "Guidance through layout approvals from start to finish, and focused promotion that reaches genuine buyers for your plots.", icon: "svcLayout" },
  { title: "TBC: Team Buying Concept", text: "Many buyers join as one team to bargain together, while the seller still gets a fair deal.", icon: "svcBuy", to: "/tbc" },
];

const FAQS = [
  { q: "How do I get started?", a: "No account needed. Use Buy or Sell in the menu. We only ask for your name, email and phone number when you book." },
  { q: "Who are the Living Gods Consultants?", a: "Consultants associated with spiritual organizations that focus on the divine jyoti. Each serves a specific area and is your point of contact." },
  { q: "How do I book a property visit?", a: "Choose Buy, enter your details and area PIN code, pick a date and accept the agreement. Your consultant will contact you shortly." },
  { q: "Can I sell my property through you?", a: "Yes. Choose Sell, enter your details and area PIN code, pick a date and accept the agreement. Your consultant will contact you shortly." },
  { q: "Do you help with layout approvals and plot promotions?", a: "Yes. We guide you through layout approvals and promote plots to genuine buyers." },
];

export default function Landing() {

  return (
    <>
      <header className="hero" id="top">
        <div className="hero__text">
          <h1>Living Gods Real Estates</h1>
          <p className="hero__sub">(A Unit of McCoy Engineering Private Limited)</p>
          <p className="hero__lead">
            Highly transparent real estate service. Buy, sell and manage property with consultants
            you can trust.
          </p>
        </div>
        <div className="hero__media">
          <img src="/hero.png" alt="" />
        </div>
      </header>

      <TbcBanner />

      <main className="lp lp--top">
        <section id="about" className="lp-section" aria-labelledby="about-heading">
          <span className="lp-eyebrow">About</span>
          <div className="about">
            <h2 id="about-heading" className="lp-title">
              Real Estate Service <em>Redefined.</em>
            </h2>
            <div className="about__body">
              <p className="about__lead">
                Highly transparent, no words, no enticing literature, only work and service.
              </p>
              <div className="about__maxim-block">
                <MaximCard />
                <p className="about__outro">Our deeds will speak, of course, with smiling face, respect and honour.</p>
              </div>
              <ul className="about__tags">
                <li>Transparent</li>
                <li>Respectful</li>
                <li>Action first</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="consultants" className="lp-section" aria-labelledby="consultants-heading">
          <div className="consult">
            <h2 id="consultants-heading" className="consult__title">Living Gods Consultants</h2>
            <p className="consult__tag">Guided by faith, grounded in service</p>
            <p>
              They are compulsorily associated with any of the spiritual organizations like{" "}
              <a className="consult__link" href="https://en.wikipedia.org/wiki/Satyagnana_Sabha,_Vadalur" target="_blank" rel="noopener noreferrer">
                Satyagnana Sabha
              </a>{" "}
              established in the year 1872 by Vallalar,{" "}
              <a className="consult__link" href="https://en.wikipedia.org/wiki/Yogoda_Satsanga_Society_of_India" target="_blank" rel="noopener noreferrer">
                YSS
              </a>{" "}
              established by Sri Paramahansa Yogananda, the third lieutenant disciple of Mahavatar
              Babaji, and any similar such organization which focus on the divine jyoti as the
              divine power.
            </p>
          </div>
          <GuruCarousel />
        </section>
      </main>

      <main className="lp">
        <section id="services" className="lp-section" aria-labelledby="services-heading">
          <span className="lp-eyebrow">Service</span>
          <h2 id="services-heading" className="lp-title">How We Serve You</h2>
          <p className="services-quote">&ldquo;Serving with honesty, from the first call to the final key.&rdquo;</p>
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
            {SERVICE_INFO.slice(2).map((s, i) => {
              const body = (
                <>
                  <span className="bento__num" aria-hidden="true">0{i + 3}</span>
                  <span className="bento__icon is-small" aria-hidden="true">
                    <Icon name={s.icon} size={30} />
                  </span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    {s.to && (
                      <span className="bento__more">
                        Learn about TBC <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </div>
                </>
              );
              return s.to ? (
                <Link key={s.title} to={s.to} className="bento__small bento__small--link">
                  {body}
                </Link>
              ) : (
                <article key={s.title} className="bento__small">
                  {body}
                </article>
              );
            })}
          </div>
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

        <section id="get-in-touch" className="lp-section lp-contact" aria-label="Contact us">
          <div className="lp-contact__wrap">
            <ContactMessageCard />
          </div>
        </section>
      </main>
    </>
  );
}
