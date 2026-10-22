import { saveBooking, getBookedTimes as getLocalBookedTimes, isSlotTaken } from "../utils/bookings";
import { saveSubmittedProperty } from "../utils/lookup";
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
    if (!(e instanceof DbError && e.unavailable)) throw e;
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
export async function agentLogin(contact, password) {
  const res = await rpc("consultant_login", { p_contact: contact, p_password: password });
  return res ? { token: res.token, agent: res.consultant } : null; // null when details are wrong
}

export const agentLogout = (token) => rpc("consultant_logout", { p_token: token }).catch(() => {});

export async function agentAppointments(token) {
  const rows = await rpc("consultant_appointments", { p_token: token });
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    propertyId: r.property_id,
    propertyName: r.property_name,
    date: r.appointment_date,
    time: r.appointment_time,
    status: r.status,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerContact: r.customer_phone,
  }));
}
