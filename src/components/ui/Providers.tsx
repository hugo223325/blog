"use client";

import { ToastProvider } from "@/hooks/useToast";
import { AuthProvider } from "@/hooks/useAuth";
import Toaster from "./Toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ToastProvider>
  );
}
