"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

type Phase = "menu" | "diff-select" | "showing" | "input" | "correct" | "wrong";
type Difficulty = "easy" | "medium" | "hard";

export default function MemoryPage() {
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("menu");
  const [bestLevel, setBestLevel] = useState(0);
  const [showingIndex, setShowingIndex] = useState(-1);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (phase !== "showing" && phase !== "input") return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(interval);
  }, [phase, startTime]);

  // No localStorage per requirements - bestLevel stays in session

  const tileCount = useCallback(() => Math.min(3 + Math.floor((level - 1) / 2), gridSize * gridSize - 1), [level, gridSize]);

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setLevel(1); setGridSize(3); setSelected([]);
    const speeds = { easy: 800, medium: 500, hard: 300 };
    // speeds are used in the showing phase effects
    const count = Math.min(3, 8);
    const tiles: number[] = [];
    while (tiles.length < count) {
      const r = Math.floor(Math.random() * 9);
      if (!tiles.includes(r)) tiles.push(r);
    }
    setPattern(tiles);
    setStartTime(Date.now());
    setElapsedTime(0);
    setPhase("showing");
    setShowingIndex(0);
  }, []);

  const nextLevel = useCallback(() => {
    const newLevel = level + 1;
    const newGrid = newLevel <= 3 ? 3 : newLevel <= 7 ? 4 : 5;
    const total = newGrid * newGrid;
    const count = Math.min(3 + Math.floor((newLevel - 1) / 2), total - 1);
    const tiles: number[] = [];
    while (tiles.length < count) {
      const r = Math.floor(Math.random() * total);
      if (!tiles.includes(r)) tiles.push(r);
    }
    setLevel(newLevel);
    setGridSize(newGrid);
    setPattern(tiles);
    setSelected([]);
    setPhase("showing");
    setShowingIndex(0);
  }, [level]);

  // Animate showing phase: reveal tiles one by one then hide
  useEffect(() => {
    if (phase !== "showing") return;
    const speeds = { easy: 800, medium: 500, hard: 300 };
    if (showingIndex < pattern.length) {
      const t = setTimeout(() => setShowingIndex(showingIndex + 1), speeds[difficulty]);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setShowingIndex(-1); setPhase("input"); }, 600);
      return () => clearTimeout(t);
    }
  }, [phase, showingIndex, pattern.length, difficulty]);

  const handleTileClick = (i: number) => {
    if (phase !== "input" || selected.includes(i)) return;
    const newSelected = [...selected, i];
    setSelected(newSelected);

    if (!pattern.includes(i)) {
      // Wrong!
      setPhase("wrong");
      const best = Math.max(level - 1, bestLevel);
      setBestLevel(best);
      return;
    }

    if (newSelected.length === pattern.length) {
      // All correct!
      setPhase("correct");
      const best = Math.max(level, bestLevel);
      setBestLevel(best);
      setTimeout(nextLevel, 800);
    }
  };

  const isRevealed = (i: number) => {
    if (phase === "showing") return pattern.slice(0, showingIndex).includes(i);
    if (phase === "correct") return pattern.includes(i);
    if (phase === "wrong") return pattern.includes(i) || selected.includes(i);
    return false;
  };

  const tileColor = (i: number) => {
    if (phase === "input" && selected.includes(i)) return "bg-cyan-500/60 border-cyan-400/80";
    if (phase === "wrong" && selected.includes(i) && !pattern.includes(i)) return "bg-red-500/50 border-red-400/80";
    if (isRevealed(i)) return "bg-amber-500/50 border-amber-400/70";
    return "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15]";
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <Navbar breadcrumb={["arcade", "memory"]} accent="#f59e0b" />

      <div className="absolute top-20 right-4 z-20">
        <Link href="/play" className="px-4 py-2 text-xs font-mono text-amber-400 border border-amber-400/40 rounded hover:bg-amber-400/10 transition-colors">
          ← Back to Arcade
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 mt-14">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 font-mono">MEMORY MATRIX</h1>
          <p className="text-xs text-white/30 font-mono mt-2">Remember the pattern</p>
        </motion.div>

        {/* Stats */}
        {phase !== "menu" && (
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">{level}</div>
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Level</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 font-mono tabular-nums">{bestLevel}</div>
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Best</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white/60 font-mono tabular-nums">{elapsedTime}s</div>
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Time</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">{pattern.length}</div>
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Tiles</div>
            </div>
          </div>
        )}

        {/* Grid */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-xl overflow-hidden p-1"
          style={{ boxShadow: "0 0 40px rgba(245,158,11,0.08)" }}>
          {phase === "menu" ? (
            <div className="w-72 h-72 sm:w-80 sm:h-80 flex flex-col items-center justify-center gap-4 bg-black/40 rounded-xl border border-white/[0.06]">
              <div className="text-6xl">🧠</div>
              <p className="text-[10px] text-white/40 font-mono">Choose Difficulty:</p>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map(d => (
                  <motion.button
                    key={d}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startGame(d)}
                    className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-500/30"
                  >
                    {d}
                  </motion.button>
                ))}
              </div>
              <p className="text-[10px] text-white/30 font-mono">Watch, then recall</p>
            </div>
          ) : (
            <div className="w-72 h-72 sm:w-80 sm:h-80 gap-1.5 bg-black/20 rounded-xl border border-white/[0.06] p-3"
              style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                <motion.button
                  key={`${level}-${gridSize}-${i}`}
                  whileTap={phase === "input" ? { scale: 0.92 } : {}}
                  onClick={() => handleTileClick(i)}
                  initial={{ rotateY: 0 }}
                  animate={{
                    rotateY: isRevealed(i) ? 0 : 180,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`rounded-lg border transition-all duration-200 ${tileColor(i)} ${phase === "input" && !selected.includes(i) ? "cursor-pointer" : "cursor-default"}`}
                  style={{
                    perspective: "1000px",
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Phase status */}
        <AnimatePresence mode="wait">
          {phase === "showing" && (
            <motion.p key="showing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-amber-400/80 text-sm font-mono animate-pulse">Memorize the pattern...</motion.p>
          )}
          {phase === "input" && (
            <motion.p key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-cyan-400/80 text-sm font-mono">Click the tiles! ({selected.length}/{pattern.length})</motion.p>
          )}
          {phase === "correct" && (
            <motion.p key="correct" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-green-400 text-sm font-mono font-bold">Correct! Next level...</motion.p>
          )}
          {phase === "wrong" && (
            <motion.div key="wrong" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3">
              <p className="text-red-400 text-sm font-mono font-bold">Wrong!</p>
              <div className="text-white/60 font-mono text-xs space-y-1">
                <p>Level Reached: {level}</p>
                <p>Time: {elapsedTime}s</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => startGame(difficulty)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-mono font-bold text-xs uppercase tracking-wider">
                Try Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
