"use client";

import { useToast } from "@/hooks/useToast";

export default function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto inline-flex items-center gap-3 px-4 py-2.5 font-sans text-sm rounded-md bg-ink-primary dark:bg-[#e8e0d5] text-page-cream dark:text-[#1a1814] shadow-none animate-[fadeUp_0.25s_ease] transition-opacity duration-200"
        >
          <span>{t.message}</span>
          {t.action && (
            <button
              onClick={() => {
                t.action!.onClick();
                dismiss(t.id);
              }}
              className="underline underline-offset-2 hover:no-underline font-medium flex-shrink-0"
            >
              {t.action.label}
            </button>
          )}
          <button
            onClick={() => dismiss(t.id)}
            className="text-page-cream/60 dark:text-[#1a1814]/60 hover:text-page-cream dark:hover:text-[#1a1814] flex-shrink-0 ml-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
