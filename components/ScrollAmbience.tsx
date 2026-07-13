"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   SCROLL AMBIENCE — keeps long pages alive while scrolling.

   ScrollProgress  thin theme-gradient bar pinned to the viewport top
   SectionBeam     animated divider: draws in on view, then a glow
                   pulse travels along it on a slow loop
   AmbientOrbs     blurred theme-colored orbs parallaxing at different
                   rates behind the content, filling the dark gaps
                   between sections

   Everything is decorative (aria-hidden) and collapses to static or
   nothing under prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, var(--theme-primary), var(--theme-secondary))",
        boxShadow: "0 0 8px rgba(var(--theme-primary-rgb), 0.5)",
      }}
    />
  );
}

export function SectionBeam() {
  const reduced = useReducedMotion();

  if (reduced) {
    // Static equivalent of the old .section-divider, theme-tinted
    return (
      <div
        aria-hidden
        className="mx-auto max-w-[1200px] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(var(--theme-primary-rgb), 0.25) 50%, transparent)",
        }}
      />
    );
  }

  return (
    <div aria-hidden className="relative mx-auto max-w-[1200px] h-px">
      {/* Line draws outward from center as it scrolls into view */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0 origin-center"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(var(--theme-primary-rgb), 0.35) 50%, transparent)",
        }}
      />
      {/* Traveling glow pulse */}
      <motion.div
        className="absolute -top-px h-[3px] w-28 rounded-full blur-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--theme-primary), transparent)",
        }}
        initial={{ left: "-8%", opacity: 0 }}
        whileInView={{
          left: ["-8%", "104%"],
          opacity: [0, 0.9, 0.9, 0],
        }}
        viewport={{ once: false, margin: "-40px" }}
        transition={{
          duration: 4.5,
          times: [0, 0.12, 0.88, 1],
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export function AmbientOrbs() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -420]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 320]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -260]);

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        style={{ y: y1, background: "var(--theme-primary)" }}
        className="absolute top-[18%] -left-[8%] w-[46vw] max-w-[560px] aspect-square rounded-full opacity-[0.06] blur-[110px]"
      />
      <motion.div
        style={{ y: y2, background: "var(--theme-secondary)" }}
        className="absolute top-[46%] -right-[10%] w-[42vw] max-w-[520px] aspect-square rounded-full opacity-[0.05] blur-[110px]"
      />
      <motion.div
        style={{ y: y3, background: "var(--theme-primary)" }}
        className="absolute top-[74%] left-[22%] w-[38vw] max-w-[480px] aspect-square rounded-full opacity-[0.05] blur-[110px]"
      />
    </div>
  );
}
