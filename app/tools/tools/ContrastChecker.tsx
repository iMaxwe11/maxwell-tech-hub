"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Section } from "../shared";

export function ContrastChecker() {
  const [fg, setFg] = useState("#ffffff"); const [bg, setBg] = useState("#1a1a2e");
  function hexToRgb(hex: string) { const m = hex.replace("#","").match(/.{2}/g); return m ? m.map(x => parseInt(x,16)) : [0,0,0]; }
  function luminance(r:number,g:number,b:number) { const [rs,gs,bs] = [r,g,b].map(c => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); }); return 0.2126*rs + 0.7152*gs + 0.0722*bs; }
  const ratio = useMemo(() => { const [r1,g1,b1] = hexToRgb(fg); const [r2,g2,b2] = hexToRgb(bg); const l1 = luminance(r1,g1,b1); const l2 = luminance(r2,g2,b2); return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)); }, [fg, bg]);
  const grade = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail";
  const gradeColor = ratio >= 4.5 ? "text-green-400" : ratio >= 3 ? "text-yellow-400" : "text-red-400";
  return (
    <Section id="contrast" title="Contrast Checker" desc="WCAG accessibility ratio." accent="cyan" index={6}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div><label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">Foreground</label>
            <div className="flex gap-2 mt-1"><input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-white/10" /><input className="tool-input neon-input flex-1" value={fg} onChange={(e) => setFg(e.target.value)} /></div></div>
          <div><label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">Background</label>
            <div className="flex gap-2 mt-1"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-white/10" /><input className="tool-input neon-input flex-1" value={bg} onChange={(e) => setBg(e.target.value)} /></div></div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl p-6 flex flex-col items-center justify-center text-center" style={{ background: bg, color: fg, border: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">Aa</span>
          <span className="text-sm mt-1">Sample Text</span>
          <span className={`text-xs mt-3 font-bold font-[family-name:var(--font-mono)] ${gradeColor}`}>{ratio.toFixed(2)}:1 — {grade}</span>
        </motion.div>
      </div>
    </Section>
  );
}
