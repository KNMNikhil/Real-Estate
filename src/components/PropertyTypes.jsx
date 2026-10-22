import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import useProperties from "../utils/useProperties";

// One theme icon per property type.
const ICONS = {
  Plot: "svcPlots",
  Apartment: "typeApartment",
  Villa: "typeVilla",
  "Independent House": "typeHouse",
  Commercial: "typeShop",
};

const TYPES = ["Plot", "Apartment", "Villa", "Independent House", "Commercial"];

export default function PropertyTypes() {
  const { properties: all } = useProperties();
  const rail = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = rail.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 24, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 24 });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scrollBy = (dir) => rail.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  const noScroll = edge.start && edge.end;

  return (
    <section className="ptypes" aria-labelledby="ptypes-heading">
      <div className="ptypes__inner">
        <span className="lp-eyebrow">Property types</span>
        <h2 id="ptypes-heading">Find the home that fits you</h2>
        <p className="ptypes__sub">Pick a type to see everything we have for sale.</p>

        <div className="ptypes__row">
          {!noScroll && (
            <button type="button" className={`ptypes__arrow ${edge.start ? "" : "is-active"}`} onClick={() => scrollBy(-1)} aria-label="Previous types" disabled={edge.start}>
              ‹
            </button>
          )}
          <ul className="ptypes__rail" ref={rail} onScroll={update}>
            {TYPES.map((t) => {
              const count = all.filter((p) => p.type === t).length;
              return (
                <li key={t}>
                  <Link to={`/marketplace?type=${encodeURIComponent(t)}`} className="ptype">
                    <span className="ptype__icon" aria-hidden="true">
                      <Icon name={ICONS[t]} size={44} />
                    </span>
                    <strong>{t}</strong>
                    <span className="ptype__count">
                      {count} {count === 1 ? "property" : "properties"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {!noScroll && (
            <button type="button" className={`ptypes__arrow ${edge.end ? "" : "is-active"}`} onClick={() => scrollBy(1)} aria-label="Next types" disabled={edge.end}>
              ›
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
