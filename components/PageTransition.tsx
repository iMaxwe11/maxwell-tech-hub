"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Crossfade + lift transition between routes. Uses AnimatePresence with
 * mode="wait" so the outgoing page actually exits before the next mounts.
 *
 * ── Containing-block hazard — do not reintroduce ─────────────────────────
 * This wrapper sits above every page, including the fixed Navbar. Any
 * resting `filter`, `transform`, `perspective`, or `will-change` naming
 * those properties turns this div into a containing block for
 * position:fixed descendants (CSS spec), silently converting the Navbar
 * to absolute — it scrolled away with the page, leaving phones with no
 * reachable menu. The previous blur transition parked `filter: blur(0px)`
 * (blur(0) ≠ none!) plus a permanent inline `will-change` at rest, which
 * did exactly that. Animate only opacity + y here: framer-motion resolves
 * y:0 to `transform: none` at rest, which creates no containing block.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.42,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
