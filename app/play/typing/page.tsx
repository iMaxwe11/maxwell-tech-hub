"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog near the riverbank.",
  "Every developer knows that debugging is twice as hard as writing code.",
  "Cloud infrastructure scales automatically when demand increases rapidly.",
  "TypeScript adds static typing to JavaScript for better developer experience.",
  "Containerized applications deploy consistently across all environments.",
  "Machine learning models require significant computational resources to train.",
  "A well-designed API makes integration simple and intuitive for developers.",
  "Version control systems track every change made to the codebase over time.",
  "Network security requires constant vigilance against evolving threats.",
  "Automated testing catches bugs before they reach production environments.",
  "The best code is code that never needs to be written in the first place.",
  "Kubernetes orchestrates containerized workloads across distributed systems.",
  "Documentation is a love letter you write to your future self and team.",
  "Premature optimization is the root of all evil in software engineering.",
  "Git branching strategies help teams collaborate without stepping on toes.",
  "Responsive design ensures applications work across all screen sizes.",
];

const DURATIONS = [30, 60, 120]; // seconds

type Phase = "menu" | "playing" | "done";

export default function TypingPage() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [duration, setDuration] = useState(30);
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalChars, setTotalChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTime = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try { const b = localStorage.getItem("typing-best"); if (b) setBestWpm(+b); } catch {}
  }, []);

  const generateText = useCallback(() => {
    const shuffled = [...SENTENCES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6).join(" ");
  }, []);

  const startGame = useCallback((dur: number) => {
    setDuration(dur);
    setTimeLeft(dur);
    const newText = generateText();
    setText(newText);
    setTyped("");
    setTotalChars(0);
    setCorrectChars(0);
    setWpm(0);
    setAccuracy(100);
    setPhase("playing");
    startTime.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [generateText]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(Math.ceil(remaining));
      if (remaining <= 0) {
        setPhase("done");
        clearInterval(timerRef.current!);
      }
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, duration]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase !== "playing") return;
    const val = e.target.value;
    setTyped(val);

    // Count correct characters
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === text[i]) correct++;
    }
    setTotalChars(val.length);
    setCorrectChars(correct);

    // Calculate WPM (standard: 5 chars = 1 word)
    const elapsed = (Date.now() - startTime.current) / 60000; // minutes
    if (elapsed > 0) {
      const words = correct / 5;
      setWpm(Math.round(words / elapsed));
    }
    setAccuracy(val.length > 0 ? Math.round((correct / val.length) * 100) : 100);

    // If reached end of text, generate more
    if (val.length >= text.length - 10) {
      setText(prev => prev + " " + generateText());
    }
  };

  // Save best on done
  useEffect(() => {
    if (phase === "done" && wpm > bestWpm) {
      setBestWpm(wpm);
      try { localStorage.setItem("typing-best", String(wpm)); } catch {}
    }
  }, [phase, wpm, bestWpm]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(244,63,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/play" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <span className="text-xs">&larr;</span>
            <span className="text-sm font-mono"><span className="text-rose-400">MN</span><span className="text-white/30"> / </span>arcade<span className="text-white/30"> / </span>typing</span>
          </Link>
        </div>
      </motion.nav>

      <div className="relative z-10 flex flex-col items-center gap-6 mt-14 w-full max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500 font-mono">TYPE RACER</h1>
          <p className="text-xs text-white/30 font-mono mt-2">How fast can you type?</p>
        </motion.div>

        {phase === "menu" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6">
            <div className="text-6xl">⌨️</div>
            {bestWpm > 0 && <p className="text-white/40 font-mono text-sm">Personal best: <span className="text-rose-400 font-bold">{bestWpm} WPM</span></p>}
            <p className="text-white/40 font-mono text-xs">Choose your duration:</p>
            <div className="flex gap-3">
              {DURATIONS.map(d => (
                <motion.button key={d} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startGame(d)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-mono font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-shadow">
                  {d}s
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "playing" && (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-6 w-full justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold font-mono tabular-nums ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-white/80"}`}>{timeLeft}s</div>
                <div className="text-[10px] text-white/30 font-mono uppercase">Time</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums">{wpm}</div>
                <div className="text-[10px] text-white/30 font-mono uppercase">WPM</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className={`text-2xl font-bold font-mono tabular-nums ${accuracy >= 95 ? "text-green-400" : accuracy >= 80 ? "text-amber-400" : "text-red-400"}`}>{accuracy}%</div>
                <div className="text-[10px] text-white/30 font-mono uppercase">Accuracy</div>
              </div>
            </div>

            {/* Text display */}
            <div className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 font-mono text-base sm:text-lg leading-relaxed h-40 overflow-hidden relative"
              onClick={() => inputRef.current?.focus()}>
              <div className="select-none">
                {text.split("").map((char, i) => {
                  let color = "text-white/30"; // untyped
                  if (i < typed.length) {
                    color = typed[i] === char ? "text-green-400" : "text-red-400 bg-red-400/10";
                  }
                  if (i === typed.length) color = "text-white bg-white/10 border-b-2 border-cyan-400"; // cursor
                  return <span key={i} className={color}>{char}</span>;
                })}
              </div>
            </div>

            {/* Hidden input */}
            <input ref={inputRef} type="text" value={typed} onChange={handleInput} autoFocus
              className="absolute opacity-0 w-0 h-0" aria-label="Type here" />

            <p className="text-[10px] text-white/20 font-mono">Click the text area to refocus if needed</p>
          </>
        )}

        {phase === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6">
            <p className="text-white/50 font-mono text-sm uppercase tracking-wider">Results</p>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-rose-400 font-mono tabular-nums">{wpm}</div>
                <div className="text-xs text-white/40 font-mono mt-1">WPM</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className={`text-3xl font-bold font-mono tabular-nums ${accuracy >= 95 ? "text-green-400" : accuracy >= 80 ? "text-amber-400" : "text-red-400"}`}>{accuracy}%</div>
                <div className="text-xs text-white/40 font-mono mt-1">Accuracy</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white/60 font-mono tabular-nums">{totalChars}</div>
                <div className="text-xs text-white/40 font-mono mt-1">Chars</div>
              </div>
            </div>

            {wpm >= bestWpm && wpm > 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-amber-400 font-mono text-sm font-bold animate-pulse">New Personal Best!</motion.p>
            )}

            <div className="flex gap-3">
              {DURATIONS.map(d => (
                <motion.button key={d} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startGame(d)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider">
                  {d}s Again
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
