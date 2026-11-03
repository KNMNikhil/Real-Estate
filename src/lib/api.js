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

// ---- TBC (Team Buying Concept) enquiries ------------------------------------
const TBC_KEY = "lg_tbc_enquiries";
const readTbcLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(TBC_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeTbcLocal = (rows) => {
  try {
    localStorage.setItem(TBC_KEY, JSON.stringify(rows));
  } catch {
    /* storage unavailable */
  }
};

// Saves the enquiry for the consultant. When the database cannot take it (functions not installed,
// or the consultant is not in it yet) it is kept in this browser, where the demo dashboard shows it.
export async function submitTbcEnquiry({ consultantId, name, email, phone, team, members, project, note }) {
  try {
    await rpc("submit_tbc_enquiry", {
      p_consultant: consultantId,
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_team: team,
      p_members: members ? Number(members) : null,
      p_project: project || null,
      p_note: note || null,
    });
    return { stored: "database" };
  } catch (e) {
    const missing = e instanceof DbError && (e.unavailable || /unknown consultant/.test(e.message));
    if (!missing) throw e;
  }
  const rows = readTbcLocal();
  rows.push({
    id: `T${Date.now()}`, consultantId, name, email, phone, team, members: members || "", project: project || "",
    note: note || "", called: false, createdAt: new Date().toISOString(),
  });
  writeTbcLocal(rows);
  return { stored: "browser" };
}

const toTbc = (r) => ({
  id: r.id, name: r.name, email: r.email, phone: r.phone, team: r.team_code, members: r.members ?? "",
  project: r.project ?? "", note: r.note ?? "", called: !!r.called, createdAt: r.created_at,
});

function demoTbcEnquiries(token) {
  const agentId = token.slice(DEMO_AGENT_PREFIX.length);
  const ago = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();
  const sample = [
    { id: `${token}-t0`, name: "Meenakshi R", email: "meenakshi@example.com", phone: "9876512340", team: "RI", members: 4, project: "Baba Pasumai Nagar", note: "Family of four relatives, interested in plots.", called: false, createdAt: ago(5) },
    { id: `${token}-t1`, name: "Arjun V", email: "arjun@example.com", phone: "9876512341", team: "FI", members: 6, project: "", note: "", called: false, createdAt: ago(30) },
  ];
  let ticked = {};
  try {
    ticked = JSON.parse(localStorage.getItem(DEMO_CALLED_KEY) || "{}");
  } catch {
    /* storage unavailable */
  }
  const mine = readTbcLocal().filter((r) => r.consultantId === agentId);
  return [...mine, ...sample.map((r) => ({ ...r, called: !!ticked[r.id] }))];
}

export async function agentTbcEnquiries(token, agentId) {
  if (isDemoAgentToken(token)) return demoTbcEnquiries(token);
  try {
    return (await rpc("consultant_tbc_enquiries", { p_token: token })).map(toTbc);
  } catch (e) {
    if (!(e instanceof DbError && e.unavailable)) throw e;
    // supabase/tbc.sql is not installed yet: show what was kept in this browser, marked as such.
    return readTbcLocal().filter((r) => r.consultantId === agentId).map((r) => ({ ...r, viaBrowser: true }));
  }
}

export function setTbcCalled(token, id, called) {
  const rows = readTbcLocal();
  const hit = rows.find((r) => r.id === id);
  if (hit) {
    hit.called = called;
    writeTbcLocal(rows);
    return Promise.resolve();
  }
  if (isDemoAgentToken(token)) {
    // sample rows are not stored: remember their tick in the demo "called" map
    const m = JSON.parse(localStorage.getItem(DEMO_CALLED_KEY) || "{}");
    m[id] = called;
    localStorage.setItem(DEMO_CALLED_KEY, JSON.stringify(m));
    return Promise.resolve();
  }
  return rpc("consultant_set_tbc_called", { p_token: token, p_id: id, p_called: called });
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
  tagline: r.tagline ?? "",
});

// Consultants from the database (so ones the admin adds appear). Falls back to the built-in samples.
export async function fetchConsultants() {
  try {
    const rows = await rpc("public_consultants");
    if (Array.isArray(rows)) {
      // Keep the built-in tagline until the database has one.
      return rows.map(toConsultant).map((c) => ({ ...c, tagline: c.tagline || staticConsultants.find((s) => s.id === c.id)?.tagline || "" }));
    }
  } catch (e) {
    if (!(e instanceof DbError)) throw e;
  }
  return staticConsultants;
}
