import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <header className="landing__hero">
        <Logo size={110} />
        <h1>Living Gods Real Estates</h1>
        <p className="landing__subtitle">(A unit of McCoy Engineering Private Limited)</p>
      </header>

      <main className="landing__content">
        <section aria-labelledby="about-heading">
          <h2 id="about-heading">About</h2>
          <p className="highlight">
            Real estate service is redefined. Highly transparent, no words, no intricate
            literature, only work and service.
          </p>
          <p>
            We believe in the maxim, &lsquo;Action speaks louder than words.&rsquo; Our deeds will
            speak, of course, with smiling face, respect, and honour.
          </p>
        </section>

        <section aria-labelledby="consultants-heading">
          <h2 id="consultants-heading">Our Living Gods Consultants</h2>
          <p>
            They are compulsorily associated with any of the spiritual organizations like{" "}
            <a
              href="https://en.wikipedia.org/wiki/Satyagnana_Sabha,_Vadalur"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sathya Jnanasabha
            </a>
            . Established in the year 1872 by Vallalar,{" "}
            <a href="https://en.wikipedia.org/wiki/Yogoda_Satsanga_Society_of_India" target="_blank" rel="noopener noreferrer">
              YSS
            </a>
            . Established by Sri Paramahamsa Yogananda, the third lieutenant disciple of Mahavatar
            Babaji, and any similar such organization which focus on the divine jyoti as the divine
            power.
          </p>
        </section>

        <div className="landing__cta">
          <button type="button" className="btn btn--primary btn--large" onClick={() => navigate("/login")}>
            Get Started
          </button>
        </div>
      </main>

      <footer className="site-footer">
        <p>www.livingarts.in</p>
      </footer>
    </div>
  );
}
