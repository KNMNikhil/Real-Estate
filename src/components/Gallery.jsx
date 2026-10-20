import { useState } from "react";
import SafeImage from "./SafeImage";

export default function Gallery({ images = [], name }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return <SafeImage className="gallery__main" alt="" fallbackText="No photos available" />;
  }
  return (
    <div className="gallery">
      <SafeImage
        key={images[active]}
        className="gallery__main"
        src={images[active]}
        alt={`${name} photo ${active + 1} of ${images.length}`}
      />
      {images.length > 1 && (
        <ul className="gallery__thumbs">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                className={i === active ? "is-active" : ""}
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                <SafeImage src={src} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
