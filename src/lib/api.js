import { browserBookingRows, saveBooking, getBookedTimes as getLocalBookedTimes, isSlotTaken } from "../utils/bookings";
import { saveSubmittedProperty } from "../utils/lookup";
import { consultants as staticConsultants } from "../data/dummyData";
import { DbError, insert, rpc, select } from "./supabase";

export class SlotTakenError extends Error {
  constructor() {
    super("That time slot was just taken. Please choose another time.");
  }
}

// ---- listings ---------------------------------------------------------
const toProperty = (r) => ({
  id: r.id,
  name: r.name,
  type: r.type,
  pincode: r.pincode,
  area: r.area,
  sqft: r.sqft,
  bedrooms: r.bedrooms,
  bathrooms: r.bathrooms,
  floor: r.floor,
  facing: r.facing,
  price: Number(r.price),
  address: r.address,
  description: r.description,
  images: r.images ?? [],
  consultantId: r.consultant_id,
  uploadedAt: r.created_at,
});

// Listings saved in the database. Returns null if the database is not available.
export async function fetchListings() {
  try {
    const rows = await select("properties", "select=*&order=created_at.desc");
    return rows.map(toProperty);
  } catch (e) {
    if (e instanceof DbError && e.unavailable) return null;
    throw e;
  }
}

// ---- slots and booking --------------------------------------------------
// Times already taken for an agent on a date.
export async function fetchBookedTimes(consultantId, date) {
  try {
    return await rpc("booked_times", { p_consultant: consultantId, p_date: date });
  } catch (e) {
    if (e instanceof DbError && e.unavailable) return getLocalBookedTimes(consultantId, date);
    throw e;
  }
}

// Saves the customer, the appointment and (when selling) the listing.
// Falls back to this browser's storage only when the database is unavailable.
export async function bookAppointment({ consultantId, kind, date, time, contact, property, propertyId, propertyName }) {
  try {
    await rpc("book_appointment", {
      p_consultant: consultantId,
      p_kind: kind,
      p_date: date,
      p_time: time,
      p_name: contact.name,
      p_email: contact.email,
      p_phone: contact.phone,
      p_property_id: propertyId ?? null,
      p_property_name: propertyName ?? null,
      p_property: property
        ? {
            id: property.id,
            name: property.name,
            type: property.type,
            pincode: property.pincode,
            area: property.area,
            sqft: property.sqft,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            floor: property.floor,
            facing: property.facing,
            price: property.price,
            address: property.address,
            description: property.description,
            images: property.images,
          }
        : null,
    });
    return { stored: "database" };
  } catch (e) {
    if (e instanceof DbError && /slot_taken/.test(e.message)) throw new SlotTakenError();
    // A consultant who is not in the database yet (e.g. his SQL has not been run) is handled like
    // an unavailable database: the booking is kept in this browser instead of showing an error.
    const notInDb = e instanceof DbError && /unknown consultant/.test(e.message);
    if (!(e instanceof DbError && e.unavailable) && !notInDb) throw e;
  }

  // Database not available: keep the booking in this browser.
  if (isSlotTaken(consultantId, date, time)) throw new SlotTakenError();
  let photosDropped = false;
  if (property) {
    const res = saveSubmittedProperty(property);
    if (!res.ok) throw new Error("Could not save the property (browser storage is full). Try removing some photos.");
    photosDropped = res.photosDropped;
  }
  saveBooking({
    consultantId,
    date,
    time,
    kind,
    propertyId: propertyId ?? property?.id,
    userContact: contact.phone,
    userName: contact.name,
    userEmail: contact.email,
  });
  return { stored: "browser", photosDropped };
}

// ---- contact messages ---------------------------------------------------
export async function sendContactMessage(m) {
  try {
    await insert("contact_messages", {
      name: m.name,
      email: m.email,
      phone: m.phone,
      message: m.message || null,
    });
    return { stored: "database" };
  } catch (e) {
    if (e instanceof DbError && e.unavailable) return { stored: "browser" };
    throw e;
  }
}

// ---- agent ----------------------------------------------------------------
// Demo consultant login (local dev server only): the sample consultants sign in with their contact
// number and Agent@<pincode>, even when the database has no such account. Nothing reaches the database.
const DEMO_AGENT_PREFIX = "demo-agent:";
const isDemoAgentToken = (t) => typeof t === "string" && t.startsWith(DEMO_AGENT_PREFIX);
const DEMO_CALLED_KEY = "lg_agent_demo_called";

function demoAgentLogin(contact, password) {
  if (!import.meta.env.DEV) return null;
  const c = staticConsultants.find(
    (x) => [x.contact, x.altContact].includes(contact) && password === `Agent@${x.pincode}`
  );
  return c ? { token: DEMO_AGENT_PREFIX + c.id, agent: { ...c, email: "" } } : null;
}

function demoAgentAppointments(token) {
  const agentId = token.slice(DEMO_AGENT_PREFIX.length);
  let called = {};
  try {
    called = JSON.parse(localStorage.getItem(DEMO_CALLED_KEY) || "{}");
  } catch {
    /* storage unavailable */
  }
  const day = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const people = [
    ["Ravi Kumar", "ravi@example.com", "9876543210", "buy", 0],
    ["Anitha S", "anitha@example.com", "9876501234", "sell", 1],
    ["Karthik M", "karthik@example.com", "9876505678", "buy", 3],
  ];
  const sample = people.map(([name, email, phone, kind, n], i) => {
    const id = `${token}-${i}`;
    return {
      id, kind, propertyId: null, propertyName: "Sample enquiry (demo)", date: day(n), time: `TBA-demo${i}`,
      status: "upcoming", called: !!called[id], customerName: name, customerEmail: email, customerContact: phone,
    };
  });
  // Real bookings made on the Buy / Sell pages for this consultant while the database had no account for them.
  const booked = browserBookingRows(agentId).map((b) => ({
    id: b.id, kind: b.kind, propertyId: null, propertyName: "Buy / Sell enquiry", date: b.date, time: b.time,
    status: "upcoming", called: b.called, customerName: b.customerName, customerEmail: b.customerEmail,
    customerContact: b.customerPhone,
  }));
  return [...booked, ...sample];
}

export async function agentLogin(contact, password) {
  let res = null;
  try {
    res = await rpc("consultant_login", { p_contact: contact, p_password: password });
  } catch (e) {
    if (!import.meta.env.DEV) throw e;
  }
  if (res) return { token: res.token, agent: res.consultant };
  return demoAgentLogin(contact, password); // null when details are wrong
}

export const agentLogout = (token) =>
  isDemoAgentToken(token) ? Promise.resolve() : rpc("consultant_logout", { p_token: token }).catch(() => {});

export async function agentAppointments(token) {
  if (isDemoAgentToken(token)) return demoAgentAppointments(token);
  const rows = await rpc("consultant_appointments", { p_token: token });
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    propertyId: r.property_id,
    propertyName: r.property_name,
    date: r.appointment_date,
    time: r.appointment_time,
    status: r.status,
    called: r.called, // undefined until supabase/admin.sql is installed
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerContact: r.customer_phone,
  }));
}

// Marks a customer as called (or not). Needs supabase/admin.sql; callers fall back to browser storage.
export const setAppointmentCalled = (token, id, called) => {
  if (isDemoAgentToken(token)) {
    try {
      const m = JSON.parse(localStorage.getItem(DEMO_CALLED_KEY) || "{}");
      m[id] = called;
      localStorage.setItem(DEMO_CALLED_KEY, JSON.stringify(m));
    } catch {
      /* storage unavailable */
    }
    return Promise.resolve();
  }
  return rpc("consultant_set_called", { p_token: token, p_appointment: id, p_called: called });
};

// ---- consultants shown on the website -----------------------------------
const toConsultant = (r) => ({
  id: r.id,
  name: r.name,
  pincode: r.pincode,
  areaName: r.area_name,
  contact: r.contact,
  altContact: r.alt_contact ?? "",
  address: r.address ?? "",
  photo: r.photo ?? "",
});

// Consultants from the database (so ones the admin adds appear). Falls back to the built-in samples.
export async function fetchConsultants() {
  try {
    const rows = await rpc("public_consultants");
    if (Array.isArray(rows) && rows.length >= 0) return rows.map(toConsultant);
  } catch (e) {
    if (!(e instanceof DbError)) throw e;
  }
  return staticConsultants;
}
