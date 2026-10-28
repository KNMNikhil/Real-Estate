import { useEffect, useRef, useState } from "react";

const WORDS = ["ACTION", "SPEAKS", "LOUDER", "THAN", "WORDS."];

// Dark statement panel. The words rise in one by one the first time it scrolls into view.
export default function MaximCard() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <blockquote className={`maxim ${seen ? "is-in" : ""}`} ref={ref}>
      <span className="maxim__mark" aria-hidden="true">&ldquo;</span>
      <p className="maxim__intro">WE BELIEVE IN THE MAXIM</p>
      <p className="maxim__quote">
        {WORDS.map((w, i) => (
          <span key={w} className={`maxim__word ${w === "LOUDER" ? "maxim__word--hot" : ""}`} style={{ "--i": i }}>
            {w}
          </span>
        ))}
      </p>
      <span className="maxim__rule" aria-hidden="true" />
    </blockquote>
  );
}
