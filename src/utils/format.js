export const formatINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// 8500000 -> "85 Lakh", 14500000 -> "1.45 Crore"
export function formatPriceShort(n) {
  const value = Number(n);
  const trim = (x) => String(parseFloat(x.toFixed(2)));
  if (value >= 10000000) return `${trim(value / 10000000)} Crore`;
  if (value >= 100000) return `${trim(value / 100000)} Lakh`;
  return "";
}

export const maskedPhone = (contact) => `+91 XXXXX X${String(contact).slice(-4)}`;

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
