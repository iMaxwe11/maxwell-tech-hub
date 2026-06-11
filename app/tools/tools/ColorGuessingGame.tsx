"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "../shared";

export function ColorGuessingGame() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [colors, setColors] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong" | null; shake?: boolean }>({ type: null });
  const [shaking, setShaking] = useState(false);

  const generateRound = useCallback(() => {
    const diffRange = [80, 60, 40, 20][Math.min(difficulty, 3)];
    const baseHue = Math.floor(Math.random() * 360);
    const targetColor = `hsl(${baseHue}, 100%, 50%)`;
    const shuffledColors = [
      targetColor,
      `hsl(${(baseHue + diffRange) % 360}, 100%, 50%)`,
      `hsl(${(baseHue - diffRange) % 360}, 100%, 50%)`,
    ].sort(() => Math.random() - 0.5);
    setColors(shuffledColors);
    setTarget(targetColor);
    setFeedback({ type: null });
    setShaking(false);
  }, [difficulty]);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handleGuess = (color: string) => {
    if (color === target) {
      setScore(score + 1);
      setStreak(streak + 1);
      setFeedback({ type: "correct" });
      setTimeout(() => {
        setDifficulty(Math.min(difficulty + 1, 3));
        generateRound();
      }, 800);
    } else {
      setFeedback({ type: "wrong", shake: true });
      setStreak(0);
      setShaking(true);
      setTimeout(() => {
        generateRound();
        setShaking(false);
      }, 1000);
    }
  };

  return (
    <Section id="colorgame" title="Color Guessing Game" desc="Match the hex color with one of three squares." accent="gold" index={26}>
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] mb-2">Match this color:</p>
          <motion.div animate={shaking ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.4 }} className="w-24 h-24 rounded-lg border-2 border-white/20" style={{ background: target }} />
        </div>

        <motion.div className="grid grid-cols-3 gap-4 w-full max-w-xs" animate={shaking ? { x: [-5, 5, -5, 0] } : {}}>
          {colors.map((color, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleGuess(color)}
              className="h-20 rounded-lg border-2 border-white/20 transition-all hover:border-white/40"
              style={{ background: color }}
              disabled={feedback.type !== null}
            />
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {feedback.type === "correct" && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="text-center px-4 py-2 bg-green-400/20 border border-green-400/40 rounded-lg"
            >
              <p className="text-green-400 font-bold text-sm font-[family-name:var(--font-heading)]">Correct!</p>
            </motion.div>
          )}
          {feedback.type === "wrong" && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="text-center px-4 py-2 bg-red-400/20 border border-red-400/40 rounded-lg"
            >
              <p className="text-red-400 font-bold text-sm font-[family-name:var(--font-heading)]">Wrong!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6 text-center w-full">
          <div className="flex-1">
            <div className="text-2xl font-bold text-[var(--accent-gold)] font-[family-name:var(--font-heading)]">{score}</div>
            <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Score</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-[var(--accent-cyan)] font-[family-name:var(--font-heading)]">{streak}</div>
            <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Streak</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-[var(--accent-purple)] font-[family-name:var(--font-heading)]">{difficulty + 1}</div>
            <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Level</div>
          </div>
        </div>
      </div>
    </Section>
  );
}
