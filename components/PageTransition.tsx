"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Crossfade + subtle blur transition between routes. Uses AnimatePresence
 * with mode="wait" so the outgoing page actually exits before the next one
 * mounts — the previous implementation just remounted on `key` change, which
 * produced a visible snap.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{
          opacity: 0,
          y: shouldReduceMotion ? 0 : 14,
          filter: shouldReduceMotion ? "blur(0px)" : "blur(4px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        exit={{
          opacity: 0,
          y: shouldReduceMotion ? 0 : -6,
          filter: shouldReduceMotion ? "blur(0px)" : "blur(3px)",
        }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.42,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{
          willChange: shouldReduceMotion ? undefined : "transform, opacity, filter",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
