"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function GeneratorKit() {
  const [uuid, setUuid] = useState(""); const [pw, setPw] = useState(""); const [pwLen, setPwLen] = useState(20);
  const [upper, setUpper] = useState(true); const [nums, setNums] = useState(true); const [syms, setSyms] = useState(true);
  function genUUID() { setUuid(crypto.randomUUID()); }
  function genPW() { let chars = "abcdefghijklmnopqrstuvwxyz"; if (upper) chars+="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; if (nums) chars+="0123456789"; if (syms) chars+="!@#$%^&*()_+-=[]{}|;:,./<>?"; const arr = new Uint32Array(pwLen); crypto.getRandomValues(arr); setPw(Array.from(arr, v => chars[v % chars.length]).join("")); }
  useEffect(() => { genUUID(); genPW(); }, []);
  return (
    <Section id="generator" title="Generator Kit" desc="UUID v4 + secure passwords." accent="purple" index={7}>
      <div className="space-y-5">
        <div>
          <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2 block">UUID v4</label>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap"><input className="tool-input neon-input flex-1 min-w-0" readOnly value={uuid} />
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn-primary tool-btn whitespace-nowrap" onClick={genUUID}>Generate</motion.button>
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn whitespace-nowrap" onClick={() => copyToClipboard(uuid)}>Copy</motion.button></div>
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2 block">Password ({pwLen} chars)</label>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap"><input className="tool-input neon-input flex-1 min-w-0" readOnly value={pw} />
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn-primary tool-btn whitespace-nowrap" onClick={genPW}>Generate</motion.button>
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn whitespace-nowrap" onClick={() => copyToClipboard(pw)}>Copy</motion.button></div>
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <label className="text-xs text-[var(--text-muted)]">Length <input type="number" min={6} max={64} value={pwLen} onChange={(e) => setPwLen(+e.target.value||16)} className="tool-input w-16 text-center ml-1 neon-input" /></label>
            {[["A-Z", upper, setUpper], ["0-9", nums, setNums], ["!@#", syms, setSyms]].map(([label, val, setter]: any) => (
              <label key={label} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer">
                <motion.div whileTap={{ scale:0.8 }} className={`w-4 h-4 rounded border transition-all cursor-pointer flex items-center justify-center ${val?"bg-[var(--accent-purple)] border-[var(--accent-purple)]":"border-white/20"}`} onClick={() => setter(!val)}>
                  {val && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                </motion.div>{label}</label>))}
          </div>
        </div>
      </div>
    </Section>
  );
}
