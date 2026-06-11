"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Section } from "../shared";

export function PomodoroTimer() {
  const PRESETS = [
    { label: "25/5", work: 25, break: 5 },
    { label: "50/10", work: 50, break: 10 },
    { label: "90/15", work: 90, break: 15 },
  ] as const;
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>(PRESETS[0]);
  const [mode, setMode] = useState<"work"|"break">("work");
  const [seconds, setSeconds] = useState(PRESETS[0].work * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false);
            if (mode === "work") { setSessions(p => p + 1); setMode("break"); return preset.break * 60; }
            else { setMode("work"); return preset.work * 60; }
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [mode, preset.break, preset.work, running]);
  useEffect(() => {
    setRunning(false);
    setMode("work");
    setSeconds(preset.work * 60);
  }, [preset]);
  const reset = () => { setRunning(false); setMode("work"); setSeconds(preset.work * 60); };
  const mins = Math.floor(seconds/60); const secs = seconds%60;
  const pct = mode === "work" ? ((preset.work*60 - seconds) / (preset.work*60)) * 100 : ((preset.break*60 - seconds) / (preset.break*60)) * 100;
  return (
    <Section id="pomodoro" title="Pomodoro Timer" desc="Switch between focus presets, track completed rounds, and keep momentum." accent="gold" index={21}>
      <div className="flex flex-col items-center">
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {PRESETS.map((option) => (
            <motion.button
              key={option.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreset(option)}
              className={`px-3 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all ${
                preset.label === option.label
                  ? "bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20"
                  : "bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
        <div className="relative w-48 h-48 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={mode==="work" ? "var(--accent-gold)" : "var(--accent-cyan)"} strokeWidth="4" strokeDasharray={`${2*Math.PI*45}`} strokeDashoffset={`${2*Math.PI*45*(1-pct/100)}`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-white font-[family-name:var(--font-mono)] tabular-nums">{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</div>
            <div className={`text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider mt-1 ${mode==="work" ? "text-[var(--accent-gold)]" : "text-[var(--accent-cyan)]"}`}>{mode}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn" onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn" onClick={reset}>Reset</motion.button>
        </div>
        <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] text-center">
          Sessions completed: <span className="text-[var(--accent-gold)]">{sessions}</span> · Current cadence: {preset.work}m focus / {preset.break}m reset
        </div>
      </div>
    </Section>
  );
}
