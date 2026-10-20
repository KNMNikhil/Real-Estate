import { useRef } from "react";

// Six single-digit boxes that behave like one field (typing, backspace, arrows, paste).
export default function OtpInput({ value, onChange, length = 6, invalid = false, describedBy }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (i) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setAt = (i, ch) => {
    const next = digits.slice();
    next[i] = ch;
    onChange(next.join(""));
  };

  const handleChange = (i) => (e) => {
    const clean = e.target.value.replace(/\D/g, "");
    if (!clean) return;
    if (clean.length > 1) {
      // Autofill / multi-char input: spread across boxes.
      const merged = (value.slice(0, i) + clean).slice(0, length);
      onChange(merged);
      focus(merged.length >= length ? length - 1 : merged.length);
      return;
    }
    setAt(i, clean);
    focus(i + 1);
  };

  const handleKeyDown = (i) => (e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) setAt(i, "");
      else if (i > 0) {
        setAt(i - 1, "");
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focus(pasted.length >= length ? length - 1 : pasted.length);
  };

  return (
    <div className="otp-boxes" role="group" aria-label="6-digit OTP" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={`otp-boxes__box ${invalid ? "is-invalid" : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={d}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid ? "true" : "false"}
          aria-describedby={describedBy}
          onChange={handleChange(i)}
          onKeyDown={handleKeyDown(i)}
          onFocus={(e) => e.target.select()}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}
