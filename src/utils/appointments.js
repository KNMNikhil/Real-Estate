import { customerNames, consultants, timeSlots } from "../data/dummyData";
import { getAllProperties } from "./lookup";
import { getUserBookingsRaw } from "./bookings";

export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const todayISO = () => toISO(new Date());
const addDays = (base, n) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
};

// Small deterministic hash so the sample data is stable between renders.
const hash = (...nums) => {
  let h = 2166136261;
  nums.forEach((n) => {
    h ^= n + 0x9e37;
    h = Math.imul(h, 16777619);
    h ^= h >>> 13;
  });
  return Math.abs(h) % 1000003;
};

const DEMO_CONTACT = "9876543210";

// Sample appointments for every agent: 5 months back and 14 days ahead.
function buildSeed() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const props = getAllProperties();
  const out = [];
  consultants.forEach((c, ci) => {
    const own = props.filter((p) => p.consultantId === c.id);
    for (let off = -120; off <= 13; off += 1) {
      const date = toISO(addDays(today, off));
      const weekend = addDays(today, off).getDay() % 6 === 0;
      const count = weekend ? (hash(ci, off) % 4 === 0 ? 1 : 0) : 1 + (hash(ci, off) % 2); // quieter weekends
      for (let k = 0; k < count; k += 1) {
        const h = hash(ci, off, k);
        const kind = Math.floor(h / 5) % 3 === 0 ? "sell" : "buy";
        const ni = Math.floor(h / 11) % customerNames.length;
        const name = customerNames[ni];
        out.push({
          id: `S-${c.id}-${off}-${k}`,
          consultantId: c.id,
          customerName: name,
          customerContact: ni === 0 ? DEMO_CONTACT : `98${String(40000000 + ni * 1234567).slice(0, 8)}`,
          kind,
          propertyId: own.length ? own[h % own.length].id : null,
          date,
          time: timeSlots[(hash(ci, off) + k * 5) % timeSlots.length],
          status: off < 0 ? "completed" : "upcoming",
        });
      }
    }
  });
  return out;
}

let seedCache = null;
const seed = () => (seedCache ??= buildSeed());

// Real bookings (from Buy/Sell) mapped into the same shape.
function stored() {
  const today = todayISO();
  return getUserBookingsRaw().map((b) => ({
    id: b.id,
    consultantId: b.consultantId,
    customerName: b.userName ?? "Customer",
    customerContact: b.userContact,
    kind: b.kind,
    propertyId: b.propertyId,
    date: b.date,
    time: b.time,
    status: b.date < today ? "completed" : "upcoming",
  }));
}

export const getAllAppointments = () => [...stored(), ...seed()];
export const getAppointmentsForCustomer = (contact) =>
  getAllAppointments().filter((a) => a.customerContact === contact);
export const getAppointmentsForAgent = (consultantId) =>
  getAllAppointments().filter((a) => a.consultantId === consultantId);

export const byDateTime = (a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
