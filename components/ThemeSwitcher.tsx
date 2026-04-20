"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  primaryRgb: string;
  secondaryRgb: string;
  label: string;
}

export const THEMES: Theme[] = [
  {
    id: "obsidian",
    name: "Obsidian",
    primary: "#06b6d4",
    secondary: "#a855f7",
    primaryRgb: "6, 182, 212",
    secondaryRgb: "168, 85, 247",
    label: "Cyan × Purple (default)",
  },
  {
    id: "sunset",
    name: "Sunset",
    primary: "#f59e0b",
    secondary: "#ec4899",
    primaryRgb: "245, 158, 11",
    secondaryRgb: "236, 72, 153",
    label: "Gold × Pink",
  },
  {
    id: "matrix",
    name: "Matrix",
    primary: "#10b981",
    secondary: "#22c55e",
    primaryRgb: "16, 185, 129",
    secondaryRgb: "34, 197, 94",
    label: "Emerald × Lime",
  },
  {
    id: "synthwave",
    name: "Synthwave",
    primary: "#d946ef",
    secondary: "#ec4899",
    primaryRgb: "217, 70, 239",
    secondaryRgb: "236, 72, 153",
    label: "Fuchsia × Pink",
  },
  {
    id: "crimson",
    name: "Crimson",
    primary: "#ef4444",
    secondary: "#f97316",
    primaryRgb: "239, 68, 68",
    secondaryRgb: "249, 115, 22",
    label: "Red × Orange",
  },
];

const STORAGE_KEY = "mnx-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty("--theme-primary", theme.primary);
  root.style.setProperty("--theme-secondary", theme.secondary);
  root.style.setProperty("--theme-primary-rgb", theme.primaryRgb);
  root.style.setProperty("--theme-secondary-rgb", theme.secondaryRgb);
}

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("obsidian");
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const theme = THEMES.find((t) => t.id === saved) ?? THEMES[0];
      applyTheme(theme);
      setActiveId(theme.id);
    } catch {
      // localStorage unavailable, silently fall back to default
    }
  }, []);

  // Keyboard shortcut: Alt+T cycles through themes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key.toLowerCase() !== "t") return;

      // Ignore when user is typing
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;

      e.preventDefault();
      const idx = THEMES.findIndex((t) => t.id === activeId);
      const next = THEMES[(idx + 1) % THEMES.length];
      applyTheme(next);
      setActiveId(next.id);
      try {
        localStorage.setItem(STORAGE_KEY, next.id);
        window.dispatchEvent(new CustomEvent("theme-changed", { detail: next.id }));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const selectTheme = (theme: Theme) => {
    applyTheme(theme);
    setActiveId(theme.id);
    try {
      localStorage.setItem(STORAGE_KEY, theme.id);
      // Broadcast so achievement system can react
      window.dispatchEvent(new CustomEvent("theme-changed", { detail: theme.id }));
    } catch {
      // ignore storage errors
    }
    setOpen(false);
  };

  const activeTheme = THEMES.find((t) => t.id === activeId) ?? THEMES[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Change accent theme"
        aria-expanded={open}
        className="w-7 h-7 rounded-full border border-white/20 hover:border-white/40 transition-colors flex items-center justify-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
        style={{
          background: `conic-gradient(from 0deg, ${activeTheme.primary}, ${activeTheme.secondary}, ${activeTheme.primary})`,
        }}
      >
        <span className="w-3 h-3 rounded-full bg-[#0a0a0a] group-hover:bg-[#141418] transition-colors" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-56 glass-card border border-white/10 p-2 z-[100] shadow-2xl"
            role="menu"
          >
            <div className="px-2 py-1.5 mb-1 border-b border-white/5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                Accent Theme
              </p>
            </div>
            {THEMES.map((theme) => {
              const isActive = theme.id === activeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => selectTheme(theme)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors text-left ${
                    isActive
                      ? "bg-white/5 text-white"
                      : "hover:bg-white/[0.03] text-white/70 hover:text-white"
                  }`}
                  role="menuitemradio"
                  aria-checked={isActive}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-white/15 shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{theme.name}</p>
                    <p className="text-[10px] font-mono text-white/30 truncate">
                      {theme.label}
                    </p>
                  </div>
                  {isActive && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-cyan-400 shrink-0">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
            <div className="border-t border-white/5 mt-1 pt-1 px-2">
              <p className="text-[9px] font-mono text-white/25">
                Persists across pages ·{" "}
                <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white/55 ml-0.5">
                  Alt+T
                </kbd>{" "}
                cycles
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
