"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section, ShareButton, prefillFor } from "../shared";

export function HashGenerator() {
  const [input, setInput] = useState(() => prefillFor("hash") ?? "Hello, World!"); const [hashes, setHashes] = useState<Record<string,string>>({});
  async function compute() {
    const enc = new TextEncoder().encode(input);
    const results: Record<string,string> = {};
    for (const algo of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]) {
      const buf = await crypto.subtle.digest(algo, enc);
      results[algo] = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    setHashes(results);
  }
  useEffect(() => { compute(); }, [input]);
  return (
    <Section id="hash" title="Hash Generator" desc="SHA-1/256/384/512 hashing." accent="gold" index={11}>
      <div className="mb-4 flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <input className="tool-input neon-input flex-1 min-w-0" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text to hash..." />
        <ShareButton toolId="hash" value={input} />
      </div>
      <div className="space-y-2">
        {Object.entries(hashes).map(([algo, hash]) => (
          <motion.div key={algo} whileHover={{ scale: 1.01 }} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/[0.04] group cursor-pointer" onClick={() => copyToClipboard(hash)}>
            <span className="text-xs text-[var(--accent-gold)] font-[family-name:var(--font-mono)] w-16 shrink-0">{algo}</span>
            <span className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-mono)] break-all flex-1 min-w-0">{hash}</span>
            <span className="text-[0.6rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">copy</span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
