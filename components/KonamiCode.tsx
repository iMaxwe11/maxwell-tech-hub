"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

interface MatrixChar {
  id: string;
  char: string;
  column: number;
  delay: number;
}

export function KonamiCode() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [activated, setActivated] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [matrixChars, setMatrixChars] = useState<MatrixChar[]>([]);
  const [rainbowCards, setRainbowCards] = useState(false);

  // Generate matrix rain characters
  const generateMatrixChars = () => {
    const katakana = [
      "ア",
      "イ",
      "ウ",
      "エ",
      "オ",
      "カ",
      "キ",
      "ク",
      "ケ",
      "コ",
      "0",
      "1",
      "1",
      "0",
    ];
    const chars: MatrixChar[] = [];
    const columns = 30;

    for (let col = 0; col < columns; col++) {
      const charCount = Math.floor(Math.random() * 8) + 3;
      for (let i = 0; i < charCount; i++) {
        chars.push({
          id: `${col}-${i}`,
          char: katakana[Math.floor(Math.random() * katakana.length)],
          column: col,
          delay: (i * 0.05 + Math.random() * 0.1) * 1000,
        });
      }
    }
    return chars;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setSequence((prev) => {
        const newSequence = [...prev, key];

        // Check if the recent sequence matches KONAMI code
        const recentSequence = newSequence.slice(-KONAMI.length);
        const konamiLower = KONAMI.map((k) => k.toLowerCase());

        if (
          recentSequence.length === KONAMI.length &&
          recentSequence.every((key, idx) => key === konamiLower[idx])
        ) {
          // Konami code detected!
          triggerEasterEgg();
          return [];
        }

        // Keep sequence from getting too long
        if (newSequence.length > KONAMI.length) {
          return newSequence.slice(-KONAMI.length);
        }

        return newSequence;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const triggerEasterEgg = () => {
    if (activated) return; // Prevent spam

    setActivated(true);
    setShowMatrix(true);
    setShowToast(true);
    setRainbowCards(true);

    // Notify achievement system
    try {
      window.dispatchEvent(new CustomEvent("konami-activated"));
    } catch {
      // ignore
    }

    // Generate matrix characters
    setMatrixChars(generateMatrixChars());

    // Reset states after animations
    setTimeout(() => {
      setShowMatrix(false);
    }, 2500);

    setTimeout(() => {
      setShowToast(false);
    }, 4000);

    setTimeout(() => {
      setRainbowCards(false);
      setActivated(false);
    }, 3000);

    // Add rainbow border to all glass cards
    const cards = document.querySelectorAll("[class*='glass']");
    cards.forEach((card) => {
      card.classList.add("rainbow-border-animation");
    });

    // Remove animation class after duration
    setTimeout(() => {
      cards.forEach((card) => {
        card.classList.remove("rainbow-border-animation");
      });
    }, 3000);
  };

  return (
    <>
      {/* Matrix Rain Overlay */}
      <AnimatePresence>
        {showMatrix && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 pointer-events-none bg-black/20 overflow-hidden"
          >
            <div className="w-full h-full relative font-mono text-sm">
              {matrixChars.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{
                    y: -100,
                    opacity: 1,
                  }}
                  animate={{
                    y: window.innerHeight + 100,
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: item.delay / 1000,
                    ease: "linear",
                  }}
                  className="absolute text-green-400 drop-shadow-lg"
                  style={{
                    left: `${(item.column / 30) * 100}%`,
                    textShadow:
                      "0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.4)",
                  }}
                >
                  {item.char}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-cyan-500/90 via-purple-500/90 to-gold-500/90 backdrop-blur-md border border-cyan-400/50 rounded-lg px-6 py-4 text-center shadow-2xl">
              <div className="text-white font-bold text-lg">
                🎮 CHEAT CODE ACTIVATED
              </div>
              <div className="text-cyan-100 text-sm mt-1">
                You found the secret! +1000 XP
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for rainbow border animation */}
      <style>{`
        @keyframes rainbow-border {
          0% {
            border-color: #06b6d4;
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
          }
          25% {
            border-color: #a855f7;
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
          }
          50% {
            border-color: #f59e0b;
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
          }
          75% {
            border-color: #06b6d4;
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
          }
          100% {
            border-color: #06b6d4;
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
          }
        }

        .rainbow-border-animation {
          animation: rainbow-border 3s ease-in-out forwards !important;
          border: 2px solid #06b6d4 !important;
        }
      `}</style>
    </>
  );
}
