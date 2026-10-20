import { bookedSlots } from "../data/dummyData";
import { KEYS, readJSON, writeJSON } from "./storage";

const getStoredBookings = () => readJSON(KEYS.bookings, []);

// Times already taken for a consultant on a date: seed data + bookings saved in localStorage.
export function getBookedTimes(consultantId, date) {
  const seeded = bookedSlots[consultantId]?.[date] ?? [];
  const stored = getStoredBookings()
    .filter((b) => b.consultantId === consultantId && b.date === date)
    .map((b) => b.time);
  return [...new Set([...seeded, ...stored])];
}

export const isSlotTaken = (consultantId, date, time) =>
  getBookedTimes(consultantId, date).includes(time);

// booking: { consultantId, date, time, kind: "sell" | "buy", propertyId, userContact }
export function saveBooking(booking) {
  const all = getStoredBookings();
  all.push({ ...booking, id: `B${Date.now()}`, createdAt: new Date().toISOString() });
  return writeJSON(KEYS.bookings, all);
}
