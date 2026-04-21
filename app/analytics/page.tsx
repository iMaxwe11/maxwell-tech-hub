"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ACHIEVEMENTS, type Achievement } from "@/components/AchievementSystem";

interface SessionData {
  firstVisit: number;
  lastVisit: number;
  totalSessions: number;
  pageViews: Record<string, number>;
  dailyActivity: Record<string, number>; // YYYY-MM-DD -> count
  totalTimeMs: number;
}

const STORAGE_KEY = "mnx-session-data";
const ACTIVE_KEY = "mnx-active-session";

function loadSessionData(): SessionData {
  if (typeof window === "undefined") {
    return {
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      totalSessions: 0,
      pageViews: {},
      dailyActivity: {},
      totalTimeMs: 0,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        firstVisit: Date.now(),
        lastVisit: Date.now(),
        totalSessions: 0,
        pageViews: {},
        dailyActivity: {},
        totalTimeMs: 0,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      totalSessions: 0,
      pageViews: {},
      dailyActivity: {},
      totalTimeMs: 0,
    };
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return "< 1s";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function getDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const [data, setData] = useState<SessionData | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(Date.now());

  // Load data
  useEffect(() => {
    const d = loadSessionData();
    setData(d);
    try {
      const achRaw = localStorage.getItem("mnx-achievements");
      if (achRaw) setUnlocked(new Set(JSON.parse(achRaw)));
    } catch {
      // ignore
    }
  }, []);

  // Refresh when tracker writes (handles first-mount race)
  useEffect(() => {
    const refresh = () => {
      setData(loadSessionData());
      try {
        const achRaw = localStorage.getItem("mnx-achievements");
        if (achRaw) setUnlocked(new Set(JSON.parse(achRaw)));
      } catch {
        // ignore
      }
    };
    window.addEventListener("mnx-analytics-updated", refresh);
    return () => window.removeEventListener("mnx-analytics-updated", refresh);
  }, []);

  // Live tick for "time on site"
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const resetData = useCallback(() => {
    if (!confirm("Clear all your local analytics data? This cannot be undone.")) {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVE_KEY);
      localStorage.removeItem("mnx-achievements");
      localStorage.removeItem("mnx-pages-seen");
      localStorage.removeItem("mnx-themes-seen");
      setData(loadSessionData());
      setUnlocked(new Set());
    } catch {
      // ignore
    }
  }, []);

  const topPages = useMemo(() => {
    if (!data) return [];
    const entries = Object.entries(data.pageViews).sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 8);
  }, [data]);

  const maxPageViews = useMemo(() => {
    if (!data || topPages.length === 0) return 1;
    return topPages[0][1];
  }, [data, topPages]);

  const totalViews = useMemo(() => {
    if (!data) return 0;
    return Object.values(data.pageViews).reduce((a, b) => a + b, 0);
  }, [data]);

  // Build last-7-days activity
  const last7Days = useMemo(() => {
    if (!data) return [];
    const days: { date: string; count: number; label: string }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = getDayKey(d);
      days.push({
        date: key,
        count: data.dailyActivity[key] || 0,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return days;
  }, [data]);

  const maxDayCount = useMemo(
    () => Math.max(1, ...last7Days.map((d) => d.count)),
    [last7Days]
  );

  const sessionAgeMs = useMemo(() => {
    if (!data) return 0;
    return now - data.firstVisit;
  }, [data, now]);

  const unlockedAchievements = useMemo(() => {
    const unlockedList: Achievement[] = Array.from(unlocked)
      .map((id) => ACHIEVEMENTS[id])
      .filter(Boolean);
    return unlockedList;
  }, [unlocked]);

  const lockedAchievements = useMemo(() => {
    return Object.values(ACHIEVEMENTS).filter((a) => !unlocked.has(a.id));
  }, [unlocked]);

  if (!data) {
    return (
      <>
        <Navbar breadcrumb={["analytics"]} />
        <main className="min-h-screen flex items-center justify-center">
          <div className="skeleton w-60 h-10 rounded-md" />
        </main>
      </>
    );
  }

  const prettyPageName = (path: string): string => {
    if (path === "/") return "Home";
    const cleaned = path.replace(/^\//, "").split("/")[0];
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  return (
    <>
      <Navbar breadcrumb={["analytics"]} />
      <main className="min-h-screen pt-20 pb-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="terminal-prompt font-mono text-sm text-white/70">
              / analytics
            </span>
            <h1 className="mt-4 font-bold text-3xl sm:text-4xl text-white">
              Your <span className="theme-accent-gradient">Session</span>
            </h1>
            <p className="mt-4 text-white/60 max-w-2xl">
              Privacy-respecting analytics — every stat you see is computed
              locally from your browser&apos;s storage. No tracking, no cookies,
              no server calls. Clear it anytime.
            </p>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-green-500/30 bg-green-500/5 text-[11px] font-mono text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 analytics-pulse" />
                100% Client-Side
              </span>
              <span className="px-3 py-1 rounded-md border border-white/10 bg-white/[0.03] text-[11px] font-mono text-white/50">
                No cookies
              </span>
              <span className="px-3 py-1 rounded-md border border-white/10 bg-white/[0.03] text-[11px] font-mono text-white/50">
                No trackers
              </span>
            </div>
          </motion.div>

          {/* KPI grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              label="First visit"
              value={formatRelativeDate(data.firstVisit)}
              sub={new Date(data.firstVisit).toLocaleDateString()}
              delay={0.05}
            />
            <KPICard
              label="Total sessions"
              value={data.totalSessions.toString()}
              sub="since first visit"
              delay={0.1}
            />
            <KPICard
              label="Pages viewed"
              value={totalViews.toString()}
              sub="all-time"
              delay={0.15}
            />
            <KPICard
              label="Live session"
              value={formatDuration(sessionAgeMs)}
              sub="since this tab opened"
              delay={0.2}
            />
          </section>

          {/* Top pages */}
          <section>
            <h2 className="font-bold text-xl text-white mb-4">
              Top Pages
              <span className="ml-3 text-xs font-mono text-white/30">
                {topPages.length} tracked
              </span>
            </h2>
            <div className="glass-card p-6">
              {topPages.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-6">
                  No pages tracked yet. Browse around and return here.
                </p>
              ) : (
                <div className="space-y-3">
                  {topPages.map(([path, count], i) => {
                    const pct = (count / maxPageViews) * 100;
                    return (
                      <motion.div
                        key={path}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4"
                      >
                        <Link
                          href={path}
                          className="w-28 sm:w-40 text-sm text-white/80 hover:text-[color:var(--theme-primary)] font-mono truncate transition-colors shrink-0"
                        >
                          {prettyPageName(path)}
                        </Link>
                        <div className="flex-1 h-5 bg-white/[0.03] border border-white/5 rounded-md overflow-hidden">
                          <motion.div
                            className="analytics-bar"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                          />
                        </div>
                        <span className="font-mono text-xs text-white/60 w-12 text-right shrink-0">
                          {count}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Last 7 days */}
          <section>
            <h2 className="font-bold text-xl text-white mb-4">
              Last 7 days
            </h2>
            <div className="glass-card p-6">
              <div className="flex items-end justify-between gap-2 h-32">
                {last7Days.map((day, i) => {
                  const height = (day.count / maxDayCount) * 100;
                  return (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex-1 flex flex-col items-center gap-2 h-full"
                    >
                      <div className="flex-1 w-full flex items-end">
                        <motion.div
                          className="w-full rounded-t-md bg-gradient-to-t from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] opacity-70 hover:opacity-100 transition-opacity relative group"
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(2, height)}%` }}
                          transition={{ duration: 0.6, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                          style={{ minHeight: day.count > 0 ? "4px" : "2px" }}
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.count}
                          </span>
                        </motion.div>
                      </div>
                      <span className="text-[10px] font-mono text-white/40 uppercase">
                        {day.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-4 text-xs font-mono text-white/30 text-center">
                Peak day: {maxDayCount} {maxDayCount === 1 ? "view" : "views"} · Total 7d:{" "}
                {last7Days.reduce((s, d) => s + d.count, 0)}
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl text-white">
                Achievements
                <span className="ml-3 text-xs font-mono text-white/30">
                  {unlockedAchievements.length} / {Object.keys(ACHIEVEMENTS).length}
                </span>
              </h2>
              <div className="text-xs font-mono text-[color:var(--theme-primary)]">
                {Math.round(
                  (unlockedAchievements.length / Object.keys(ACHIEVEMENTS).length) *
                    100
                )}
                % complete
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {unlockedAchievements.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`glass-card p-3 relative overflow-hidden ${
                    a.rarity === "legendary" ? "border-yellow-500/30" : ""
                  }`}
                >
                  {a.rarity === "legendary" && (
                    <div className="absolute inset-0 achievement-shimmer pointer-events-none" />
                  )}
                  <div className="relative">
                    <div className="text-2xl mb-1.5">{a.icon}</div>
                    <p className="text-sm font-bold text-white leading-tight">
                      {a.title}
                    </p>
                    <p className="text-[10px] text-white/50 mt-1 leading-tight">
                      {a.description}
                    </p>
                    <p
                      className={`text-[9px] font-mono uppercase tracking-wider mt-2 ${
                        a.rarity === "legendary"
                          ? "text-yellow-400"
                          : a.rarity === "rare"
                            ? "text-purple-400"
                            : "text-cyan-400"
                      }`}
                    >
                      ★ {a.rarity}
                    </p>
                  </div>
                </motion.div>
              ))}
              {lockedAchievements.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  transition={{ delay: (unlockedAchievements.length + i) * 0.03 }}
                  className="glass-card p-3 border-white/5"
                >
                  <div className="text-2xl mb-1.5 grayscale opacity-40">🔒</div>
                  <p className="text-sm font-bold text-white/40 leading-tight">
                    ???
                  </p>
                  <p className="text-[10px] text-white/30 mt-1 leading-tight">
                    Keep exploring…
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Privacy / Reset */}
          <section className="glass-card p-6 space-y-3">
            <h3 className="font-bold text-white">How this works</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Every page visit increments a counter in your browser&apos;s{" "}
              <code className="text-[color:var(--theme-primary)] font-mono text-xs">
                localStorage
              </code>
              . Nothing is sent to a server, no cookies are set, and no
              third-party trackers are loaded. This entire dashboard is rendered
              from data that never leaves your device.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={resetData}
                className="glow-btn text-xs"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                </svg>
                <span>Clear My Data</span>
              </button>
              <Link href="/terminal" className="glow-btn text-xs">
                <span>Open Terminal</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function KPICard({
  label,
  value,
  sub,
  delay = 0,
}: {
  label: string;
  value: string;
  sub: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-5"
    >
      <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
        {label}
      </p>
      <p className="text-2xl sm:text-3xl font-bold theme-accent-gradient truncate">
        {value}
      </p>
      <p className="text-[11px] text-white/50 mt-1">{sub}</p>
    </motion.div>
  );
}
