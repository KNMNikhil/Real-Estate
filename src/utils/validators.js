// Each validator returns an error message, or "" when the value is valid.
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export function validatePin(value) {
  const pin = String(value ?? "").trim();
  if (!pin) return "Please enter the PIN code.";
  if (!/^\d+$/.test(pin)) return "PIN code must contain numbers only.";
  if (pin[0] === "0") return "PIN code cannot start with 0.";
  if (pin.length !== 6) return "PIN code must be exactly 6 digits.";
  return "";
}

export function validateName(value) {
  const name = String(value ?? "").trim();
  if (!name) return "Please enter the name.";
  if (name.length < 2) return "Name must be at least 2 characters.";
  if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(name)) return "Name can contain letters only.";
  return "";
}

export function validateAge(value) {
  const text = String(value ?? "").trim();
  if (!text) return "Please enter your age.";
  if (!/^\d+$/.test(text)) return "Age must be a whole number.";
  const age = Number(text);
  if (age < 18) return "You must be at least 18 years old.";
  if (age > 100) return "Please enter a valid age.";
  return "";
}

export function validateContact(value) {
  const text = String(value ?? "").trim();
  if (!text) return "Please enter the contact number.";
  if (!/^\d+$/.test(text)) return "Contact number must contain digits only.";
  if (text.length !== 10) return "Contact number must be exactly 10 digits.";
  if (!/^[6-9]/.test(text)) return "Contact number must start with 6, 7, 8 or 9.";
  return "";
}

export function validatePositiveNumber(value, label, { integer = false } = {}) {
  const text = String(value ?? "").trim();
  if (!text) return `Please enter ${label}.`;
  const n = Number(text);
  if (!Number.isFinite(n) || n <= 0) return `${cap(label)} must be greater than 0.`;
  if (integer && !Number.isInteger(n)) return `${cap(label)} must be a whole number.`;
  return "";
}

export function validateCount(value, label) {
  const text = String(value ?? "").trim();
  if (!text) return `Please enter ${label}.`;
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0 || n > 50) return `${cap(label)} must be a whole number from 0 to 50.`;
  return "";
}

export function validateRequired(value, label, minLength = 1) {
  const text = String(value ?? "").trim();
  if (!text) return `Please enter ${label}.`;
  if (text.length < minLength) return `${cap(label)} must be at least ${minLength} characters.`;
  return "";
}

export function validateEmail(value) {
  const text = String(value ?? "").trim();
  if (!text) return "Please enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) return "Please enter a valid email address.";
  return "";
}
