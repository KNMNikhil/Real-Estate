import Icon from "../components/Icon";
import { CONTACT } from "../data/contact";
import ContactMessageCard from "../components/ContactMessageCard";

export default function Contact() {
  const rows = [
    { icon: "contactMap", label: "Office address", lines: [CONTACT.address], href: CONTACT.mapUrl, external: true },
    { icon: "contactPhone", label: "Contact number", lines: [CONTACT.phone], href: `tel:${CONTACT.phone.replace(/\s/g, "")}`, big: true },
    { icon: "contactMail", label: "Email us", lines: [CONTACT.email], href: `mailto:${CONTACT.email}` },
  ];

  return (
    <main className="contact">
      <section className="contact__info">
        <span className="lp-eyebrow">Contact us</span>
        <h1>Get in touch with us today</h1>
        <p>
          For honest guidance on buying, selling or managing property, talk to our team. Your area consultant will
          get back to you personally.
        </p>
        <p>
          We help with apartments, villas, independent houses, plots and commercial properties. Tell us what you
          need and we will take it from there.
        </p>

        <ul className="contact__rows">
          {rows.map((r) => (
            <li key={r.label}>
              <span className="contact__icon" aria-hidden="true">
                <Icon name={r.icon} size={28} />
              </span>
              <span className="contact__divider" aria-hidden="true" />
              <div>
                <span className="contact__label">{r.label}</span>
                {r.lines.map((l) =>
                  r.href ? (
                    <a key={l} href={r.href} className={`contact__value ${r.big ? "is-big" : ""}`} {...(r.external ? { target: "_blank", rel: "noopener noreferrer", title: "Open in Google Maps" } : {})}>{l}</a>
                  ) : (
                    <span key={l} className="contact__value">{l}</span>
                  )
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ContactMessageCard />
    </main>
  );
}
