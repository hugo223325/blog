"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "@/lib/api";
import PasswordGate from "@/components/ui/PasswordGate";

interface AuthCtx {
  hasAuth: boolean;
  ensureAuth: (onDone: () => void) => void;
}

const AuthContext = createContext<AuthCtx>({ hasAuth: false, ensureAuth: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [pw, setPw] = useState(() => api.getPassword());
  const [pending, setPending] = useState<(() => void) | null>(null);

  const ensureAuth = useCallback(async (onDone: () => void) => {
    const current = api.getPassword();
    if (current) {
      try {
        const ok = await api.login(current);
        if (ok) { onDone(); return; }
        // login returned false — password wrong
        api.clearPassword();
        setPw("");
      } catch {
        // Network/auth error — try with new password
        api.clearPassword();
        setPw("");
      }
    }
    setPending(() => onDone);
  }, []);

  const handleSuccess = () => {
    setPw(api.getPassword() || "ok");
    if (pending) {
      const cb = pending;
      setPending(null);
      setTimeout(cb, 50);
    }
  };

  // Listen for 401-induced re-auth
  useEffect(() => {
    const handler = () => {
      api.clearPassword();
      setPw("");
    };
    window.addEventListener("auth-needed", handler);
    return () => window.removeEventListener("auth-needed", handler);
  }, []);

  return (
    <AuthContext.Provider value={{ hasAuth: !!pw, ensureAuth }}>
      {children}
      {pending && (
        <PasswordGate
          onSuccess={handleSuccess}
          onCancel={() => setPending(null)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
