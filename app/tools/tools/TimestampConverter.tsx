"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function TimestampConverter() {
  const [ts, setTs] = useState(String(Math.floor(Date.now()/1000)));
  const [mode, setMode] = useState<"ts"|"date">("ts");
  const [dateStr, setDateStr] = useState("");
  const converted = useMemo(() => {
    if (mode === "ts") { const n = Number(ts); if (isNaN(n)) return "Invalid timestamp"; const d = new Date(n * (String(n).length <= 10 ? 1000 : 1)); return d.toString() === "Invalid Date" ? "Invalid timestamp" : d.toLocaleString() + " (UTC: " + d.toUTCString() + ")"; }
    else { try { const d = new Date(dateStr || Date.now()); return isNaN(d.getTime()) ? "Invalid date" : `Unix: ${Math.floor(d.getTime()/1000)}  ·  ms: ${d.getTime()}`; } catch { return "Invalid date"; } }
  }, [ts, dateStr, mode]);
  return (
    <Section id="timestamp" title="Timestamp Converter" desc="Unix ↔ human-readable." accent="gold" index={5}>
      <div className="flex gap-2 mb-4">
        {(["ts","date"] as const).map((m) => (<motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => setMode(m)}
          className={`px-4 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${mode===m?"bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>
          {m === "ts" ? "Unix → Date" : "Date → Unix"}</motion.button>))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:10 }}>
          {mode === "ts" ? (<input className="tool-input neon-input" value={ts} onChange={(e) => setTs(e.target.value)} placeholder="Enter Unix timestamp..." />)
            : (<input type="datetime-local" className="tool-input neon-input" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />)}
        </motion.div>
      </AnimatePresence>
      <motion.div layout className="mt-3 p-3 rounded-lg bg-black/20 border border-white/[0.04] text-sm text-[var(--text-secondary)] font-[family-name:var(--font-mono)] break-all">{converted}</motion.div>
      <div className="mt-3 flex gap-2">
        <motion.button whileTap={{ scale:0.9 }} className="tool-btn text-xs" onClick={() => setTs(String(Math.floor(Date.now()/1000)))}>Now</motion.button>
        <motion.button whileTap={{ scale:0.9 }} className="tool-btn text-xs" onClick={() => copyToClipboard(converted)}>Copy</motion.button>
      </div>
    </Section>
  );
}
