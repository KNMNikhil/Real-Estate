import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { agentLogout } from "../lib/api";
import { KEYS, readJSON, removeKey, writeJSON } from "../utils/storage";

const AuthContext = createContext(null);

// Only agents sign in. Customers browse, buy and sell without an account.
// The stored session is { token, agent }; the token is checked by the database.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = readJSON(KEYS.agent, null);
    return saved?.token ? saved : null; // ignore old sessions without a token
  });

  const loginAgent = useCallback((next) => {
    writeJSON(KEYS.agent, next);
    setSession(next);
  }, []);

  const logoutAgent = useCallback(() => {
    if (session?.token) agentLogout(session.token);
    removeKey(KEYS.agent);
    setSession(null);
  }, [session]);

  const value = useMemo(
    () => ({ agent: session?.agent ?? null, token: session?.token ?? null, loginAgent, logoutAgent }),
    [session, loginAgent, logoutAgent]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
