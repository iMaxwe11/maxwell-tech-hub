"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";
import { Navbar } from "@/components/Navbar";
import { useState, useEffect, useRef } from "react";

const GAMES = [
  {
    title: "Neon Snake",
    desc: "Classic snake reimagined with neon glow, wall-wrapping, and buttery controls.",
    href: "/play/snake",
    icon: "🐍",
    color: "#06b6d4",
    colorName: "cyan",
  },
  {
    title: "Neon Pong",
    desc: "Beat the AI in this fast-paced pong duel with particle trails and adaptive difficulty.",
    href: "/play/pong",
    icon: "🏓",
    color: "#a855f7",
    colorName: "purple",
  },
  {
    title: "Memory Matrix",
    desc: "Watch the pattern, then recall it from memory. How far can your brain go?",
    href: "/play/memory",
    icon: "🧠",
    color: "#f59e0b",
    colorName: "amber",
  },
  {
    title: "Reaction Time",
    desc: "Test your reflexes. Wait for the signal, then click as fast as you can.",
    href: "/play/reaction",
    icon: "⚡",
    color: "#10b981",
    colorName: "green",
  },
  {
    title: "Type Racer",
    desc: "Race against the clock typing real sentences. Track your WPM and accuracy in real time.",
    href: "/play/typing",
    icon: "⌨️",
    color: "#f43f5e",
    colorName: "rose",
  },
];

function ArcadeCabinet({ selectedGameIndex, setSelectedGameIndex }: { selectedGameIndex: number | null; setSelectedGameIndex: (index: number | null) => void }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentGame = selectedGameIndex !== null ? GAMES[selectedGameIndex] : null;

  if (isFullscreen && currentGame) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFullscreen(false)}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-400 font-mono text-sm hover:bg-cyan-500/30"
          >
            Exit Fullscreen
          </motion.button>
        </div>
        <iframe
          ref={iframeRef}
          src={currentGame.href}
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl mb-12">
      <style>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        @keyframes neon-glow {
          0%, 100% {
            text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
          }
          50% {
            text-shadow: 0 0 15px currentColor, 0 0 30px currentColor, 0 0 45px currentColor;
          }
        }
        @keyframes button-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.95); }
        }
        .scanline-overlay {
          animation: scanlines 0.15s linear infinite;
          pointer-events: none;
        }
        .crt-flicker {
          animation: flicker 0.15s infinite;
        }
        .neon-arcade-text {
          animation: neon-glow 2s ease-in-out infinite;
        }
        .arcade-button:hover {
          animation: button-pulse 0.5s ease-in-out infinite;
        }
      `}</style>

      {/* Cabinet Container */}
      <div className="relative rounded-3xl overflow-hidden border-8 border-black/80 bg-gradient-to-b from-slate-900 via-black to-slate-950 shadow-2xl"
        style={{
          boxShadow: `0 0 80px rgba(6, 182, 212, 0.3), 0 0 120px rgba(168, 85, 247, 0.2), inset 0 0 40px rgba(0, 0, 0, 0.8)`
        }}>

        {/* Cabinet Top - Marquee */}
        <div className="h-20 bg-gradient-to-r from-black via-slate-900 to-black border-b-4 border-yellow-500/30 flex items-center justify-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent" />
          <motion.h2
            className="text-4xl font-black tracking-widest text-yellow-500 neon-arcade-text font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            ARCADE
          </motion.h2>
        </div>

        {/* Main Screen */}
        <div className="p-8 bg-gradient-to-b from-slate-950 to-black">
          {/* CRT Screen with rounded edges */}
          <div className="relative rounded-2xl overflow-hidden bg-black border-4 border-cyan-500/30 aspect-video flex flex-col items-center justify-center"
            style={{
              boxShadow: `inset 0 0 40px rgba(0, 0, 0, 0.9), 0 0 60px rgba(6, 182, 212, 0.2)`,
              perspective: "1000px",
            }}>

            {/* Screen content */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-purple-950/20 crt-flicker" />

            {/* Scanlines */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0px, rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)",
              }}
            />

            {/* Game display or game selector */}
            <AnimatePresence mode="wait">
              {selectedGameIndex === null ? (
                // Game Selector Menu
                <motion.div
                  key="menu"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-4 p-4"
                >
                  <div className="text-4xl mb-2">GAME SELECT</div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {GAMES.map((game, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedGameIndex(i)}
                        className="px-3 py-2 rounded border text-xs font-mono font-bold uppercase tracking-wider transition-all"
                        style={{
                          backgroundColor: `${game.color}20`,
                          borderColor: game.color,
                          color: game.color,
                        }}
                      >
                        {game.title}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : currentGame ? (
                // Game Playing
                <motion.div
                  key="game"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 w-full h-full flex items-center justify-center"
                >
                  <iframe
                    ref={iframeRef}
                    src={currentGame.href}
                    className="w-full h-full border-0 rounded-lg"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Game indicator dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {GAMES.map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  animate={{
                    backgroundColor: i === selectedGameIndex ? (currentGame?.color || "#fff") : "rgba(255, 255, 255, 0.2)",
                    boxShadow: i === selectedGameIndex ? `0 0 10px ${currentGame?.color || "#fff"}` : "none",
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>

          {/* Bezel area with controls */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {/* Joystick (left) */}
            <div className="flex justify-center">
              <div className="relative w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg border-2 border-gray-600 flex items-center justify-center"
                style={{ boxShadow: "inset 0 4px 8px rgba(0, 0, 0, 0.6)" }}>
                <motion.div
                  className="w-12 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-gray-400 text-xl"
                  animate={{
                    rotateX: [0, 5, -5, 0],
                    rotateY: [0, -5, 5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⬆️
                </motion.div>
              </div>
            </div>

            {/* Center info */}
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <div className="text-xs font-mono text-cyan-400/80">CREDITS</div>
              <div className="text-lg font-mono font-bold text-cyan-400">∞</div>
            </div>

            {/* Action buttons (right) */}
            <div className="flex justify-center gap-2 flex-col items-center">
              {selectedGameIndex !== null ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedGameIndex(null)}
                    className="arcade-button w-20 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-900 border-2 border-cyan-400 text-xs font-bold text-white font-mono"
                    style={{
                      boxShadow: "0 0 15px rgba(6, 182, 212, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    MENU
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFullscreen(true)}
                    className="arcade-button w-20 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-900 border-2 border-purple-400 text-xs font-bold text-white font-mono"
                    style={{
                      boxShadow: "0 0 15px rgba(168, 85, 247, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    FULL
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="arcade-button w-16 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-900 border-2 border-purple-400 text-xs font-bold text-white font-mono"
                  style={{
                    boxShadow: "0 0 15px rgba(168, 85, 247, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)"
                  }}
                >
                  START
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Cabinet bottom - Stats */}
        <div className="px-8 py-4 bg-gradient-to-r from-black via-slate-950 to-black border-t border-cyan-500/20 flex justify-between text-xs font-mono text-cyan-300/60">
          <span>GAMES: {GAMES.length}</span>
          <span>TOKENS: ∞</span>
          <span>PLAYER: 1</span>
        </div>
      </div>
    </div>
  );
}

function GameCard({ game, index, onPlayInCabinet }: { game: typeof GAMES[0]; index: number; onPlayInCabinet: (index: number) => void }) {
  const [isHovering, setIsHovering] = useState(false);

  const renderGamePreview = () => {
    switch (game.title) {
      case "Neon Snake":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <style>
                {`
                  @keyframes snake-move { 0% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 100% { transform: translateX(-5px); } }
                  .snake-segment { animation: snake-move 2s ease-in-out infinite; }
                `}
              </style>
              <circle cx="50" cy="30" r="3" fill="${game.color}" />
              <circle cx="40" cy="30" r="2.5" fill="${game.color}" opacity="0.7" />
              <circle cx="30" cy="30" r="2" fill="${game.color}" opacity="0.4" />
              <circle cx="70" cy="70" r="3" fill="${game.color}" opacity="0.6" />
            </svg>
          </div>
        );
      case "Neon Pong":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <rect x="10" y="30" width="4" height="20" fill="${game.color}" />
              <rect x="86" y="35" width="4" height="15" fill="${game.color}" />
              <circle cx="50" cy="50" r="3" fill="${game.color}" opacity="0.8" />
              <circle cx="48" cy="48" r="2" fill="${game.color}" opacity="0.3" />
            </svg>
          </div>
        );
      case "Memory Matrix":
        return (
          <div className="w-full h-full flex items-center justify-center gap-2">
            <div className="grid grid-cols-2 gap-1.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded border-2" style={{ borderColor: game.color, backgroundColor: `${game.color}20` }} />
              ))}
            </div>
          </div>
        );
      case "Reaction Time":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-full border-4"
              style={{ borderColor: game.color, boxShadow: `0 0 20px ${game.color}` }}
            />
          </div>
        );
      case "Type Racer":
        return (
          <div className="w-full h-full flex items-center justify-center gap-1">
            {["T", "Y", "P", "E"].map((char, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
                className="text-2xl font-bold"
                style={{ color: game.color }}
              >
                {char}
              </motion.div>
            ))}
          </div>
        );
      default:
        return <div className="text-5xl">{game.icon}</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
    >
      <div
        className="relative group h-full rounded-2xl overflow-hidden border border-white/10 transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(10, 10, 20, 0.6) 100%)",
          backdropFilter: "blur(10px)",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Animated inner border glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 40px ${game.color}20, 0 0 40px ${game.color}15`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          {/* Game preview area */}
          <div className="mb-4 relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-black to-slate-900 flex items-center justify-center border border-white/5"
            style={{
              boxShadow: isHovering ? `0 0 30px ${game.color}30` : "none",
              background: `linear-gradient(135deg, ${game.color}10, ${game.color}05)`,
            }}>

            {/* Scanline effect on preview */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0px, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)",
              }} />

            {/* Game preview animation */}
            <motion.div
              className="relative z-10"
              animate={isHovering ? { y: [-3, 3, -3] } : { y: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {renderGamePreview()}
            </motion.div>
          </div>

          {/* Game title */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors font-mono">
              {game.title.toUpperCase()}
            </h3>
            <p className="text-white/40 text-xs font-mono mt-1">{game.desc}</p>
          </div>

          {/* High score / Stats area */}
          <div className="mb-4 p-2 bg-black/40 rounded border border-white/5 text-center">
            <p className="text-xs font-mono text-white/50">HIGH SCORE</p>
            <p className="text-xl font-bold font-mono" style={{ color: game.color }}>---</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 flex-col">
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                onPlayInCabinet(index);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 rounded-lg font-mono font-bold text-sm transition-all duration-300 border"
              style={{
                backgroundColor: `${game.color}30`,
                color: game.color,
                borderColor: game.color,
                boxShadow: isHovering ? `0 0 20px ${game.color}60` : `0 0 10px ${game.color}20`,
              }}
            >
              PLAY IN CABINET
            </motion.button>
            <Link href={game.href} className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 rounded-lg font-mono font-bold text-sm transition-all duration-300 border text-white/60 border-white/20 hover:text-white hover:border-white/40 hover:bg-white/5"
              >
                Full Page
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Corner accent lights */}
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: game.color, boxShadow: `0 0 10px ${game.color}` }} />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: game.color, boxShadow: `0 0 10px ${game.color}` }} />
      </div>
    </motion.div>
  );
}

export default function ArcadePage() {
  const cabinetRef = useRef<HTMLDivElement>(null);
  const [selectedGameIndex, setSelectedGameIndex] = useState<number | null>(null);

  const handlePlayInCabinet = (index: number) => {
    setSelectedGameIndex(index);
    setTimeout(() => {
      cabinetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>

      {/* Page-wide scanline overlay */}
      <style>{`
        @keyframes page-scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 10px; }
        }
        .scanline-bg {
          animation: page-scanlines 0.15s linear infinite;
          background-image: repeating-linear-gradient(
            0deg,
            rgba(6, 182, 212, 0.03) 0px,
            rgba(6, 182, 212, 0.03) 1px,
            transparent 1px,
            transparent 2px
          );
        }
      `}</style>

      <Navbar breadcrumb={["arcade"]} accent="#a855f7" />

      <div className="scanline-bg relative">
        {/* Hero Section */}
        <div className="pt-24 pb-8 px-4 sm:px-6">
          <div className="max-w-[1200px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="terminal-prompt font-mono text-sm text-cyan-400/60">$ arcade_hub --init</span>
              <h1 className="mt-4 font-black text-4xl sm:text-5xl md:text-6xl leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-500">
                  RETRO ARCADE
                </span>
              </h1>
              <p className="mt-3 text-white/40 max-w-xl mx-auto text-sm font-mono">
                Five games. Zero installs. Infinite play. Insert coin to begin.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Arcade Cabinet */}
        <div className="px-4 sm:px-6 pb-8" ref={cabinetRef}>
          <div className="max-w-[1200px] mx-auto">
            <ArcadeCabinet selectedGameIndex={selectedGameIndex} setSelectedGameIndex={setSelectedGameIndex} />
          </div>
        </div>

        {/* Player Stats Bar */}
        <div className="px-4 sm:px-6 pb-8">
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-cyan-500/20 p-4 backdrop-blur-sm"
              style={{
                background: "linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-xs font-mono">
                <div>
                  <p className="text-cyan-400/70">GAMES</p>
                  <p className="text-cyan-400 font-bold">5</p>
                </div>
                <div>
                  <p className="text-purple-400/70">AVAILABLE</p>
                  <p className="text-purple-400 font-bold">24/7</p>
                </div>
                <div>
                  <p className="text-amber-400/70">TOKENS</p>
                  <p className="text-amber-400 font-bold">∞</p>
                </div>
                <div>
                  <p className="text-rose-400/70">CREDITS</p>
                  <p className="text-rose-400 font-bold">READY</p>
                </div>
                <div>
                  <p className="text-green-400/70">STATUS</p>
                  <p className="text-green-400 font-bold">ON-LINE</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Game Cards Grid */}
        <main className="px-4 sm:px-6 pb-24">
          <div className="max-w-[1200px] mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {GAMES.map((game, i) => (
              <GameCard key={game.title} game={game} index={i} onPlayInCabinet={handlePlayInCabinet} />
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 border-t border-cyan-500/10">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
              <p className="text-white/25">&copy; {new Date().getFullYear()} Maxwell Nixon • Obsidian Luxe Arcade</p>
              <div className="flex gap-6 text-white/30 hover:text-cyan-400 transition-colors">
                <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                <Link href="/tools" className="hover:text-cyan-400 transition-colors">Tools</Link>
                <Link href="/space" className="hover:text-cyan-400 transition-colors">Space</Link>
                <Link href="/news" className="hover:text-cyan-400 transition-colors">News</Link>
                <Link href="/weather" className="hover:text-cyan-400 transition-colors">Weather</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
