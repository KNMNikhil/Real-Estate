import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminLogout } from "../lib/admin";
import { KEYS, readJSON, removeKey, writeJSON } from "../utils/storage";

const AdminContext = createContext(null);
const KEY = KEYS.admin ?? "lg_admin";

// Admin session: { token, email, expiresAt } from the email + password login.
export function AdminProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = readJSON(KEY, null);
    return saved?.token && saved.expiresAt > Date.now() ? saved : null;
  });

  const loginAdmin = useCallback((next) => {
    writeJSON(KEY, next);
    setSession(next);
  }, []);

  const logoutAdmin = useCallback(() => {
    if (session?.token) adminLogout(session.token);
    removeKey(KEY);
    setSession(null);
  }, [session]);

  // Sign out automatically when the token expires.
  useEffect(() => {
    if (!session) return undefined;
    const t = setTimeout(logoutAdmin, Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(t);
  }, [session, logoutAdmin]);

  const value = useMemo(
    () => ({ admin: session ? { email: session.email } : null, token: session?.token ?? null, loginAdmin, logoutAdmin }),
    [session, loginAdmin, logoutAdmin]
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
