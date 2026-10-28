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

// Indian mobile number: exactly 10 digits, starts with 6-9.
export function validateContact(value) {
  const text = String(value ?? "").trim();
  if (!text) return "Please enter the mobile number.";
  if (!/^\d+$/.test(text)) return "The mobile number can only have digits (0-9).";
  if (text.length !== 10) return "The mobile number must be exactly 10 digits.";
  if (!/^[6-9]/.test(text)) return "The mobile number must start with 6, 7, 8 or 9.";
  if (/^(\d)\1{9}$/.test(text)) return "Please enter a real mobile number.";
  return "";
}

// Turns what was typed or pasted into up to 10 digits. Drops a leading +91 / 91 / 0.
export function cleanPhone(raw) {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length > 10 && d.startsWith("91")) d = d.slice(2);
  else if (d.length > 10 && d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
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

const EMAIL_RE =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;

// Common typos of popular providers, so people notice before they submit.
const TYPO_DOMAINS = {
  "gmial.com": "gmail.com", "gamil.com": "gmail.com", "gmai.com": "gmail.com", "gmail.con": "gmail.com",
  "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gnail.com": "gmail.com", "gmaill.com": "gmail.com",
  "yaho.com": "yahoo.com", "yahoo.con": "yahoo.com", "hotmial.com": "hotmail.com", "outlook.con": "outlook.com",
};

export function validateEmail(value) {
  const text = String(value ?? "").trim();
  if (!text) return "Please enter your email address.";
  if (/\s/.test(text)) return "The email address cannot have spaces.";
  if (text.length > 254) return "That email address is too long.";
  const at = text.indexOf("@");
  if (at === -1) return "The email address needs an @, like name@gmail.com.";
  if (text.indexOf("@", at + 1) !== -1) return "The email address can only have one @.";
  const local = text.slice(0, at);
  const domain = text.slice(at + 1).toLowerCase();
  if (!local) return "Please type the part before the @.";
  if (local.length > 64) return "The part before the @ is too long.";
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return "The part before the @ cannot start or end with a dot, or have two dots in a row.";
  }
  if (!domain) return "Please type the part after the @, like gmail.com.";
  if (!domain.includes(".")) return "The part after the @ needs a dot, like gmail.com.";
  if (TYPO_DOMAINS[domain]) return `Did you mean ${local}@${TYPO_DOMAINS[domain]}?`;
  if (!EMAIL_RE.test(text)) return "Please enter a valid email address, like name@gmail.com.";
  return "";
}
