"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as api from "@/lib/api";
import PasswordGate from "@/components/ui/PasswordGate";

const AuthContext = createContext<{
  ensureAuth: (fn: () => void) => void;
}>({ ensureAuth: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [waiting, setWaiting] = useState<(() => void) | null>(null);

  const ensureAuth = useCallback((callback: () => void) => {
    const pw = api.getPassword();
    if (pw) {
      // Verify password is valid before proceeding
      api.login(pw).then(ok => {
        if (ok) { callback(); return; }
        // Invalid — clear and prompt
        api.clearPassword();
        setWaiting(() => callback);
      }).catch(() => {
        api.clearPassword();
        setWaiting(() => callback);
      });
      return;
    }
    // No password — prompt
    setWaiting(() => callback);
  }, []);

  const onPasswordOk = useCallback(() => {
    const cb = waiting;
    if (!cb) return;
    setWaiting(null);
    cb();
  }, [waiting]);

  useEffect(() => {
    const h = () => { api.clearPassword(); };
    window.addEventListener("auth-needed", h);
    return () => window.removeEventListener("auth-needed", h);
  }, []);

  return (
    <AuthContext.Provider value={{ ensureAuth }}>
      {children}
      {waiting && <PasswordGate onSuccess={onPasswordOk} onCancel={() => setWaiting(null)} />}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
