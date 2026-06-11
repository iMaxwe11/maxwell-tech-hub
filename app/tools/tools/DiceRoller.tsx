"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Section } from "../shared";

export function DiceRoller() {
  const [numDice, setNumDice] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const roll = () => {
    const newResults = Array.from({ length: numDice }, () => Math.floor(Math.random() * 6) + 1);
    setResults(newResults);
    const sum = newResults.reduce((a, b) => a + b, 0);
    setHistory([sum, ...history].slice(0, 15));
  };
  useEffect(() => {
    roll();
  }, []);
  const sum = results.reduce((a, b) => a + b, 0);
  return (
    <Section id="dice" title="Dice Roller" desc="Roll 1-6 dice with sum and history." accent="cyan" index={24}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 mb-2">
          <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Dice count</label>
          <input type="number" min={1} max={6} value={numDice} onChange={e => setNumDice(+e.target.value || 1)} className="tool-input neon-input w-20 text-center" />
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {results.map((result, i) => (
            <motion.div key={i} initial={{ rotateZ: Math.random() * 360, scale: 0 }} animate={{ rotateZ: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300 }} className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-2xl font-bold border-2 border-red-800 shadow-lg" title={`Die ${i + 1}`}>
              {result}
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <motion.p key={sum} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-3xl font-bold text-[var(--accent-cyan)] font-[family-name:var(--font-heading)] mb-3">
            Total: {sum}
          </motion.p>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn" onClick={roll}>
            Roll Dice
          </motion.button>
        </div>
        {history.length > 0 && (
          <div className="w-full">
            <p className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] mb-2">Roll History:</p>
            <div className="flex gap-1 flex-wrap">
              {history.map((h, i) => (
                <span key={i} className="px-2 py-1 rounded text-xs bg-black/20 border border-white/10 text-[var(--text-secondary)]">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
