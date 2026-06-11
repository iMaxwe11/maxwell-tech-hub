"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function BaseConverter() {
  const [value, setValue] = useState("255"); const [fromBase, setFromBase] = useState(10);
  const conversions = useMemo(() => {
    try {
      const num = parseInt(value, fromBase);
      if (isNaN(num)) return null;
      return { Decimal: num.toString(10), Binary: num.toString(2), Octal: num.toString(8), Hex: num.toString(16).toUpperCase() };
    } catch { return null; }
  }, [value, fromBase]);
  const bases = [{ label: "Dec", val: 10 }, { label: "Bin", val: 2 }, { label: "Oct", val: 8 }, { label: "Hex", val: 16 }];
  return (
    <Section id="baseconv" title="Number Base Converter" desc="Convert between decimal, binary, octal, and hex." accent="gold" index={19}>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <input className="tool-input neon-input flex-1 min-w-[120px]" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter number..." />
        <div className="flex gap-1">
          {bases.map(b => (<motion.button key={b.val} whileTap={{ scale: 0.95 }} onClick={() => setFromBase(b.val)}
            className={`px-3 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all ${fromBase===b.val?"bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>{b.label}</motion.button>))}
        </div>
      </div>
      {conversions ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(conversions).map(([label, val]) => (
            <motion.div key={label} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] text-center cursor-pointer group" onClick={() => copyToClipboard(val)}>
              <div className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">{label}</div>
              <div className="text-sm text-[var(--accent-gold)] font-[family-name:var(--font-mono)] mt-1 break-all">{val}</div>
              <div className="text-[0.5rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1">copy</div>
            </motion.div>
          ))}
        </div>
      ) : (<div className="text-xs text-red-400/60 font-[family-name:var(--font-mono)] p-3 rounded-lg bg-red-400/5 border border-red-400/10">Invalid number for selected base.</div>)}
    </Section>
  );
}
