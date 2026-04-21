"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TOAST_EVENT_NAME, type ToastPayload } from "@/lib/toast";

const TOAST_DURATION_MS = 2400;
const MAX_TOASTS = 4;

const INTENT_STYLES: Record<ToastPayload["intent"], { container: string; icon: string }> = {
  default: {
    container: "border-white/15 bg-[#0a0a0a]/95 text-white/85",
    icon: "text-white/50",
  },
  success: {
    container: "border-green-400/30 bg-green-400/[0.08] text-green-200",
    icon: "text-green-400",
  },
  error: {
    container: "border-red-400/35 bg-red-400/[0.08] text-red-200",
    icon: "text-red-400",
  },
  info: {
    container:
      "border-[rgba(var(--theme-primary-rgb),0.35)] bg-[rgba(var(--theme-primary-rgb),0.08)] text-[color:var(--theme-primary)]",
    icon: "text-[color:var(--theme-primary)]",
  },
};

function Icon({ intent }: { intent: ToastPayload["intent"] }) {
  const cls = INTENT_STYLES[intent].icon;
  const size = 14;
  switch (intent) {
    case "success":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={cls}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "error":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={cls}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      );
    case "info":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={cls}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
  }
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      if (!detail) return;
      setToasts((prev) => {
        const next = [...prev, detail];
        // Cap the visible stack — oldest falls off first.
        return next.slice(-MAX_TOASTS);
      });
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id));
      }, TOAST_DURATION_MS);
    };
    window.addEventListener(TOAST_EVENT_NAME, onToast);
    return () => window.removeEventListener(TOAST_EVENT_NAME, onToast);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[200] flex flex-col items-end gap-2"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const style = INTENT_STYLES[t.intent];
          return (
            <motion.div
              key={t.id}
              initial={{
                opacity: 0,
                x: shouldReduceMotion ? 0 : 28,
                y: shouldReduceMotion ? 8 : 4,
                scale: shouldReduceMotion ? 1 : 0.94,
              }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x: shouldReduceMotion ? 0 : 28,
                scale: shouldReduceMotion ? 1 : 0.9,
              }}
              transition={{
                type: "spring",
                stiffness: 430,
                damping: 32,
                mass: 0.7,
              }}
              role="status"
              className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-xl
                          text-sm font-mono shadow-[0_10px_30px_rgba(0,0,0,0.45)]
                          min-w-[180px] max-w-[340px] ${style.container}`}
            >
              <Icon intent={t.intent} />
              <span className="truncate">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
