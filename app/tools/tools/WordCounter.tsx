"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Section } from "../shared";

export function WordCounter() {
  const [text, setText] = useState("Paste or type your text here to see live statistics.");
  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length; const charsNoSpace = text.replace(/\s/g,"").length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
    const readMin = Math.ceil(words / 200);
    return { words, chars, charsNoSpace, sentences, paragraphs, readMin };
  }, [text]);
  return (
    <Section id="wordcount" title="Word Counter" desc="Live word, character, and reading time stats." accent="cyan" index={12}>
      <textarea className="tool-input neon-input min-h-[140px] resize-none mb-4" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste text..." />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {([["Words", stats.words], ["Chars", stats.chars], ["No Space", stats.charsNoSpace], ["Sentences", stats.sentences], ["Paras", stats.paragraphs], ["Read", `${stats.readMin}m`]] as const).map(([label, val]) => (
          <motion.div key={label} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] text-center">
            <div className="text-lg font-bold text-[var(--accent-cyan)] font-[family-name:var(--font-heading)]">{val}</div>
            <div className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
