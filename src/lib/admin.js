import { consultants as sampleConsultants } from "../data/dummyData";
import { browserBookingRows } from "../utils/bookings";
import { DbError, authPost, rpc } from "./supabase";

// ---- demo mode (local development server only) ----------------------------
// Lets you try the whole admin portal without Supabase: sample data kept in this browser.
// Never included in a production build (import.meta.env.DEV is false there).
export const DEMO_EMAIL = "admin@livinggods.demo";
export const DEMO_CODE = "123456";
export const DEMO_ENABLED = import.meta.env.DEV;
export const isDemoToken = (token) => token === "demo";
const isDemoEmail = (email) => DEMO_ENABLED && email.trim().toLowerCase() === DEMO_EMAIL;

const DEMO_KEY = "lg_admin_demo_v2"; // v2: sample data now includes PAFP Neethi (C005)
function demoLoad() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_KEY) || "null");
    if (saved?.agents) return saved;
  } catch {
    /* fall through to the seed data */
  }
  const day = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const agents = sampleConsultants.map((c, i) => ({
    id: c.id, name: c.name, pincode: c.pincode, areaName: c.areaName, contact: c.contact,
    email: `${c.name.split(" ")[0].toLowerCase()}@livinggods.in`, address: c.address, photo: c.photo,
    createdAt: day(-30 + i),
  }));
  const people = ["Ravi Kumar", "Anitha S", "Karthik R", "Divya M", "Suresh P", "Lakshmi N", "Vignesh T", "Priya K"];
  const deals = people.map((name, i) => {
    const a = agents[i % agents.length];
    return {
      id: `demo-${i}`, agentId: a.id, agentName: a.name, kind: i % 3 === 0 ? "sell" : "buy",
      label: `Enquiry in ${a.areaName} (${a.pincode})`, date: day(i - 3), status: "upcoming",
      called: i % 2 === 0, calledAt: null, customerName: name, customerEmail: `${name.split(" ")[0].toLowerCase()}@example.com`,
      customerPhone: `98765${String(43210 + i)}`, createdAt: day(-i),
    };
  });
  return { agents, deals };
}
const demoSave = (d) => {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
};

// ---- sign in: email one-time code (Supabase Auth) ------------------------
export async function sendAdminCode(email) {
  if (isDemoEmail(email)) return; // demo: no email is sent; the code is shown on the login page
  // create_user:false => only emails already created in Supabase can receive a code.
  await authPost("otp", { email, create_user: false });
}

export async function verifyAdminCode(email, code) {
  if (isDemoEmail(email)) {
    if (code !== DEMO_CODE) throw new DbError("Wrong demo code.");
    return { token: "demo", email: DEMO_EMAIL, expiresAt: Date.now() + 3600 * 1000 };
  }
  const res = await authPost("verify", { type: "email", email, token: code });
  if (!res?.access_token) throw new DbError("Could not verify the code.");
  return {
    token: res.access_token,
    email: res.user?.email ?? email,
    expiresAt: Date.now() + (res.expires_in ?? 3600) * 1000,
  };
}

// ---- admin data (every call is checked by the database) -------------------
const toAgent = (r) => ({
  id: r.id,
  name: r.name,
  pincode: r.pincode,
  areaName: r.area_name,
  contact: r.contact,
  email: r.email ?? "",
  address: r.address ?? "",
  photo: r.photo ?? "",
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

export const adminAgents = async (token) =>
  isDemoToken(token) ? demoLoad().agents : (await rpc("admin_consultants", {}, token)).map(toAgent);
// Demo mode: also lists bookings made on the Buy / Sell pages that were kept in this browser.
function demoDeals() {
  const { agents, deals } = demoLoad();
  const booked = browserBookingRows().map((b) => {
    const a = agents.find((x) => x.id === b.consultantId);
    return {
      id: b.id, agentId: b.consultantId, agentName: a?.name ?? b.consultantId, kind: b.kind,
      label: "Buy / Sell enquiry", date: b.date, status: "upcoming", called: b.called, calledAt: null,
      customerName: b.customerName, customerEmail: b.customerEmail, customerPhone: b.customerPhone,
      createdAt: b.createdAt,
    };
  });
  return [...booked, ...deals];
}
export const adminDeals = async (token) =>
  isDemoToken(token) ? demoDeals() : (await rpc("admin_appointments", {}, token)).map(toDeal);

export const adminAddAgent = async (token, a) => {
  if (isDemoToken(token)) {
    const d = demoLoad();
    if (d.agents.some((x) => x.pincode === a.pincode)) throw new Error("pincode_taken");
    if (d.agents.some((x) => x.contact === a.contact)) throw new Error("contact_taken");
    const n = Math.max(0, ...d.agents.map((x) => Number(String(x.id).replace(/\D/g, "")) || 0)) + 1;
    d.agents.push({
      id: `C${String(n).padStart(3, "0")}`, name: a.name, pincode: a.pincode, areaName: a.areaName,
      contact: a.contact, email: a.email || "", address: a.address || "", photo: a.photo || "",
      createdAt: new Date().toISOString(),
    });
    demoSave(d);
    return { id: `C${String(n).padStart(3, "0")}` };
  }
  return rpc(
    "admin_add_consultant",
    {
      p_name: a.name,
      p_pincode: a.pincode,
      p_area: a.areaName,
      p_contact: a.contact,
      p_email: a.email || null,
      p_address: a.address || null,
      p_photo: a.photo || null,
      p_password: a.password,
    },
    token
  );
};

export const adminDeleteAgent = async (token, id) => {
  if (isDemoToken(token)) {
    const d = demoLoad();
    demoSave({ agents: d.agents.filter((a) => a.id !== id), deals: d.deals.filter((x) => x.agentId !== id) });
    return;
  }
  return rpc("admin_delete_consultant", { p_id: id }, token);
};
export const adminSetPassword = async (token, id, password) => {
  if (isDemoToken(token)) return; // demo agents have no real login
  return rpc("admin_set_password", { p_id: id, p_password: password }, token);
};

// Friendly message for a failed admin call.
export function adminErrorMessage(e) {
  const m = String(e?.message ?? "");
  if (e?.unavailable) return "The admin database functions are not installed yet. Run supabase/admin.sql in the Supabase SQL editor.";
  if (e?.code === "42501" || /not authorised/i.test(m)) return "This email is not an admin.";
  if (/pincode_taken/.test(m)) return "A consultant already covers that PIN code.";
  if (/contact_taken/.test(m)) return "That contact number is already used by another consultant.";
  if (/password too short/.test(m)) return "The password must be at least 8 characters.";
  if (/invalid (pincode|contact|name|area)/.test(m)) return `Please check the ${m.replace("invalid ", "")}.`;
  return m || "Something went wrong. Please try again.";
}

export const isSessionError = (e) => e?.status === 401 || /jwt/i.test(String(e?.message ?? ""));
