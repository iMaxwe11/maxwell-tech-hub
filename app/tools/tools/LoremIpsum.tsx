"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

export function LoremIpsum() {
  const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
  const [count, setCount] = useState(3); const [unit, setUnit] = useState<"paragraphs"|"sentences"|"words">("paragraphs"); const [output, setOutput] = useState("");
  function generate() {
    const randWords = (n: number) => Array.from({ length: n }, () => WORDS[Math.floor(Math.random()*WORDS.length)]).join(" ");
    const sentence = () => { const w = randWords(8 + Math.floor(Math.random()*8)); return w.charAt(0).toUpperCase() + w.slice(1) + "."; };
    const paragraph = () => Array.from({ length: 4 + Math.floor(Math.random()*4) }, sentence).join(" ");
    if (unit === "words") setOutput(randWords(count));
    else if (unit === "sentences") setOutput(Array.from({ length: count }, sentence).join(" "));
    else setOutput(Array.from({ length: count }, paragraph).join("\n\n"));
  }
  useEffect(() => { generate(); }, [count, unit]);
  return (
    <Section id="lorem" title="Lorem Ipsum" desc="Generate placeholder text." accent="purple" index={10}>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(+e.target.value||1)} className="tool-input neon-input w-20 text-center" />
        {(["paragraphs","sentences","words"] as const).map((u) => (<motion.button key={u} whileTap={{ scale:0.95 }} onClick={() => setUnit(u)}
          className={`px-3 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${unit===u?"bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] border border-[var(--accent-purple)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>{u}</motion.button>))}
        <motion.button whileTap={{ scale:0.9 }} className="tool-btn-primary tool-btn" onClick={generate}>Regenerate</motion.button>
      </div>
      <textarea className="tool-input min-h-[160px] resize-none bg-black/20 text-sm" readOnly value={output} />
      <motion.button whileTap={{ scale:0.9 }} className="tool-btn mt-3" onClick={() => copyToClipboard(output)}>Copy</motion.button>
    </Section>
  );
}
