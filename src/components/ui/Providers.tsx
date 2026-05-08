"use client";

import { ToastProvider } from "@/hooks/useToast";
import Toaster from "./Toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}
