"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/Navbar";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

interface ArcadeGame {
  id: string;
  title: string;
  tagline: string;
  href: string;
  icon: string;
  accent: string;
  genre: string;
  controls: string;
  time: string;
}

const GAMES: ArcadeGame[] = [
  {
    id: "snake",
    title: "Neon Snake",
    tagline: "Glow, grow, don't eat yourself.",
    href: "/play/snake",
    icon: "🐍",
    accent: "#06b6d4",
    genre: "Classic",
    controls: "Arrow keys / WASD",
    time: "~2 min",
  },
  {
    id: "pong",
    title: "Neon Pong",
    tagline: "Rally hard. Score harder.",
    href: "/play/pong",
    icon: "🏓",
    accent: "#a855f7",
    genre: "Versus",
    controls: "Arrow keys / W S",
    time: "~3 min",
  },
  {
    id: "memory",
    title: "Memory Matrix",
    tagline: "Watch the pattern. Repeat it back.",
    href: "/play/memory",
    icon: "🧠",
    accent: "#f59e0b",
    genre: "Puzzle",
    controls: "Mouse / Tap",
    time: "~2 min",
  },
  {
    id: "reaction",
    title: "Reaction Time",
    tagline: "Wait. Green. Click.",
    href: "/play/reaction",
    icon: "⚡",
    accent: "#10b981",
    genre: "Reflex",
    controls: "Mouse / Tap",
    time: "~30 sec",
  },
  {
    id: "typing",
    title: "Type Racer",
    tagline: "Type faster than you think.",
    href: "/play/typing",
    icon: "⌨️",
    accent: "#f43f5e",
    genre: "Skill",
    controls: "Keyboard",
    time: "~1 min",
  },
];

/* ═══════════════════════════════════════════════════════════════
   PLAY-COUNT TRACKING (localStorage)
   ═══════════════════════════════════════════════════════════════ */

interface PlayStats {
  [gameId: string]: { plays: number; lastPlayedAt: number };
}

const STATS_KEY = "arcade:stats-v2";

function readStats(): PlayStats {
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PlayStats;
  } catch {
    return {};
  }
}

function writeStats(stats: PlayStats) {
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    /* noop */
  }
}

function recordPlay(gameId: string): PlayStats {
  const stats = readStats();
  const prev = stats[gameId] ?? { plays: 0, lastPlayedAt: 0 };
  const next: PlayStats = {
    ...stats,
    [gameId]: { plays: prev.plays + 1, lastPlayedAt: Date.now() },
  };
  writeStats(next);
  return next;
}

function relativeTime(ts: number): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(ts).toLocaleDateString();
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED CABINET PREVIEWS
   ═══════════════════════════════════════════════════════════════ */

function Preview({ id, accent }: { id: string; accent: string }) {
  switch (id) {
    case "snake":
      return (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          <defs>
            <filter id={`glow-${id}`}>
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Grid */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 10}
              x2="120"
              y2={i * 10}
              stroke={accent}
              strokeOpacity="0.08"
            />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 10}
              y1="0"
              x2={i * 10}
              y2="80"
              stroke={accent}
              strokeOpacity="0.08"
            />
          ))}
          {/* Snake segments */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.rect
              key={i}
              width="8"
              height="8"
              fill={accent}
              filter={`url(#glow-${id})`}
              initial={{ x: 10 + i * 10, y: 30, opacity: 1 - i * 0.13 }}
              animate={{
                x: [10 + i * 10, 60 + i * 10, 60 + i * 10, 10 + i * 10, 10 + i * 10],
                y: [30, 30, 50, 50, 30],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.08,
              }}
            />
          ))}
          {/* Food */}
          <motion.circle
            cx="90"
            cy="20"
            r="3"
            fill="#fff"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </svg>
      );
    case "pong":
      return (
        <svg viewBox="0 0 120 80" className="w-full h-full">
          {/* Center dashed line */}
          <line
            x1="60"
            y1="5"
            x2="60"
            y2="75"
            stroke={accent}
            strokeOpacity="0.3"
            strokeDasharray="3 3"
          />
          {/* Left paddle */}
          <motion.rect
            x="8"
            width="3"
            height="16"
            fill={accent}
            animate={{ y: [20, 45, 20] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Right paddle */}
          <motion.rect
            x="109"
            width="3"
            height="16"
            fill={accent}
            animate={{ y: [40, 15, 40] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Ball */}
          <motion.circle
            r="2.5"
            fill="#fff"
            animate={{
              cx: [15, 105, 15],
              cy: [25, 55, 25],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      );
    case "memory":
      return (
        <div className="w-full h-full p-3 grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-md border"
              style={{ borderColor: `${accent}60` }}
              animate={{
                backgroundColor: [
                  "rgba(0,0,0,0)",
                  `${accent}30`,
                  "rgba(0,0,0,0)",
                ],
                boxShadow: [
                  `0 0 0 ${accent}00`,
                  `0 0 10px ${accent}80`,
                  `0 0 0 ${accent}00`,
                ],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 4,
                delay: (i * 0.22) % 3.5,
              }}
            />
          ))}
        </div>
      );
    case "reaction":
      return (
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundColor: [
                "rgba(239, 68, 68, 0.15)",
                "rgba(239, 68, 68, 0.15)",
                `${accent}30`,
                "rgba(239, 68, 68, 0.15)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, times: [0, 0.6, 0.7, 1] }}
          />
          <motion.div
            className="relative w-16 h-16 rounded-full border-4 flex items-center justify-center font-mono font-bold text-xs"
            style={{ borderColor: accent, color: accent }}
            animate={{
              scale: [1, 1, 1.2, 1],
              boxShadow: [
                `0 0 0 ${accent}00`,
                `0 0 0 ${accent}00`,
                `0 0 30px ${accent}`,
                `0 0 0 ${accent}00`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, times: [0, 0.6, 0.7, 1] }}
          >
            GO
          </motion.div>
        </div>
      );
    case "typing": {
      const letters = ["T", "Y", "P", "E", " ", "F", "A", "S", "T"];
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 font-mono">
          <div className="flex gap-0.5">
            {letters.map((l, i) => (
              <motion.span
                key={i}
                className="text-lg font-bold inline-block w-[0.7em] text-center"
                style={{ color: accent }}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 1, 1, 0.2] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  times: [0, 0.15, 0.75, 1],
                  delay: i * 0.1,
                }}
              >
                {l === " " ? "\u00A0" : l}
              </motion.span>
            ))}
          </div>
          <motion.span
            className="inline-block w-[0.1em] h-4 -mb-1"
            style={{ background: accent }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      );
    }
    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   CABINET CARD
   ═══════════════════════════════════════════════════════════════ */

function Cabinet({
  game,
  index,
  isFocused,
  stats,
  onSelect,
  onQuickLaunch,
}: {
  game: ArcadeGame;
  index: number;
  isFocused: boolean;
  stats: { plays: number; lastPlayedAt: number };
  onSelect: () => void;
  onQuickLaunch: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.07, duration: 0.6 }}
      whileHover={{ y: -6 }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative flex flex-col rounded-2xl border overflow-hidden cursor-pointer
                  transition-[transform,box-shadow,border-color] duration-300 focus-visible:outline-none
                  ${
                    isFocused
                      ? "scale-[1.02]"
                      : ""
                  }`}
      style={{
        background: `linear-gradient(180deg, rgba(10,10,18,0.9), rgba(4,4,8,0.95))`,
        borderColor: isFocused ? `${game.accent}80` : "rgba(255,255,255,0.08)",
        boxShadow: isFocused
          ? `0 0 40px ${game.accent}40, inset 0 0 20px ${game.accent}10`
          : `0 4px 20px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Keyboard slot number */}
      <span
        className="absolute top-2 right-2 z-10 w-5 h-5 rounded-md
                   bg-black/50 border border-white/20 backdrop-blur-sm
                   text-[10px] font-mono font-bold flex items-center justify-center"
        style={{ color: game.accent }}
      >
        {index + 1}
      </span>

      {/* Preview screen — CRT style */}
      <div
        className="relative h-40 sm:h-44 overflow-hidden border-b border-white/5"
        style={{
          background: `radial-gradient(ellipse at center, ${game.accent}12, rgba(0,0,0,0.95) 75%)`,
        }}
      >
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.7)",
          }}
        />
        <Preview id={game.id} accent={game.accent} />

        {/* Genre tag top-left */}
        <span
          className="absolute top-2 left-2 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded
                     bg-black/60 backdrop-blur-sm border"
          style={{ borderColor: `${game.accent}40`, color: game.accent }}
        >
          {game.genre}
        </span>
      </div>

      {/* Title + meta */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-2xl leading-none shrink-0">{game.icon}</span>
          <div className="min-w-0">
            <h3
              className="text-base font-bold font-mono uppercase tracking-wide leading-tight transition-colors"
              style={{ color: isFocused ? game.accent : "#fff" }}
            >
              {game.title}
            </h3>
            <p className="text-[11px] text-white/40 leading-snug mt-0.5">{game.tagline}</p>
          </div>
        </div>

        {/* Personal stats */}
        <div className="mt-3 grid grid-cols-2 gap-1.5 text-center">
          <div className="rounded-md bg-white/[0.025] border border-white/5 px-1.5 py-1.5">
            <p className="text-[8px] font-mono uppercase tracking-wider text-white/35">Plays</p>
            <p
              className="text-sm font-mono font-bold mt-0.5"
              style={{ color: stats.plays > 0 ? game.accent : "rgba(255,255,255,0.3)" }}
            >
              {stats.plays || "—"}
            </p>
          </div>
          <div className="rounded-md bg-white/[0.025] border border-white/5 px-1.5 py-1.5">
            <p className="text-[8px] font-mono uppercase tracking-wider text-white/35">Last</p>
            <p className="text-[10px] font-mono font-semibold text-white/70 mt-1 truncate">
              {relativeTime(stats.lastPlayedAt)}
            </p>
          </div>
        </div>

        {/* Launch buttons */}
        <div className="mt-4 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickLaunch();
            }}
            className="flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider
                       border transition-[background-color,box-shadow]"
            style={{
              borderColor: `${game.accent}50`,
              backgroundColor: `${game.accent}15`,
              color: game.accent,
              boxShadow: isFocused ? `0 0 15px ${game.accent}60` : `0 0 8px ${game.accent}20`,
            }}
          >
            Play
          </motion.button>
          <Link
            href={game.href}
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-3 rounded-lg text-xs font-mono text-white/50 hover:text-white
                       bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20
                       transition-colors"
          >
            ↗
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOW PLAYING MODAL
   ═══════════════════════════════════════════════════════════════ */

function NowPlayingModal({
  game,
  onClose,
}: {
  game: ArcadeGame | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!game) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [game, onClose]);

  return (
    <AnimatePresence>
      {game && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-2xl border-2 overflow-hidden
                       bg-[#050508] shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
            style={{ borderColor: `${game.accent}60` }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b border-white/10"
              style={{
                background: `linear-gradient(90deg, ${game.accent}15, transparent)`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{game.icon}</span>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                    Now Playing
                  </p>
                  <h2
                    className="text-sm font-mono font-bold uppercase tracking-wide"
                    style={{ color: game.accent }}
                  >
                    {game.title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={game.href}
                  className="text-[10px] font-mono px-2.5 py-1.5 rounded-md
                             bg-white/[0.04] hover:bg-white/[0.08] border border-white/10
                             text-white/60 hover:text-white transition-colors"
                >
                  Full Page
                </Link>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-7 h-7 rounded-md bg-white/[0.04] hover:bg-white/[0.1] border border-white/10
                             text-white/70 hover:text-white transition-colors flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Game iframe */}
            <iframe
              src={game.href}
              title={game.title}
              className="w-full h-[72vh] border-0 bg-black"
              allow="fullscreen"
            />

            {/* Footer hint */}
            <div className="px-5 py-2.5 border-t border-white/5 text-[10px] font-mono text-white/35 text-center">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white/60">Esc</kbd> to exit
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function ArcadePage() {
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [playing, setPlaying] = useState<ArcadeGame | null>(null);
  const [stats, setStats] = useState<PlayStats>({});

  // Load stats on mount
  useEffect(() => {
    setStats(readStats());
  }, []);

  const launch = useCallback((game: ArcadeGame) => {
    const next = recordPlay(game.id);
    setStats(next);
    setPlaying(game);
  }, []);

  // Keyboard shortcuts: 1-5 launches, arrows navigate focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (playing) return; // modal owns keys when open
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) return;

      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= GAMES.length) {
        e.preventDefault();
        launch(GAMES[num - 1]);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "l") {
        setFocusedIdx((i) => (i + 1) % GAMES.length);
        e.preventDefault();
      } else if (e.key === "ArrowLeft" || e.key === "h") {
        setFocusedIdx((i) => (i - 1 + GAMES.length) % GAMES.length);
        e.preventDefault();
      } else if (e.key === "Enter") {
        launch(GAMES[focusedIdx]);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedIdx, launch, playing]);

  // Aggregate stats for the footer
  const totalPlays = Object.values(stats).reduce((sum, s) => sum + s.plays, 0);
  const mostPlayedEntry = Object.entries(stats).sort((a, b) => b[1].plays - a[1].plays)[0];
  const mostPlayedGame = mostPlayedEntry
    ? GAMES.find((g) => g.id === mostPlayedEntry[0]) ?? null
    : null;
  const lastPlayedEntry = Object.entries(stats).sort((a, b) => b[1].lastPlayedAt - a[1].lastPlayedAt)[0];
  const lastPlayedGame = lastPlayedEntry
    ? GAMES.find((g) => g.id === lastPlayedEntry[0]) ?? null
    : null;

  return (
    <>
      <div className="aurora-bg">
        <div className="aurora-band" />
        <div className="aurora-band" />
      </div>
      <Navbar breadcrumb={["arcade"]} />

      {/* Page-wide CRT scanlines (subtle) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
        }}
      />

      <main className="relative pt-24 pb-24 px-4 sm:px-6">
        <div className="max-w-[1300px] mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-10 sm:mb-14"
          >
            <span className="terminal-prompt font-mono text-sm text-white/70">/ arcade</span>
            <h1
              className="mt-4 font-black text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] tracking-tight"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary) 50%, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline-block",
              }}
            >
              The Arcade
            </h1>
            <p className="mt-4 max-w-xl text-white/60 text-base sm:text-lg leading-relaxed">
              Five browser games, zero installs, unlimited credits. Pick a cabinet
              and hit play — or press a number key.
            </p>

            {/* Shortcut pills */}
            <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-mono">
              {[
                { k: "1 – 5", label: "Launch a game" },
                { k: "← →", label: "Navigate" },
                { k: "Enter", label: "Play focused" },
                { k: "Esc", label: "Exit" },
              ].map((s) => (
                <span
                  key={s.k}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                             bg-white/[0.03] border border-white/10 text-white/50"
                >
                  <kbd className="font-bold text-white/80">{s.k}</kbd>
                  <span className="opacity-60">·</span>
                  <span>{s.label}</span>
                </span>
              ))}
            </div>
          </motion.div>

          {/* Cabinet row */}
          <div
            role="listbox"
            aria-label="Arcade games"
            aria-activedescendant={`game-${GAMES[focusedIdx].id}`}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {GAMES.map((game, i) => (
              <Cabinet
                key={game.id}
                game={game}
                index={i}
                isFocused={i === focusedIdx}
                stats={stats[game.id] ?? { plays: 0, lastPlayedAt: 0 }}
                onSelect={() => setFocusedIdx(i)}
                onQuickLaunch={() => launch(game)}
              />
            ))}
          </div>

          {/* Arcade Record strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 sm:mt-14 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Your Arcade Record
                </p>
                <p className="text-sm text-white/80 font-mono mt-0.5">
                  Saved locally · Never leaves your browser
                </p>
              </div>
              {totalPlays > 0 && (
                <button
                  onClick={() => {
                    writeStats({});
                    setStats({});
                  }}
                  className="text-[10px] font-mono text-white/35 hover:text-red-400 transition-colors px-2 py-1 rounded border border-white/5"
                  aria-label="Reset arcade stats"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5">
              <div className="px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Total plays
                </p>
                <p
                  className="text-2xl font-mono font-bold mt-1"
                  style={{ color: "var(--theme-primary)" }}
                >
                  {totalPlays}
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Games tried
                </p>
                <p className="text-2xl font-mono font-bold text-white/85 mt-1">
                  {Object.keys(stats).length} / {GAMES.length}
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Most played
                </p>
                <p className="text-sm font-mono font-semibold text-white/85 mt-1.5 truncate">
                  {mostPlayedGame ? (
                    <span style={{ color: mostPlayedGame.accent }}>
                      {mostPlayedGame.icon} {mostPlayedGame.title.replace("Neon ", "")}
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Last session
                </p>
                <p className="text-sm font-mono font-semibold text-white/85 mt-1.5 truncate">
                  {lastPlayedGame ? (
                    <>
                      <span style={{ color: lastPlayedGame.accent }}>{lastPlayedGame.icon}</span>{" "}
                      {relativeTime(lastPlayedEntry?.[1].lastPlayedAt ?? 0)}
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Secrets hint */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center text-[11px] font-mono text-white/25"
          >
            Looking for more secrets? The{" "}
            <Link href="/terminal" className="text-white/50 hover:text-[color:var(--theme-primary)] transition-colors">
              terminal
            </Link>{" "}
            knows things. So does the{" "}
            <span className="text-white/50">Konami code</span>.
          </motion.p>
        </div>
      </main>

      <NowPlayingModal game={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
