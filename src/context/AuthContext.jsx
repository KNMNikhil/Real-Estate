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
    const accounts = readJSON(KEYS.accounts, {});
    writeJSON(KEYS.accounts, { ...accounts, [saved.contact]: saved });
    removeKey(KEYS.pending);
    setUser(saved);
  }, []);

  // Accounts that have completed sign up on this device, keyed by contact number.
  const findAccount = useCallback((contact) => readJSON(KEYS.accounts, {})[contact] ?? null, []);

  const logout = useCallback(() => {
    removeKey(KEYS.user);
    removeKey(KEYS.pending);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, requestOtp, getPending, completeLogin, findAccount, logout }),
    [user, requestOtp, getPending, completeLogin, findAccount, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
