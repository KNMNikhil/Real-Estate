import { useEffect, useState } from "react";

const GURUS = [
  { src: "/gurus/mahavatar-babaji.webp", name: "Mahavatar Babaji" },
  { src: "/gurus/lahiri-mahasaya.webp", name: "Lahiri Mahasaya" },
  { src: "/gurus/yukteswar-giri.webp", name: "Swami Sri Yukteswar Giri" },
  { src: "/gurus/paramahansa-yogananda.webp", name: "Paramahansa Yogananda" },
];

// Endless horizontal marquee. The list is rendered twice and the track slides by exactly
// half its width, so the loop restarts without a visible jump. Hover or focus pauses it.
// Clicking a picture opens it larger.
export default function GuruCarousel() {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className={`gurus ${open ? "is-paused" : ""}`} role="region" aria-label="Our spiritual lineage">
        <ul className="gurus__track">
          {[...GURUS, ...GURUS].map((g, i) => {
            const copy = i >= GURUS.length;
            return (
              <li key={`${g.name}-${i}`} className="gurus__item" aria-hidden={copy ? "true" : undefined}>
                <button
                  type="button"
                  className="gurus__btn"
                  tabIndex={copy ? -1 : 0}
                  aria-label={`View ${g.name} larger`}
                  onClick={() => setOpen(g)}
                >
                  <img src={g.src} alt={copy ? "" : g.name} loading="lazy" draggable="false" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={open.name} onClick={() => setOpen(null)}>
          <button type="button" className="lightbox__close" aria-label="Close picture" onClick={() => setOpen(null)} autoFocus>
            &times;
          </button>
          <img src={open.src} alt={open.name} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
