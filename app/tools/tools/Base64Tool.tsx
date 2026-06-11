"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section, ShareButton, prefillFor } from "../shared";

export function Base64Tool() {
  const [input, setInput] = useState(() => prefillFor("base64") ?? "Hello, World!"); const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode"|"decode">("encode");
  function convert() { try { setOutput(mode === "encode" ? btoa(input) : atob(input)); } catch { setOutput("Error: Invalid input"); } }
  useEffect(() => { convert(); }, [input, mode]);
  return (
    <Section id="base64" title="Base64 Encoder / Decoder" desc="Encode or decode Base64 strings." accent="gold" index={8}>
      <div className="flex gap-2 mb-4">
        {(["encode","decode"] as const).map((m) => (<motion.button key={m} whileTap={{ scale:0.95 }} onClick={() => setMode(m)}
          className={`px-4 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${mode===m?"bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>{m}</motion.button>))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea className="tool-input neon-input min-h-[140px] resize-none" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input..." />
        <textarea className="tool-input min-h-[140px] resize-none bg-black/20" readOnly value={output} placeholder="Output..." />
      </div>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <motion.button whileTap={{ scale:0.9 }} className="tool-btn" onClick={() => copyToClipboard(output)}>Copy Output</motion.button>
        <ShareButton toolId="base64" value={input} />
      </div>
    </Section>
  );
}
