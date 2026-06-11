"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Section } from "../shared";

export function CoinFlip() {
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [history, setHistory] = useState<Array<"heads" | "tails">>([]);
  const [streak, setStreak] = useState(0);
  const flip = () => {
    setFlipping(true);
    setResult(null);
    setTimeout(() => {
      const newResult = Math.random() > 0.5 ? "heads" : "tails";
      setResult(newResult);
      const newHistory = [newResult, ...history].slice(0, 10) as Array<"heads" | "tails">;
      setHistory(newHistory);
      const newStreak = newHistory[0] === newHistory[1] ? streak + 1 : 1;
      setStreak(newStreak);
      setFlipping(false);
    }, 1000);
  };
  const heads = history.filter(h => h === "heads").length;
  const headsPercent = history.length > 0 ? Math.round((heads / history.length) * 100) : 50;

  // End-state rotation: lands face-up on the result side. Spins 5 full turns (1800deg) plus
  // 180 if tails so tails ends up showing. Whole flip is one motion - no two-stage state hacks.
  const finalRotation = !flipping && result === "tails" ? 180 : 0;
  const flipRotation = flipping ? 1800 + (result === "tails" ? 180 : 0) : finalRotation;

  return (
    <Section id="coinflip" title="Coin Flip" desc="3D animated coin with streak tracker." accent="gold" index={23}>
      <div className="flex flex-col items-center gap-6">
        <div style={{ perspective: 1200 }} className="py-4">
          <motion.div
            onClick={flip}
            animate={{ rotateY: flipRotation, y: flipping ? [0, -40, 0] : 0 }}
            transition={{
              rotateY: { duration: flipping ? 1.1 : 0.4, ease: flipping ? "easeOut" : "easeInOut" },
              y: { duration: 1.1, ease: "easeOut", times: [0, 0.5, 1] },
            }}
            className="relative w-32 h-32 cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* HEADS face */}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                backfaceVisibility: "hidden",
                background:
                  "radial-gradient(circle at 35% 30%, #fde68a 0%, #f5c842 30%, #c9961a 70%, #8c6510 100%)",
                boxShadow:
                  "inset 0 -3px 8px rgba(0,0,0,0.35), inset 0 3px 4px rgba(255,255,255,0.55), 0 8px 16px rgba(0,0,0,0.4)",
              }}
            >
              {/* Inner ring */}
              <div
                className="absolute inset-3 rounded-full"
                style={{
                  border: "1.5px solid rgba(120,80,10,0.45)",
                  boxShadow: "inset 0 0 6px rgba(120,80,10,0.3)",
                }}
              />
              {/* Decorative dots around perimeter */}
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const r = 54;
                return (
                  <span
                    key={i}
                    aria-hidden
                    className="absolute w-[3px] h-[3px] rounded-full bg-amber-900/50"
                    style={{
                      left: `calc(50% + ${Math.cos(angle) * r}px - 1.5px)`,
                      top: `calc(50% + ${Math.sin(angle) * r}px - 1.5px)`,
                    }}
                  />
                );
              })}
              {/* Embossed H */}
              <span
                className="text-5xl font-black z-10"
                style={{
                  color: "#7a5510",
                  textShadow: "0 -1px 0 rgba(0,0,0,0.4), 0 1px 1px rgba(255,255,255,0.55)",
                  fontFamily: "var(--font-heading), serif",
                }}
              >
                H
              </span>
              {/* Star accent below H */}
              <span
                className="absolute text-[10px] text-amber-900/55"
                style={{ bottom: "20%", textShadow: "0 1px 0 rgba(255,255,255,0.4)" }}
              >
                ★
              </span>
            </div>

            {/* TAILS face — rotated 180deg on Y so it's the back */}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background:
                  "radial-gradient(circle at 35% 30%, #fde68a 0%, #f5c842 30%, #c9961a 70%, #8c6510 100%)",
                boxShadow:
                  "inset 0 -3px 8px rgba(0,0,0,0.35), inset 0 3px 4px rgba(255,255,255,0.55), 0 8px 16px rgba(0,0,0,0.4)",
              }}
            >
              <div
                className="absolute inset-3 rounded-full"
                style={{
                  border: "1.5px solid rgba(120,80,10,0.45)",
                  boxShadow: "inset 0 0 6px rgba(120,80,10,0.3)",
                }}
              />
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const r = 54;
                return (
                  <span
                    key={i}
                    aria-hidden
                    className="absolute w-[3px] h-[3px] rounded-full bg-amber-900/50"
                    style={{
                      left: `calc(50% + ${Math.cos(angle) * r}px - 1.5px)`,
                      top: `calc(50% + ${Math.sin(angle) * r}px - 1.5px)`,
                    }}
                  />
                );
              })}
              {/* Embossed T */}
              <span
                className="text-5xl font-black z-10"
                style={{
                  color: "#7a5510",
                  textShadow: "0 -1px 0 rgba(0,0,0,0.4), 0 1px 1px rgba(255,255,255,0.55)",
                  fontFamily: "var(--font-heading), serif",
                }}
              >
                T
              </span>
              {/* Laurel accents on either side of T */}
              <span
                className="absolute text-[8px] text-amber-900/55"
                style={{ left: "22%", textShadow: "0 1px 0 rgba(255,255,255,0.4)" }}
              >
                ❦
              </span>
              <span
                className="absolute text-[8px] text-amber-900/55"
                style={{ right: "22%", textShadow: "0 1px 0 rgba(255,255,255,0.4)" }}
              >
                ❦
              </span>
            </div>
          </motion.div>
        </div>

        <div className="text-center">
          {result && !flipping && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-bold text-white capitalize mb-2 font-[family-name:var(--font-heading)]"
            >
              {result}!
            </motion.p>
          )}
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn mb-4" onClick={flip}>
            {flipping ? "Flipping..." : "Flip Coin"}
          </motion.button>
        </div>
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>Streak: <span className="text-[var(--accent-gold)] font-bold">{streak}</span></span>
            <span>Last 10: <span className="text-[var(--accent-gold)]">{heads}</span>H / <span className="text-[var(--accent-gold)]">{history.length - heads}</span>T</span>
          </div>
          <div className="flex gap-1 h-6">
            {history.slice(0, 10).map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex-1 rounded ${h === "heads" ? "bg-[var(--accent-cyan)]" : "bg-[var(--accent-purple)]"} relative`} title={h} />
            ))}
          </div>
          {history.length > 0 && (
            <div className="text-xs text-center text-[var(--text-secondary)]">
              Heads: <span className="text-[var(--accent-gold)]">{headsPercent}%</span> | Tails: <span className="text-[var(--accent-gold)]">{100 - headsPercent}%</span>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
