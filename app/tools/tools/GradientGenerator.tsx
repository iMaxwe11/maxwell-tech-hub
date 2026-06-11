"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function GradientGenerator() {
  const [c1, setC1] = useState("#06b6d4"); const [c2, setC2] = useState("#8b5cf6");
  const [angle, setAngle] = useState(135); const [type, setType] = useState<"linear"|"radial">("linear");
  const gradient = type === "linear" ? `linear-gradient(${angle}deg, ${c1}, ${c2})` : `radial-gradient(circle, ${c1}, ${c2})`;
  const css = `background: ${gradient};`;
  return (
    <Section id="gradient" title="Gradient Generator" desc="Create and copy beautiful CSS gradients." accent="cyan" index={20}>
      <div className="rounded-xl overflow-hidden mb-4 border border-white/[0.06]" style={{ background: gradient, height: 140 }} />
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <input type="color" value={c1} onChange={e => setC1(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
          <input className="tool-input neon-input w-24 text-center text-xs" value={c1} onChange={e => setC1(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input type="color" value={c2} onChange={e => setC2(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
          <input className="tool-input neon-input w-24 text-center text-xs" value={c2} onChange={e => setC2(e.target.value)} />
        </div>
        {type === "linear" && (<input type="range" min={0} max={360} value={angle} onChange={e => setAngle(+e.target.value)} className="flex-1 min-w-[80px] h-1 appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400" />)}
        {type === "linear" && <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] w-10">{angle}°</span>}
        {(["linear","radial"] as const).map(t => (<motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setType(t)}
          className={`px-3 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase transition-all ${type===t?"bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>{t}</motion.button>))}
      </div>
      <div className="rounded-lg bg-black/20 border border-white/[0.04] p-3 flex items-center justify-between group cursor-pointer" onClick={() => copyToClipboard(css)}>
        <code className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-mono)]">{css}</code>
        <span className="text-[0.55rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
      </div>
    </Section>
  );
}
