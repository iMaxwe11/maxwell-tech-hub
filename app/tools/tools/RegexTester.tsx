"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Section, getErrorMessage } from "../shared";

export function RegexTester() {
  const [pattern, setPattern] = useState("\\w+"); const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Try matching multiple words: hello world_123!"); const [error, setError] = useState<string|null>(null);
  const matches = useMemo(() => { try { setError(null); return [...text.matchAll(new RegExp(pattern, flags))].map((match) => ({ match: match[0], index: match.index ?? 0 })); } catch (error) { setError(getErrorMessage(error)); return []; } }, [pattern, flags, text]);
  return (
    <Section id="regex" title="Regex Tester" desc="Test JavaScript regexes." accent="purple" index={4}>
      <div className="grid gap-3">
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <input className="tool-input neon-input flex-1 min-w-0" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Pattern" />
          <input className="tool-input neon-input w-20 sm:w-24" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="Flags" />
        </div>
        <textarea className="tool-input neon-input min-h-[120px] sm:min-h-[140px] resize-none" value={text} onChange={(e) => setText(e.target.value)} />
        {error ? (<motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-red-400 text-xs font-[family-name:var(--font-mono)]">{error}</motion.div>) : (
          <div className="text-sm text-[var(--text-secondary)]"><span className="text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Matches ({matches.length}):</span>{" "}
            <div className="flex flex-wrap gap-1 mt-1">{matches.map((m, i) => (<motion.span key={i} initial={{ opacity:0, scale:0.7, y:5 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ delay:i*0.04, type:"spring", stiffness:300 }} whileHover={{ scale:1.1, y:-2 }} className="inline-block bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 rounded-md px-2 py-1 text-xs font-[family-name:var(--font-mono)] cursor-default">{m.match}<span className="text-[var(--text-muted)]"> @{m.index}</span></motion.span>))}</div>
          </div>
        )}
      </div>
    </Section>
  );
}
