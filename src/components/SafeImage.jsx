import { useState } from "react";

// Image that falls back to a neutral placeholder box when missing or broken.
export default function SafeImage({ src, alt, className = "", fallbackText = "No image" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`img-placeholder ${className}`} role="img" aria-label={fallbackText}>
        <span>{fallbackText}</span>
      </div>
    );
  }
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
