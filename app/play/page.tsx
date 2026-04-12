"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";

const GAMES = [
  {
    title: "Neon Snake",
    desc: "Classic snake reimagined with neon glow, wall-wrapping, and buttery controls.",
    href: "/play/snake",
    icon: "🐍",
    gradient: "from-cyan-500 to-blue-600",
    tags: ["Canvas", "Classic", "High Score"],
    color: "#06b6d4",
  },
  {
    title: "Neon Pong",
    desc: "Beat the AI in this fast-paced pong duel with particle trails and adaptive difficulty.",
    href: "/play/pong",
    icon: "🏓",
    gradient: "from-purple-500 to-pink-500",
    tags: ["Canvas", "VS AI", "Physics"],
    color: "#a855f7",
  },
  {
    title: "Memory Matrix",
    desc: "Watch the pattern, then recall it from memory. How far can your brain go?",
    href: "/play/memory",
    icon: "🧠",
    gradient: "from-amber-500 to-orange-500",
    tags: ["Puzzle", "Memory", "Progressive"],
    color: "#f59e0b",
  },
  {
    title: "Reaction Time",
    desc: "Test your reflexes. Wait for the signal, then click as fast as you can.",
    href: "/play/reaction",
    icon: "⚡",
    gradient: "from-green-500 to-emerald-500",
    tags: ["Reflex", "Speed", "Benchmark"],
    color: "#10b981",
  },
  {
    title: "Type Racer",
    desc: "Race against the clock typing real sentences. Track your WPM and accuracy in real time.",
    href: "/play/typing",
    icon: "⌨️",
    gradient: "from-rose-500 to-red-600",
    tags: ["Typing", "WPM", "Accuracy"],
    color: "#f43f5e",
  },
];

export default function ArcadePage() {
  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>

      {/* Nav */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center">
                <span className="text-xs font-bold gradient-text">M</span>
              </div>
            </div>
            <span className="text-base font-semibold tracking-wide text-white/90 hidden sm:inline">
              maxwellnixon<span className="text-cyan-400">.</span>com
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium tracking-wider uppercase text-white/50 hover:text-white transition-colors font-mono">Home</Link>
            <Link href="/tools" className="px-4 py-2 text-sm font-medium tracking-wider uppercase text-white/50 hover:text-white transition-colors font-mono">Tools</Link>
            <Link href="/space" className="px-4 py-2 text-sm font-medium tracking-wider uppercase text-white/50 hover:text-white transition-colors font-mono">Space</Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <div className="pt-32 pb-12 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="terminal-prompt font-mono text-sm text-white/70">arcade</span>
            <h1 className="mt-4 font-bold text-5xl sm:text-6xl md:text-7xl leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                Neon Arcade
              </span>
            </h1>
            <p className="mt-4 text-white/50 max-w-lg mx-auto text-lg">
              Browser-based games built with canvas and code. No installs, no tracking, just play.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Game Grid */}
      <main className="px-4 sm:px-6 pb-24">
        <div className="max-w-[1200px] mx-auto grid sm:grid-cols-2 gap-6">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
            >
              <Link href={game.href} className="block group">
                <div className="glass-card p-6 h-full overflow-hidden relative transition-all duration-300 group-hover:border-white/15"
                  style={{ "--glow": game.color } as React.CSSProperties}>
                  {/* Gradient banner */}
                  <div className={`relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-br ${game.gradient} mb-5 group-hover:scale-[1.02] transition-transform duration-500`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-4xl drop-shadow-lg">{game.icon}</div>
                    <div className="absolute top-3 right-3 text-[10px] font-mono text-white/70 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Play Now
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{game.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4">{game.desc}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {game.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-[0.6rem] text-white/40 border border-white/[0.06] font-mono">{tag}</span>
                    ))}
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 60px ${game.color}10, 0 0 30px ${game.color}08` }} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs font-mono">&copy; {new Date().getFullYear()} Maxwell Nixon</p>
          <div className="flex gap-4">
            <Link href="/" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Home</Link>
            <Link href="/tools" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Tools</Link>
            <Link href="/space" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Space</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
