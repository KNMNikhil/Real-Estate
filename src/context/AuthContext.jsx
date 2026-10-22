import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { KEYS, readJSON, removeKey, writeJSON } from "../utils/storage";

const AuthContext = createContext(null);

// Only agents sign in. Customers browse, buy and sell without an account.
export function AuthProvider({ children }) {
  const [agent, setAgent] = useState(() => readJSON(KEYS.agent, null));

  const loginAgent = useCallback((consultant) => {
    writeJSON(KEYS.agent, consultant);
    setAgent(consultant);
  }, []);

  const logoutAgent = useCallback(() => {
    removeKey(KEYS.agent);
    setAgent(null);
  }, []);

  const value = useMemo(() => ({ agent, loginAgent, logoutAgent }), [agent, loginAgent, logoutAgent]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
