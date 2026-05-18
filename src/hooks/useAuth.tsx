"use client";

import { createContext, useCallback, useContext, useState } from "react";
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

  const ensureAuth = useCallback((onDone: () => void) => {
    const current = api.getPassword();
    if (current) { onDone(); return; }
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
