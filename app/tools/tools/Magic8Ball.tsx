"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Section } from "../shared";

export function Magic8Ball() {
  const responses = [
    "It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely on it",
    "As I see it yes", "Most likely", "Outlook good", "Yes", "Signs point to yes",
    "Reply hazy try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again",
    "Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"
  ];
  const [result, setResult] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const shake = () => {
    setShaking(true);
    setResult(null);
    setTimeout(() => {
      setResult(responses[Math.floor(Math.random() * responses.length)]);
      setShaking(false);
    }, 1200);
  };
  return (
    <Section id="eightball" title="Magic 8-Ball" desc="Ask a question and shake for answers." accent="purple" index={22}>
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={shaking ? { rotate: [0, -15, 15, -15, 15, 0], y: [0, -10, 0, -10, 0] } : {}}
          transition={{ duration: 1.2 }}
          onClick={shake}
          className="relative w-48 h-48 rounded-full cursor-pointer select-none"
          style={{
            background: "radial-gradient(circle at 32% 30%, #4a4a4a 0%, #1a1a1a 35%, #050505 75%, #000 100%)",
            boxShadow:
              "inset -12px -16px 32px rgba(0,0,0,0.85), inset 8px 8px 24px rgba(255,255,255,0.04), 0 24px 48px -12px rgba(0,0,0,0.9), 0 8px 16px rgba(0,0,0,0.5)",
          }}
        >
          {/* Glossy specular highlight */}
          <div
            aria-hidden
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "8%",
              left: "16%",
              width: "38%",
              height: "26%",
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 40%, transparent 70%)",
              filter: "blur(1px)",
            }}
          />

          {/* Front face — white circle with 8, OR blue answer window */}
          <div className="absolute inset-0 flex items-center justify-center">
            {result ? (
              /* Triangular blue answer window */
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className="relative w-28 h-28 flex items-center justify-center"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 86%, 0% 86%)",
                    background: "radial-gradient(circle at 50% 30%, #5fa9ff 0%, #2554c7 45%, #0a1d6b 90%)",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.55), inset 0 4px 8px rgba(255,255,255,0.18)",
                  }}
                />
                <p
                  className="relative text-center text-[10px] font-bold leading-tight px-2 z-10 tracking-wide"
                  style={{
                    color: "#e8f1ff",
                    textShadow: "0 1px 2px rgba(0,0,0,0.8), 0 0 6px rgba(120,170,255,0.4)",
                    transform: "translateY(8px)",
                    fontFamily: "var(--font-heading), serif",
                  }}
                >
                  {result.toUpperCase()}
                </p>
              </motion.div>
            ) : (
              /* White circle with embossed 8 */
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #e8e8e8 60%, #c8c8c8 100%)",
                  boxShadow:
                    "inset 0 -4px 8px rgba(0,0,0,0.18), inset 0 3px 4px rgba(255,255,255,0.7), 0 2px 6px rgba(0,0,0,0.4)",
                }}
              >
                <span
                  className="text-5xl font-black"
                  style={{
                    color: "#0a0a0a",
                    textShadow: "0 1px 0 rgba(255,255,255,0.6), 0 -1px 0 rgba(0,0,0,0.2)",
                    fontFamily: "var(--font-heading), serif",
                  }}
                >
                  8
                </span>
              </div>
            )}
          </div>

          {/* Subtle bottom shadow ring (where ball meets surface) */}
          <div
            aria-hidden
            className="absolute pointer-events-none rounded-full"
            style={{
              bottom: "-6%",
              left: "10%",
              width: "80%",
              height: "12%",
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)",
              filter: "blur(4px)",
            }}
          />
        </motion.div>

        <div className="text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-3 font-[family-name:var(--font-mono)]">Ask a yes/no question and click the ball</p>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn" onClick={shake}>
            {shaking ? "Shaking..." : "Shake Ball"}
          </motion.button>
        </div>
      </div>
    </Section>
  );
}
