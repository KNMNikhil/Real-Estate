import { useState } from "react";
import {
  validateCount,
  validatePositiveNumber,
  validateRequired,
} from "../utils/validators";
import MediaUploader from "./MediaUploader";

export const PROPERTY_TYPES = ["Apartment", "Villa", "Plot", "Commercial", "Independent House"];
const FACINGS = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

function validate(v) {
  const isPlot = v.type === "Plot";
  const e = {};
  e.name = validateRequired(v.name, "the property name", 2);
  e.type = v.type ? "" : "Please select a property type.";
  e.address = validateRequired(v.address, "the full address", 10);
  e.area = validateRequired(v.area, "the area / locality", 2);
  e.sqft = validatePositiveNumber(v.sqft, "the total area", { integer: true });
  if (!isPlot) {
    // Commercial properties may not have bedrooms/bathrooms, so only validate if filled in.
    e.bedrooms =
      v.type === "Commercial" && !v.bedrooms.trim() ? "" : validateCount(v.bedrooms, "the number of bedrooms");
    e.bathrooms =
      v.type === "Commercial" && !v.bathrooms.trim() ? "" : validateCount(v.bathrooms, "the number of bathrooms");
    e.floor = validateRequired(v.floor, "the floor", 1);
    e.totalFloors = validatePositiveNumber(v.totalFloors, "the total floors", { integer: true });
  }
  e.facing = v.facing ? "" : "Please select the facing direction.";
  e.price = validatePositiveNumber(v.price, "the expected price");
  e.description = validateRequired(v.description, "a description", 10);
  return Object.fromEntries(Object.entries(e).filter(([, msg]) => msg));
}

function Field({ id, label, error, hint, children, wide }) {
  return (
    <div className={`field ${wide ? "field--wide" : ""}`}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function PropertyForm({ initial, pinLocked, submitting, onSubmit, onBack }) {
  const [values, setValues] = useState({
    name: "",
    type: "",
    address: "",
    area: "",
    pincode: "",
    sqft: "",
    bedrooms: "",
    bathrooms: "",
    floor: "",
    totalFloors: "",
    facing: "",
    price: "",
    description: "",
    ...initial,
  });
  const [media, setMedia] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(values);
  const shown = submitted ? errors : {};
  const isPlot = values.type === "Plot";

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const props = (key) => ({
    id: `pf-${key}`,
    className: `input ${shown[key] ? "input--error" : ""}`,
    value: values[key],
    onChange: set(key),
    "aria-invalid": shown[key] ? "true" : "false",
    "aria-describedby": shown[key] ? `pf-${key}-error` : undefined,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      // Wait for the error state to render, then jump to the first problem.
      requestAnimationFrame(() =>
        document.querySelector('.property-form [aria-invalid="true"]')?.focus()
      );
      return;
    }
    onSubmit(values, media);
  };

  return (
    <form className="property-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-section">
        <legend>{"Basics"}</legend>
        <p className="muted form-section__sub">Tell buyers what and where it is.</p>
        <div className="form-grid">
        <Field id="pf-name" label="Property Name" error={shown.name}>
          <input {...props("name")} type="text" autoComplete="off" />
        </Field>
        <Field id="pf-type" label="Property Type" error={shown.type}>
          <select {...props("type")}>
            <option value="">Select type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field id="pf-address" label="Full Address" error={shown.address} wide>
          <textarea {...props("address")} rows={2} />
        </Field>
        <Field id="pf-area" label="Area (Locality)" error={shown.area}>
          <input {...props("area")} type="text" />
        </Field>
        <Field
          id="pf-pincode"
          label="PIN Code"
          hint={pinLocked ? "Fixed to the area you selected earlier." : undefined}
        >
          <input
            id="pf-pincode"
            className="input"
            value={values.pincode}
            readOnly={pinLocked}
            onChange={set("pincode")}
            inputMode="numeric"
          />
        </Field>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>{"Specifications"}</legend>
        <p className="muted form-section__sub">Size and layout.</p>
        <div className="form-grid">
        <Field id="pf-sqft" label="Total Area (sq. ft.)" error={shown.sqft}>
          <input {...props("sqft")} type="number" inputMode="numeric" min="1" />
        </Field>
        <Field id="pf-facing" label="Facing" error={shown.facing}>
          <select {...props("facing")}>
            <option value="">Select facing</option>
            {FACINGS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field
          id="pf-bedrooms"
          label="Number of Bedrooms"
          error={shown.bedrooms}
          hint={isPlot ? "Not applicable for plots." : undefined}
        >
          <input
            {...props("bedrooms")}
            type="number"
            inputMode="numeric"
            min="0"
            disabled={isPlot}
            value={isPlot ? "" : values.bedrooms}
          />
        </Field>
        <Field id="pf-bathrooms" label="Number of Bathrooms" error={shown.bathrooms}>
          <input
            {...props("bathrooms")}
            type="number"
            inputMode="numeric"
            min="0"
            disabled={isPlot}
            value={isPlot ? "" : values.bathrooms}
          />
        </Field>
        <Field id="pf-floor" label="Floor" error={shown.floor} hint="e.g. 4, Ground, G+1">
          <input
            {...props("floor")}
            type="text"
            disabled={isPlot}
            value={isPlot ? "" : values.floor}
          />
        </Field>
        <Field id="pf-totalFloors" label="Total Floors" error={shown.totalFloors}>
          <input
            {...props("totalFloors")}
            type="number"
            inputMode="numeric"
            min="1"
            disabled={isPlot}
            value={isPlot ? "" : values.totalFloors}
          />
        </Field>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>{"Price and description"}</legend>
        <p className="muted form-section__sub">What you expect and why it stands out.</p>
        <div className="form-grid">
        <Field id="pf-price" label="Expected Price (₹)" error={shown.price}>
          <input {...props("price")} type="number" inputMode="numeric" min="1" />
        </Field>
        <Field id="pf-description" label="Description" error={shown.description} wide>
          <textarea {...props("description")} rows={3} />
        </Field>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Photos and videos</legend>
        <MediaUploader items={media} onChange={setMedia} />
      </fieldset>

      {submitted && Object.keys(errors).length > 0 && (
        <p className="field__error" role="alert">
          Please fix the highlighted fields and submit again.
        </p>
      )}

      <div className="actions form-actions">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? "Submitting…" : "List my property"}
        </button>
      </div>
    </form>
  );
}
