export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const todayISO = () => toISO(new Date());

export const byDateTime = (a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);

// Buy/sell requests carry no time slot; show something readable for those.
export const displayTime = (t) => (/^\d{2}:\d{2}$/.test(t) ? t : "Time to be arranged");
