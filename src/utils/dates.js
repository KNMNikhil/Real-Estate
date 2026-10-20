const pad = (n) => String(n).padStart(2, "0");

// All dates are handled as local "YYYY-MM-DD" strings to avoid timezone drift.
export const toISODate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseISODate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const todayISO = () => toISODate(new Date());

export const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISODate(d);
};

// Today and the past are never bookable; ISO strings compare correctly as text.
export const isBookableDate = (iso) =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso) && iso >= tomorrowISO();

export const formatLongDate = (iso) =>
  parseISODate(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatMonthYear = (year, month) =>
  new Date(year, month, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

export const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${suffix}`;
};

// Weeks (Sunday first) for a month; days outside the month are null.
export function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(first).fill(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toISODate(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
