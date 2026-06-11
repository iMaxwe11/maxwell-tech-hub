"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section, ShareButton, prefillFor, getErrorMessage } from "../shared";

export function JSONFormatter() {
  const starterJson = '{"hello":"world","arr":[1,2,3]}';
  const [input, setInput] = useState(() => prefillFor("json") ?? starterJson);
  const [space, setSpace] = useState(2);
  const [error, setError] = useState<string|null>(null);
  const [output, setOutput] = useState(() => {
    try { return JSON.stringify(JSON.parse(prefillFor("json") ?? starterJson), null, 2); }
    catch { return prefillFor("json") ?? starterJson; }
  });
  function prettify() { try { setError(null); setOutput(JSON.stringify(JSON.parse(input), null, space)); } catch (error) { setError(getErrorMessage(error)); setOutput(""); } }
  function minify() { try { setError(null); setOutput(JSON.stringify(JSON.parse(input))); } catch (error) { setError(getErrorMessage(error)); setOutput(""); } }
  return (
    <Section id="json" title="JSON Formatter" desc="Validate, prettify, or minify." accent="cyan" index={3}>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="tool-input neon-input min-h-[200px] sm:min-h-[220px] resize-none" placeholder="Paste JSON here…" />
        <textarea value={output} readOnly className="tool-input min-h-[200px] sm:min-h-[220px] resize-none bg-black/20" placeholder="Output…" />
      </div>
      <AnimatePresence>{error && (<motion.div initial={{ opacity:0, y:-5, height:0 }} animate={{ opacity:1, y:0, height:"auto" }} exit={{ opacity:0 }} className="text-red-400 text-xs mt-2 font-[family-name:var(--font-mono)] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Error: {error}</motion.div>)}</AnimatePresence>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <label className="text-xs text-[var(--text-muted)]">Spaces</label>
        <input type="number" min={0} max={8} value={space} onChange={(e) => setSpace(parseInt(e.target.value||"0"))} className="tool-input w-16 text-center neon-input" />
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn-primary tool-btn" onClick={prettify}>Prettify</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn" onClick={minify}>Minify</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn" onClick={() => setInput('{"name":"maxwell","stack":["next","react","tailwind"],"status":"shipping"}')}>Load Sample</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn" onClick={() => copyToClipboard(output)}>Copy</motion.button>
        <ShareButton toolId="json" value={input} />
      </div>
    </Section>
  );
}
