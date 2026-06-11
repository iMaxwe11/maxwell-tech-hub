"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "../shared";

export function Inspiration() {
  const ideas = ["What if UI elements behaved like liquids?","Turn keyboard input into ambient visuals.","Map Git commit history to sound and color.","Build a CSS-only particle system.","Create a terminal that responds to music.","Design a portfolio that looks like a game HUD.","Build a clock using only CSS animations.","Make a dark theme so dark it feels like space."];
  const [idx, setIdx] = useState(0);
  return (
    <Section id="inspo" title="Inspiration" desc="Quick idea spark." accent="gold" index={2}>
      <div className="flex items-center justify-between gap-4">
        <AnimatePresence mode="wait"><motion.div key={idx} initial={{ opacity: 0, x: -20, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: 20, filter: "blur(4px)" }} transition={{ duration: 0.4 }} className="text-[var(--text-primary)] text-base sm:text-lg font-[family-name:var(--font-heading)]">&ldquo;{ideas[idx]}&rdquo;</motion.div></AnimatePresence>
        <motion.button whileTap={{ scale: 0.9, rotate: 180 }} whileHover={{ scale: 1.1 }} className="tool-btn-primary tool-btn whitespace-nowrap" onClick={() => setIdx((idx + 1) % ideas.length)}>Next ↻</motion.button>
      </div>
      <div className="mt-4 flex gap-1.5 justify-center">{ideas.map((_, i) => (<motion.div key={i} animate={{ scale: i===idx?1.3:1, background: i===idx?"var(--accent-gold)":"rgba(255,255,255,0.1)" }} className="w-1.5 h-1.5 rounded-full cursor-pointer" onClick={() => setIdx(i)} />))}</div>
    </Section>
  );
}
