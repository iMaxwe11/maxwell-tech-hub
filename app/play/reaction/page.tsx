"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Phase = "idle" | "waiting" | "ready" | "result" | "tooearly";

export default function ReactionPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [reactionTime, setReactionTime] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [bestTime, setBestTime] = useState(0);
  const readyAt = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try { const b = localStorage.getItem("reaction-best"); if (b) setBestTime(+b); } catch {}
  }, []);

  const startWaiting = useCallback(() => {
    setPhase("waiting");
    const delay = 1500 + Math.random() * 3500; // 1.5-5s random delay
    timerRef.current = setTimeout(() => {
      readyAt.current = performance.now();
      setPhase("ready");
    }, delay);
  }, []);

  const handleClick = () => {
    if (phase === "idle") { startWaiting(); return; }
    if (phase === "waiting") {
      // Clicked too early
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("tooearly");
      return;
    }
    if (phase === "ready") {
      const ms = Math.round(performance.now() - readyAt.current);
      setReactionTime(ms);
      const newTimes = [...times, ms];
      setTimes(newTimes);
      if (bestTime === 0 || ms < bestTime) {
        setBestTime(ms);
        try { localStorage.setItem("reaction-best", String(ms)); } catch {}
      }
      setPhase("result");
      return;
    }
    if (phase === "result" || phase === "tooearly") { startWaiting(); }
  };

  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  const getRating = (ms: number) => {
    if (ms < 200) return { text: "Insane", color: "text-cyan-400" };
    if (ms < 250) return { text: "Excellent", color: "text-green-400" };
    if (ms < 350) return { text: "Good", color: "text-amber-400" };
    if (ms < 500) return { text: "Average", color: "text-orange-400" };
    return { text: "Slow", color: "text-red-400" };
  };

  const bgColor = phase === "waiting" ? "bg-red-900/30" : phase === "ready" ? "bg-green-900/40" : phase === "tooearly" ? "bg-red-900/40" : "bg-white/[0.02]";

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/play" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <span className="text-xs">&larr;</span>
            <span className="text-sm font-mono"><span className="text-green-400">MN</span><span className="text-white/30"> / </span>arcade<span className="text-white/30"> / </span>reaction</span>
          </Link>
        </div>
      </motion.nav>

      <div className="relative z-10 flex flex-col items-center gap-6 mt-14 w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 font-mono">REACTION TIME</h1>
          <p className="text-xs text-white/30 font-mono mt-2">How fast are you?</p>
        </motion.div>

        {/* Stats row */}
        {times.length > 0 && (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400 font-mono tabular-nums">{bestTime}ms</div>
              <div className="text-[10px] text-white/30 font-mono uppercase">Best</div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
              <div className="text-lg font-bold text-white/60 font-mono tabular-nums">{avg}ms</div>
              <div className="text-[10px] text-white/30 font-mono uppercase">Average</div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
              <div className="text-lg font-bold text-white/40 font-mono tabular-nums">{times.length}</div>
              <div className="text-[10px] text-white/30 font-mono uppercase">Tries</div>
            </div>
          </div>
        )}

        {/* Click area */}
        <motion.button
          onClick={handleClick}
          whileTap={{ scale: 0.98 }}
          className={`w-full h-64 sm:h-72 rounded-2xl border border-white/[0.08] transition-colors duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer select-none ${bgColor}`}
          style={{ boxShadow: phase === "ready" ? "0 0 60px rgba(16,185,129,0.15)" : "0 0 40px rgba(16,185,129,0.05)" }}
        >
          {phase === "idle" && (
            <>
              <div className="text-5xl">⚡</div>
              <p className="text-white/70 font-mono text-sm">Click to start</p>
            </>
          )}
          {phase === "waiting" && (
            <>
              <div className="text-4xl animate-pulse">🔴</div>
              <p className="text-red-400/80 font-mono text-sm font-bold">Wait for green...</p>
            </>
          )}
          {phase === "ready" && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2">
              <div className="text-5xl">🟢</div>
              <p className="text-green-400 font-mono text-lg font-bold">CLICK NOW!</p>
            </motion.div>
          )}
          {phase === "tooearly" && (
            <>
              <p className="text-red-400 font-mono text-lg font-bold">Too early!</p>
              <p className="text-white/40 font-mono text-xs">Click to try again</p>
            </>
          )}
          {phase === "result" && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2">
              <div className="text-5xl font-bold text-white font-mono">{reactionTime}<span className="text-lg text-white/40">ms</span></div>
              <p className={`font-mono text-sm font-bold ${getRating(reactionTime).color}`}>{getRating(reactionTime).text}</p>
              <p className="text-white/30 font-mono text-xs mt-2">Click to go again</p>
            </motion.div>
          )}
        </motion.button>

        {/* History bar chart */}
        {times.length > 1 && (
          <div className="w-full">
            <p className="text-[10px] text-white/20 font-mono uppercase tracking-wider mb-2">History</p>
            <div className="flex items-end gap-1 h-16">
              {times.slice(-20).map((t, i) => {
                const maxT = Math.max(...times.slice(-20));
                const h = Math.max(8, (t / maxT) * 100);
                const color = t < 200 ? "bg-cyan-400" : t < 300 ? "bg-green-400" : t < 400 ? "bg-amber-400" : "bg-red-400";
                return <div key={i} className={`${color} rounded-sm opacity-60 flex-1 min-w-[4px]`} style={{ height: `${h}%` }} title={`${t}ms`} />;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
