// Simple reading layout shared by the Terms and Privacy pages.
export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <main className="legal">
      <span className="lp-eyebrow">Legal</span>
      <h1>{title}</h1>
      <p className="legal__updated">Last updated: {updated}</p>
      <p className="legal__intro">{intro}</p>

      {sections.map((s, i) => (
        <section key={s.title} className="legal__section">
          <h2>
            <span>{i + 1}.</span> {s.title}
          </h2>
          {s.paragraphs?.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {s.list && (
            <ul>
              {s.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
