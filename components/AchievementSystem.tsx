"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "legendary";
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_visit: {
    id: "first_visit",
    title: "Welcome Aboard",
    description: "Discovered maxwellnixon.com",
    icon: "👋",
    rarity: "common",
  },
  tools_visited: {
    id: "tools_visited",
    title: "Tool Curious",
    description: "Opened the developer toolkit",
    icon: "🛠️",
    rarity: "common",
  },
  all_pages: {
    id: "all_pages",
    title: "Site Explorer",
    description: "Visited every main page",
    icon: "🗺️",
    rarity: "rare",
  },
  arcade_visited: {
    id: "arcade_visited",
    title: "Player One",
    description: "Entered the neon arcade",
    icon: "🕹️",
    rarity: "common",
  },
  konami: {
    id: "konami",
    title: "Cheat Master",
    description: "Found the Konami code",
    icon: "🎮",
    rarity: "legendary",
  },
  theme_cycled: {
    id: "theme_cycled",
    title: "Palette Master",
    description: "Tried every accent theme",
    icon: "🎨",
    rarity: "rare",
  },
  terminal: {
    id: "terminal",
    title: "Shell Savvy",
    description: "Entered the interactive terminal",
    icon: "💻",
    rarity: "rare",
  },
  analytics: {
    id: "analytics",
    title: "Data Driven",
    description: "Peeked at the analytics dashboard",
    icon: "📊",
    rarity: "common",
  },
  blog_visited: {
    id: "blog_visited",
    title: "Reader",
    description: "Read the blog",
    icon: "📖",
    rarity: "common",
  },
  status_check: {
    id: "status_check",
    title: "Uptime Inspector",
    description: "Checked site status",
    icon: "🟢",
    rarity: "common",
  },
  night_owl: {
    id: "night_owl",
    title: "Night Owl",
    description: "Visited between midnight and 5 AM",
    icon: "🦉",
    rarity: "rare",
  },
};

const STORAGE_KEY = "mnx-achievements";
const THEMES_SEEN_KEY = "mnx-themes-seen";
const PAGES_SEEN_KEY = "mnx-pages-seen";
const ALL_PAGES = ["/tools", "/space", "/weather", "/news", "/blog", "/status", "/play", "/contact", "/"];

function loadUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveUnlocked(unlocked: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unlocked)));
  } catch {
    // ignore
  }
}

// Queue for pending toasts
interface ToastItem {
  achievement: Achievement;
  timestamp: number;
}

export function AchievementSystem() {
  const pathname = usePathname();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const unlock = useCallback((id: string) => {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement) return;

    const unlocked = loadUnlocked();
    if (unlocked.has(id)) return; // Already unlocked

    unlocked.add(id);
    saveUnlocked(unlocked);

    const toast: ToastItem = { achievement, timestamp: Date.now() };
    setToasts((prev) => [...prev, toast]);

    // Auto-remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.timestamp !== toast.timestamp));
    }, 5200);
  }, []);

  // Expose unlock globally so any component can call it
  useEffect(() => {
    (window as unknown as { unlockAchievement?: (id: string) => void }).unlockAchievement = unlock;
    return () => {
      delete (window as unknown as { unlockAchievement?: (id: string) => void }).unlockAchievement;
    };
  }, [unlock]);

  // Track page visits & auto-unlock
  useEffect(() => {
    // First visit
    unlock("first_visit");

    // Night owl check
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) {
      unlock("night_owl");
    }

    // Track pages seen
    try {
      const raw = localStorage.getItem(PAGES_SEEN_KEY);
      const seen: Set<string> = raw ? new Set(JSON.parse(raw)) : new Set();
      seen.add(pathname);
      localStorage.setItem(PAGES_SEEN_KEY, JSON.stringify(Array.from(seen)));

      // Page-specific unlocks
      if (pathname.startsWith("/tools")) unlock("tools_visited");
      if (pathname.startsWith("/play")) unlock("arcade_visited");
      if (pathname.startsWith("/terminal")) unlock("terminal");
      if (pathname.startsWith("/analytics")) unlock("analytics");
      if (pathname.startsWith("/blog")) unlock("blog_visited");
      if (pathname.startsWith("/status")) unlock("status_check");

      // Check all pages milestone
      const matchedPages = ALL_PAGES.filter((p) =>
        Array.from(seen).some((s) => s === p || s.startsWith(p + "/"))
      );
      if (matchedPages.length >= ALL_PAGES.length - 1) {
        unlock("all_pages");
      }
    } catch {
      // ignore storage errors
    }
  }, [pathname, unlock]);

  // Theme tracking — listen for theme-changed events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      try {
        const raw = localStorage.getItem(THEMES_SEEN_KEY);
        const seen: Set<string> = raw ? new Set(JSON.parse(raw)) : new Set();
        seen.add(detail);
        localStorage.setItem(THEMES_SEEN_KEY, JSON.stringify(Array.from(seen)));
        if (seen.size >= 5) unlock("theme_cycled");
      } catch {
        // ignore storage errors
      }
    };
    window.addEventListener("theme-changed", handler);
    return () => window.removeEventListener("theme-changed", handler);
  }, [unlock]);

  // Konami unlock — listen for the existing Konami event
  useEffect(() => {
    const handler = () => unlock("konami");
    window.addEventListener("konami-activated", handler);
    return () => window.removeEventListener("konami-activated", handler);
  }, [unlock]);

  return (
    <div
      className="fixed top-20 right-4 z-[110] flex flex-col gap-3 pointer-events-none max-w-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <AchievementToast key={toast.timestamp} achievement={toast.achievement} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function AchievementToast({ achievement }: { achievement: Achievement }) {
  const rarityStyles = {
    common: {
      border: "border-cyan-400/30",
      bg: "from-cyan-500/10 to-cyan-500/5",
      text: "text-cyan-300",
      label: "Achievement",
    },
    rare: {
      border: "border-purple-400/40",
      bg: "from-purple-500/15 to-pink-500/5",
      text: "text-purple-300",
      label: "Rare Achievement",
    },
    legendary: {
      border: "border-yellow-400/50",
      bg: "from-yellow-500/20 to-amber-500/10",
      text: "text-yellow-300",
      label: "Legendary",
    },
  };
  const style = rarityStyles[achievement.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative overflow-hidden rounded-xl border ${style.border} bg-gradient-to-br ${style.bg} backdrop-blur-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto`}
      role="status"
    >
      {achievement.rarity === "legendary" && (
        <div className="absolute inset-0 achievement-shimmer pointer-events-none" />
      )}
      <div className="relative flex items-start gap-3">
        <div className="text-2xl flex-shrink-0 leading-none mt-0.5">
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[9px] font-mono uppercase tracking-wider ${style.text} mb-0.5`}>
            ★ {style.label} Unlocked
          </p>
          <p className="text-sm font-bold text-white truncate">
            {achievement.title}
          </p>
          <p className="text-xs text-white/60 mt-0.5 leading-snug">
            {achievement.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
