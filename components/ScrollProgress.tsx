"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin gradient progress bar fixed at the very top of the viewport.
 * Uses scroll position mapped through a spring for smooth motion.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left
                 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400
                 shadow-[0_0_8px_rgba(6,182,212,0.45)] pointer-events-none"
    />
  );
}
