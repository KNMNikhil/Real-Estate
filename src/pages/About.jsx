export default function About() {
  return (
    <main className="lp about-page">
        <section id="about" className="lp-section" aria-labelledby="about-heading">
          <span className="lp-eyebrow">About</span>
          <div className="about">
            <h2 id="about-heading" className="lp-title">
              Real estate service, <em>redefined.</em>
            </h2>
            <div className="about__body">
              <p className="about__lead">
                Highly transparent, no words, no enticing literature, only work and service.
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

        <section id="consultants" className="lp-section" aria-labelledby="consultants-heading">
          <div className="consult">
            <h2 id="consultants-heading" className="consult__title">Our Living Gods Consultants</h2>
            <p className="consult__tag">Guided by faith, grounded in service</p>
            <p>
              They are compulsorily associated with any of the spiritual organizations like{" "}
              <a href="https://en.wikipedia.org/wiki/Satyagnana_Sabha,_Vadalur" target="_blank" rel="noopener noreferrer">
                Satyagnana Sabha
              </a>{" "}
              established in the year 1872 by Vallalar,{" "}
              <a href="https://en.wikipedia.org/wiki/Yogoda_Satsanga_Society_of_India" target="_blank" rel="noopener noreferrer">
                YSS
              </a>{" "}
              established by Sri Paramahansa Yogananda, the third lieutenant disciple of Mahavatar
              Babaji, and any similar such organization which focus on the divine jyoti as the
              divine power.
            </p>
          </div>
        </section>
    </main>
  );
}
