import { consultants, moreProperties, properties } from "../data/dummyData";
import { KEYS, readJSON, writeJSON } from "./storage";

export const findConsultantByPin = (pin) =>
  consultants.find((c) => c.pincode === pin) ?? null;

export const findConsultantById = (id) =>
  consultants.find((c) => c.id === id) ?? null;

// Listings without photos get a demo image so cards and galleries are never blank.
const withPhoto = (p) =>
  p.images?.length
    ? p
    : { ...p, images: [`/properties/${(Array.from(String(p.id)).reduce((h, c) => h + c.charCodeAt(0), 0) % 10) + 1}.jpg`] };

const getSubmittedProperties = () => readJSON(KEYS.properties, []);

export const getAllProperties = () =>
  [...getSubmittedProperties(), ...properties, ...moreProperties].map(withPhoto);

export const findPropertyById = (id) =>
  getAllProperties().find((p) => p.id === id) ?? null;

// Newest first, including properties submitted by the user.
export const getPropertiesByPin = (pin) =>
  getAllProperties()
    .filter((p) => p.pincode === pin)
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

// Saves a user-submitted property. If photos make it overflow localStorage,
// retries without them so the listing itself is never lost.
export function saveSubmittedProperty(property) {
  const existing = getSubmittedProperties();
  if (writeJSON(KEYS.properties, [property, ...existing])) {
    return { ok: true, photosDropped: false };
  }
  if (writeJSON(KEYS.properties, [{ ...property, images: [] }, ...existing])) {
    return { ok: true, photosDropped: true };
  }
  return { ok: false, photosDropped: false };
}
