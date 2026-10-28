import { useId, useState } from "react";
import { validatePin } from "../utils/validators";

// PIN entry with inline validation. Calls onSubmit(pin) only for a valid PIN.
export default function PinForm({
  label = "Enter the Area PIN Code",
  buttonLabel = "Done",
  initialValue = "",
  onSubmit,
  onChange,
}) {
  const id = useId();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setValue(e.target.value);
    if (error) setError("");
    onChange?.(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pin = value.trim();
    const message = validatePin(pin);
    setError(message);
    if (!message) onSubmit(pin);
  };

  return (
    <form className="pin-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="pin-form__row">
        <input
          id={id}
          className={`input ${error ? "input--error" : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="e.g. 631051"
          value={value}
          onChange={handleChange}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button type="submit" className="btn btn--primary">
          {buttonLabel}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
