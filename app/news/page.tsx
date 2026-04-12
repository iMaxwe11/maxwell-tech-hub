"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";
import { Navbar } from "@/components/Navbar";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  time: string;
  category: string;
  image?: string;
}

/* ═══ Section Wrapper ═══ */
function Sec({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section ref={ref} initial={{ opacity: 0, y: 40 }} animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.section>
  );
}

/* ═══ Category Config ═══ */
const CATEGORIES = [
  { id: "tech", label: "Tech", icon: "💻", color: "#06b6d4", desc: "Technology, startups, and programming" },
  { id: "world", label: "World", icon: "🌍", color: "#a855f7", desc: "Global news and current events" },
  { id: "gaming", label: "Gaming", icon: "🎮", color: "#22c55e", desc: "Video games, esports, and industry" },
];

/* ═══ Time Ago ═══ */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ═══ Source Badge Colors ═══ */
function sourceBadge(source: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    "Hacker News": { bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-400" },
    "The Verge": { bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400" },
    "Ars Technica": { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
    "BBC World": { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
    "NY Times": { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
    "Reuters": { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
    "Kotaku": { bg: "bg-green-500/10 border-green-500/20", text: "text-green-400" },
    "GameSpot": { bg: "bg-yellow-500/10 border-yellow-500/20", text: "text-yellow-400" },
    "PC Gamer": { bg: "bg-cyan-500/10 border-cyan-500/20", text: "text-cyan-400" },
  };
  return map[source] || { bg: "bg-white/5 border-white/10", text: "text-white/60" };
}

/* ═══ Featured Card (top story) ═══ */
function FeaturedCard({ item, color }: { item: NewsItem; color: string }) {
  const badge = sourceBadge(item.source);
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="block glass-card p-6 sm:p-8 relative overflow-hidden group hover:border-white/10 transition-all"
    >
      {/* Decorative gradient */}
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ background: color }} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${badge.bg} ${badge.text}`}>
            {item.source}
          </span>
          <span className="text-[10px] text-white/30 font-mono">{timeAgo(item.time)}</span>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 text-white/30">
            FEATURED
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-cyan-200 transition-colors">
          {item.title}
        </h2>
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-white/30 group-hover:text-cyan-400/50 transition-colors">
          <span>Read full story</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.a>
  );
}

/* ═══ News Card ═══ */
function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const badge = sourceBadge(item.source);
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${badge.bg} ${badge.text}`}>
              {item.source}
            </span>
            <span className="text-[9px] text-white/25 font-mono">{timeAgo(item.time)}</span>
          </div>
          <h3 className="text-sm font-semibold text-white/80 leading-snug group-hover:text-white transition-colors line-clamp-2">
            {item.title}
          </h3>
        </div>
        <svg className="shrink-0 mt-1 text-white/10 group-hover:text-white/30 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
        </svg>
      </div>
    </motion.a>
  );
}

/* ═══ Ticker Bar ═══ */
function NewsTicker({ items }: { items: NewsItem[] }) {
  const tickerItems = items.slice(0, 10);
  return (
    <div className="overflow-hidden py-3 border-y border-white/5 bg-white/[0.01]">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
            <span className="font-mono text-[10px] text-white/25">{item.source}</span>
            <span>{item.title.length > 70 ? item.title.slice(0, 70) + "…" : item.title}</span>
          </a>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══ NEWS PAGE ═══ */
export default function NewsPage() {
  const [activeCat, setActiveCat] = useState("tech");
  const [news, setNews] = useState<Record<string, NewsItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchCategory = useCallback(async (cat: string) => {
    try {
      const res = await fetch(`/api/news?category=${cat}`);
      if (!res.ok) return;
      const data = await res.json();
      setNews(prev => ({ ...prev, [cat]: data }));
    } catch (e) {
      console.error(`News fetch error [${cat}]:`, e);
    }
  }, []);

  // Fetch all categories on mount
  useEffect(() => {
    setLoading(true);
    Promise.all(CATEGORIES.map(c => fetchCategory(c.id)))
      .then(() => {
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
      });
  }, [fetchCategory]);

  const currentItems = news[activeCat] || [];
  const currentCat = CATEGORIES.find(c => c.id === activeCat)!;
  const allItems = Object.values(news).flat().sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>

      <Navbar breadcrumb={["news"]} accent="#06b6d4" />

      {/* Hero */}
      <div className="pt-28 pb-4 px-4 sm:px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="terminal-prompt font-mono text-sm text-white/50">news_feed</span>
            <h1 className="mt-3 font-bold text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
              News <span className="gradient-text">Feed</span>
            </h1>
            <p className="mt-3 text-white/50 max-w-xl text-lg">
              Auto-curated headlines from across the web — tech, world, and gaming — updated throughout the day.
            </p>
            {lastUpdated && (
              <p className="mt-2 text-[10px] font-mono text-white/30">
                Last updated {lastUpdated} · Sources refresh every 15 minutes
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Ticker */}
      {allItems.length > 0 && (
        <div className="relative z-10 mt-4">
          <NewsTicker items={allItems} />
        </div>
      )}

      {/* Category Tabs */}
      <div className="sticky top-16 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 mt-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeCat === cat.id
                    ? "text-white border"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
                style={activeCat === cat.id ? {
                  background: `${cat.color}10`,
                  borderColor: `${cat.color}30`,
                  color: cat.color,
                } : undefined}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {news[cat.id] && (
                  <span className="text-[10px] font-mono opacity-60">{news[cat.id].length}</span>
                )}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <motion.div
                animate={{ opacity: loading ? [1, 0.3, 1] : 1 }}
                transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
                className={`w-2 h-2 rounded-full ${loading ? "bg-amber-400" : "bg-green-500"}`}
              />
              <span className="text-[10px] text-white/30 font-mono hidden sm:inline">
                {loading ? "Fetching..." : "Live"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 pb-24 mt-8 relative z-10">
        <div className="max-w-[1400px] mx-auto">

          {loading && currentItems.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="glass-card p-5 animate-pulse">
                  <div className="flex gap-2 mb-3">
                    <div className="w-16 h-4 bg-white/5 rounded-full" />
                    <div className="w-10 h-4 bg-white/5 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded w-full" />
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-white/40 text-sm">No articles available right now for {currentCat.label}.</p>
              <p className="text-white/20 text-xs font-mono mt-1">Feed sources may be temporarily unavailable.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-0.5 rounded-full" style={{ background: currentCat.color }} />
                  <span className="text-xs font-mono uppercase tracking-[0.3em]" style={{ color: `${currentCat.color}99` }}>
                    {currentCat.label} News
                  </span>
                  <span className="text-xs text-white/20 font-mono">— {currentCat.desc}</span>
                </div>

                {/* Featured story */}
                <div className="mb-6">
                  <FeaturedCard item={currentItems[0]} color={currentCat.color} />
                </div>

                {/* Story grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentItems.slice(1).map((item, i) => (
                    <NewsCard key={item.url + i} item={item} index={i} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/5 relative z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <p className="text-white/25 text-xs font-mono">&copy; {new Date().getFullYear()} Maxwell Nixon</p>
            <span className="text-white/10">|</span>
            <p className="text-white/20 text-[10px] font-mono">RSS feeds auto-refresh every 15 minutes</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Home</Link>
            <Link href="/space" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Space</Link>
            <Link href="/weather" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Weather</Link>
            <Link href="/tools" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Tools</Link>
            <Link href="/play" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">Arcade</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
