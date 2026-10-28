// Tiny Supabase REST client (PostgREST). The anon key is public by design;
// all access rules live in the database (see supabase/schema.sql).
const URL = (import.meta.env.VITE_SUPABASE_URL ?? "https://uhalumbpcljqoffrvktm.supabase.co").replace(/\/rest\/v1\/?$/, "");
const KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoYWx1bWJwY2xqcW9mZnJ2a3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MzUwNTIsImV4cCI6MjEwODIxMTA1Mn0.cWercmSORMtU3uFja9jzD0e115KVsrUPNmhV1-zqUWA";

export class DbError extends Error {
  constructor(message, { code, status, network = false } = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.network = network;
  }
  // The database or function has not been set up yet, or the network is down.
  get unavailable() {
    return this.network || this.code === "PGRST205" || this.code === "PGRST202" || this.status === 404;
  }
}

async function request(path, { method = "GET", body, headers = {}, token, base = "rest/v1" } = {}) {
  let res;
  try {
    res = await fetch(`${URL}/${base}/${path}`, {
      method,
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${token ?? KEY}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    throw new DbError("Could not reach the database.", { network: true });
  }
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new DbError(data?.message ?? data?.msg ?? data?.error_description ?? `Request failed (${res.status})`, { code: data?.code ?? data?.error_code, status: res.status });
  }
  return data;
}

export const rpc = (fn, args = {}, token) => request(`rpc/${fn}`, { method: "POST", body: args, token });
// Supabase Auth (email one-time codes). Used only by the admin login.
export const authPost = (path, body) => request(path, { method: "POST", body, base: "auth/v1" });
export const select = (table, query = "") => request(`${table}${query ? `?${query}` : ""}`);
export const insert = (table, row) =>
  request(table, { method: "POST", body: row, headers: { Prefer: "return=minimal" } });
