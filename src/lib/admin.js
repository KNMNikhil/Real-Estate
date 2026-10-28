import { rpc } from "./supabase";

// ---- sign in: admin email + password --------------------------------------
// Returns { token, email, expiresAt } or null when the email or password is wrong.
export async function adminLogin(email, password) {
  const res = await rpc("admin_login", { p_email: email.trim(), p_password: password });
  if (!res?.token) return null;
  return { token: res.token, email: res.email, expiresAt: Date.now() + (res.expiresIn ?? 43200) * 1000 };
}

export const adminLogout = (token) => rpc("admin_logout", { p_token: token }).catch(() => {});

// ---- admin data (every call is checked by the database) -------------------
const toAgent = (r) => ({
  id: r.id,
  name: r.name,
  pincode: r.pincode,
  areaName: r.area_name,
  contact: r.contact,
  altContact: r.alt_contact ?? "",
  email: r.email ?? "",
  address: r.address ?? "",
  photo: r.photo ?? "",
  tagline: r.tagline ?? "",
  createdAt: r.created_at,
});

const toDeal = (r) => ({
  id: r.id,
  agentId: r.consultant_id,
  agentName: r.consultant_name,
  kind: r.kind,
  label: r.property_name,
  date: r.appointment_date,
  status: r.status,
  called: !!r.called,
  calledAt: r.called_at,
  customerName: r.customer_name,
  customerEmail: r.customer_email,
  customerPhone: r.customer_phone,
  createdAt: r.created_at,
});

export const adminAgents = async (token) => (await rpc("admin_consultants", { p_token: token })).map(toAgent);
export const adminDeals = async (token) => (await rpc("admin_appointments", { p_token: token })).map(toDeal);

export const adminAddAgent = (token, a) =>
  rpc("admin_add_consultant", {
    p_token: token,
    p_name: a.name,
    p_pincode: a.pincode,
    p_area: a.areaName,
    p_contact: a.contact,
    p_email: a.email || null,
    p_address: a.address || null,
    p_photo: a.photo || null,
    p_password: a.password,
  });

export const adminDeleteAgent = (token, id) => rpc("admin_delete_consultant", { p_token: token, p_id: id });
export const adminSetPassword = (token, id, password) =>
  rpc("admin_set_password", { p_token: token, p_id: id, p_password: password });

// Friendly message for a failed admin call.
export function adminErrorMessage(e) {
  const m = String(e?.message ?? "");
  if (e?.unavailable) return "The admin database functions are not installed yet. Run supabase/admin_password_login.sql in the Supabase SQL editor.";
  if (e?.code === "28000" || e?.code === "42501") return "Your session has ended. Please sign in again.";
  if (/pincode_taken/.test(m)) return "A consultant already covers that PIN code.";
  if (/contact_taken/.test(m)) return "That contact number is already used by another consultant.";
  if (/password too short/.test(m)) return "The password must be at least 8 characters.";
  if (/invalid (pincode|contact|name|area)/.test(m)) return `Please check the ${m.replace("invalid ", "")}.`;
  return m || "Something went wrong. Please try again.";
}

export const isSessionError = (e) => e?.code === "28000" || e?.code === "42501";
