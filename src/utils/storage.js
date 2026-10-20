// Thin, failure-tolerant wrapper around localStorage.
export const KEYS = {
  user: "lg_user",
  pending: "lg_pending_login",
  accounts: "lg_accounts",
  properties: "lg_properties",
  bookings: "lg_bookings",
};

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Returns true when the value was stored, false when storage is full/unavailable.
export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
