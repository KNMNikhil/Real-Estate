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

// booking: { consultantId, date, time, kind: "sell" | "buy", propertyId, userContact, userName, userEmail }
export function saveBooking(booking) {
  const all = getStoredBookings();
  all.push({ ...booking, id: `B${Date.now()}`, createdAt: new Date().toISOString() });
  return writeJSON(KEYS.bookings, all);
}

export const getUserBookingsRaw = () => getStoredBookings();

// Bookings made by one user, newest first.
export const getUserBookings = (contact) =>
  getStoredBookings()
    .filter((b) => b.userContact === contact)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// Demo mode only: bookings that were kept in this browser (the database had no such consultant).
// Shaped like the dashboard rows; ids are shared by the consultant and admin demo views.
export function browserBookingRows(consultantId) {
  let called = {};
  try {
    called = JSON.parse(localStorage.getItem("lg_agent_demo_called") || "{}");
  } catch {
    /* storage unavailable */
  }
  return getStoredBookings()
    .filter((b) => !consultantId || b.consultantId === consultantId)
    .map((b) => ({
      id: b.id,
      consultantId: b.consultantId,
      kind: b.kind,
      date: b.date,
      time: b.time,
      createdAt: b.createdAt,
      called: !!called[b.id],
      customerName: b.userName,
      customerEmail: b.userEmail,
      customerPhone: b.userContact,
    }));
}
