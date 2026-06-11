"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function CSSUnitConverter() {
  const [value, setValue] = useState(16); const [baseFont, setBaseFont] = useState(16);
  const conversions = useMemo(() => ({
    px: value,
    rem: +(value / baseFont).toFixed(4),
    em: +(value / baseFont).toFixed(4),
    pt: +(value * 0.75).toFixed(2),
    vw: +((value / 1920) * 100).toFixed(4),
    vh: +((value / 1080) * 100).toFixed(4),
    "%": +((value / baseFont) * 100).toFixed(2),
    cm: +(value * 0.02646).toFixed(4),
  }), [value, baseFont]);
  return (
    <Section id="cssunit" title="CSS Unit Converter" desc="Convert between px, rem, em, pt, vw, vh, etc." accent="purple" index={13}>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Value (px)</label>
        <input type="number" value={value} onChange={(e) => setValue(+e.target.value||0)} className="tool-input neon-input w-24 text-center" />
        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Base font</label>
        <input type="number" value={baseFont} onChange={(e) => setBaseFont(+e.target.value||16)} className="tool-input neon-input w-24 text-center" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(conversions).map(([unit, val]) => (
          <motion.div key={unit} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] text-center cursor-pointer group" onClick={() => copyToClipboard(`${val}${unit}`)}>
            <div className="text-lg font-bold text-[var(--accent-purple)] font-[family-name:var(--font-heading)]">{val}</div>
            <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] mt-0.5">{unit}</div>
            <div className="text-[0.5rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1">click to copy</div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
