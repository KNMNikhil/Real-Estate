import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEMO_OTP } from "../data/dummyData";
import { KEYS, readJSON, removeKey, writeJSON } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJSON(KEYS.user, null));

  // Step 1 of login: remember the details and "send" an OTP (demo OTP is fixed).
  const requestOtp = useCallback((details) => {
    writeJSON(KEYS.pending, { ...details, otp: DEMO_OTP });
  }, []);

  const getPending = useCallback(() => readJSON(KEYS.pending, null), []);

  // Step 2: the OTP matched, so persist the user.
  const completeLogin = useCallback((details) => {
    const saved = { name: details.name, age: details.age, contact: details.contact };
    writeJSON(KEYS.user, saved);
    removeKey(KEYS.pending);
    setUser(saved);
  }, []);

  const logout = useCallback(() => {
    removeKey(KEYS.user);
    removeKey(KEYS.pending);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, requestOtp, getPending, completeLogin, logout }),
    [user, requestOtp, getPending, completeLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
