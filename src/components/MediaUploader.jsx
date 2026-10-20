import { useEffect, useId, useRef, useState } from "react";
import { compressImage } from "../utils/media";

const MAX_FILES = 8;

// Optional photo/video upload with previews. `items` is controlled by the parent:
// { id, kind: "image" | "video", name, url }. Images become compact data URLs
// (saved with the listing); videos are previewed only (too large for localStorage).
export default function MediaUploader({ items, onChange }) {
  const inputId = useId();
  const latest = useRef(items);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  latest.current = items;

  // Release video preview URLs when the uploader goes away.
  useEffect(
    () => () => {
      latest.current.filter((m) => m.kind === "video").forEach((m) => URL.revokeObjectURL(m.url));
    },
    []
  );

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const problems = [];
    const room = MAX_FILES - items.length;
    if (files.length > room) problems.push(`Only ${MAX_FILES} files can be added; extra files were skipped.`);

    setBusy(true);
    const added = [];
    for (const file of files.slice(0, Math.max(room, 0))) {
      const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`;
      if (file.type.startsWith("image/")) {
        try {
          added.push({ id, kind: "image", name: file.name, url: await compressImage(file) });
        } catch {
          problems.push(`${file.name} could not be read as an image.`);
        }
      } else if (file.type.startsWith("video/")) {
        added.push({ id, kind: "video", name: file.name, url: URL.createObjectURL(file) });
      } else {
        problems.push(`${file.name} is not an image or video.`);
      }
    }
    setBusy(false);
    setMessage(problems.join(" "));
    if (added.length) onChange([...latest.current, ...added]);
  };

  const remove = (item) => {
    if (item.kind === "video") URL.revokeObjectURL(item.url);
    onChange(items.filter((m) => m.id !== item.id));
  };

  return (
    <div className="uploader">
      <label htmlFor={inputId} className="field__label">
        Pictures and videos <span className="muted">(optional)</span>
      </label>
      <input
        id={inputId}
        className="input input--file"
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFiles}
      />
      <p className="field__hint">
        Up to {MAX_FILES} files. Photos are saved with your listing; videos are previewed only in
        this demo.
      </p>
      {busy && <p className="muted">Processing files…</p>}
      {message && (
        <p className="field__error" role="alert">
          {message}
        </p>
      )}
      {items.length > 0 && (
        <ul className="uploader__grid">
          {items.map((item) => (
            <li key={item.id} className="uploader__item">
              {item.kind === "image" ? (
                <img src={item.url} alt={item.name} />
              ) : (
                <video src={item.url} muted controls preload="metadata" />
              )}
              <button
                type="button"
                className="uploader__remove"
                aria-label={`Remove ${item.name}`}
                onClick={() => remove(item)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
