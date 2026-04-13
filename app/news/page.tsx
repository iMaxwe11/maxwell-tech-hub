"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";
import { Navbar } from "@/components/Navbar";
import type { NewsItem, VideoFeedItem } from "@/lib/types";

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

/* ═══ Check if Breaking (< 30 mins) ═══ */
function isBreaking(dateStr: string): boolean {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  return mins < 30;
}

/* ═══ Estimate Reading Time ═══ */
function estimateReadingTime(title: string): number {
  const wordsPerMin = 200;
  const words = title.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMin));
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
function NewsCard({ item, index, color }: { item: NewsItem; index: number; color?: string }) {
  const badge = sourceBadge(item.source);
  const breaking = isBreaking(item.time);
  const readTime = estimateReadingTime(item.title);
  const borderColor = color || "#06b6d4";

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all group relative overflow-hidden"
    >
      {/* Left accent border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all"
        style={{ background: borderColor }}
      />

      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {breaking && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-red-500/50 bg-red-500/10 text-red-400 animate-pulse">
                BREAKING
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${badge.bg} ${badge.text}`}>
              {item.source}
            </span>
            <span className="text-[9px] text-white/25 font-mono">{timeAgo(item.time)}</span>
          </div>
          <h3 className="text-sm font-semibold text-white/80 leading-snug group-hover:text-white transition-colors line-clamp-2 pl-3">
            {item.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-[8px] text-white/30 font-mono pl-3">
            <span>{readTime} min read</span>
            <span>•</span>
            <span>{item.category}</span>
          </div>
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

/* ═══ Video Card ═══ */
function VideoCard({ video, index }: { video: VideoFeedItem; index: number }) {
  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex-shrink-0 w-80 group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-black border border-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20">
        <div className="relative w-full aspect-video bg-black overflow-hidden">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 320px, 80vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/60 border border-white/15 flex items-center justify-center shadow-[0_0_24px_rgba(6,182,212,0.25)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-300 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white/70">
          {video.channel}
        </div>

        <div className="p-4">
          <p className="text-white text-sm font-semibold line-clamp-2 group-hover:text-cyan-100 transition-colors">
            {video.title}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-mono text-white/35">
            <span>{video.topic || "Channel update"}</span>
            <span>{timeAgo(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

/* ═══ Trending Videos Section ═══ */
function TrendingVideos() {
  const [videos, setVideos] = useState<VideoFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(false);

      try {
        const response = await fetch("/api/videos");
        if (!response.ok) {
          throw new Error(`Video feed request failed with ${response.status}`);
        }

        const data = (await response.json()) as VideoFeedItem[];
        setVideos(data);
      } catch (fetchError) {
        console.error(fetchError);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchVideos();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: dir === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  const showFallback = !loading && (error || videos.length === 0);

  return (
    <Sec className="mt-12 relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-purple-400/80">
            Trending Videos
          </span>
          <span className="text-xs text-white/20 font-mono">— Live from keyless channel feeds</span>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-80 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden animate-pulse">
                <div className="aspect-video bg-white/5" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/5 rounded" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : showFallback ? (
          <div className="glass-card p-6">
            <p className="text-white/70 text-sm">Video highlights are temporarily unavailable.</p>
            <p className="text-white/30 text-xs font-mono mt-2">The news feed still works normally while YouTube channel feeds recover.</p>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {videos.map((video, i) => (
                <VideoCard key={`${video.id}-${video.publishedAt}`} video={video} index={i} />
              ))}
            </div>

            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/3 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white transition-all"
              aria-label="Scroll left"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/3 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white transition-all"
              aria-label="Scroll right"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19l7-7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </Sec>
  );
}

/* ═══ Quick Stats Sidebar ═══ */
function QuickStats({ allItems }: { allItems: NewsItem[] }) {
  const sources = new Set(allItems.map(item => item.source)).size;
  const freshestTime = allItems.length > 0 ? timeAgo(allItems[0].time) : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] sticky top-32 h-fit"
    >
      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-4">Quick Stats</h3>
      <div className="space-y-4">
        <div>
          <p className="text-2xl font-bold text-cyan-400">{allItems.length}</p>
          <p className="text-[10px] text-white/30 font-mono mt-1">Total Articles</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-400">{sources}</p>
          <p className="text-[10px] text-white/30 font-mono mt-1">News Sources</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-400 line-clamp-1">{freshestTime}</p>
          <p className="text-[10px] text-white/30 font-mono mt-1">Newest Article</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ NEWS PAGE ═══ */
export default function NewsPage() {
  const [activeCat, setActiveCat] = useState("tech");
  const [news, setNews] = useState<Record<string, NewsItem[]>>({});
  const [loadingCategories, setLoadingCategories] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map((category) => [category.id, true])),
  );
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>({});
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchCategory = useCallback(async (cat: string) => {
    setLoadingCategories((prev) => ({ ...prev, [cat]: true }));

    try {
      const res = await fetch(`/api/news?category=${cat}`);
      if (!res.ok) {
        throw new Error(`News request failed with ${res.status}`);
      }

      const data = (await res.json()) as NewsItem[];
      setNews(prev => ({ ...prev, [cat]: data }));
      setCategoryErrors((prev) => ({ ...prev, [cat]: "" }));
      setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`News fetch error [${cat}]:`, error);
      setCategoryErrors((prev) => ({ ...prev, [cat]: message }));
    } finally {
      setLoadingCategories((prev) => ({ ...prev, [cat]: false }));
    }
  }, []);

  // Fetch all categories on mount
  useEffect(() => {
    CATEGORIES.forEach((category) => {
      void fetchCategory(category.id);
    });
  }, [fetchCategory]);

  const loading = Object.values(loadingCategories).some(Boolean);
  const currentItems = news[activeCat] || [];
  const currentCat = CATEGORIES.find(c => c.id === activeCat)!;
  const activeLoading = loadingCategories[activeCat];
  const activeError = categoryErrors[activeCat];
  const allItems = useMemo(
    () => Object.values(news).flat().sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),
    [news],
  );

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
                {loading ? "Syncing..." : "Live"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Videos */}
      {!loading && <TrendingVideos />}

      {/* Main Content */}
      <main className="px-4 sm:px-6 pb-24 mt-12 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content column */}
            <div className="lg:col-span-3">
              {activeLoading && currentItems.length === 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
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
              ) : activeError && currentItems.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <span className="text-4xl mb-4 block">⚠️</span>
                  <p className="text-white/60 text-sm">{currentCat.label} headlines are temporarily unavailable.</p>
                  <p className="text-white/30 text-xs font-mono mt-2">{activeError}</p>
                  <button
                    onClick={() => void fetchCategory(activeCat)}
                    className="mt-4 px-4 py-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 text-xs font-mono hover:bg-cyan-400/15 transition-colors"
                  >
                    Retry feed
                  </button>
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

                    {/* Top Stories (first 3) */}
                    {currentItems.length > 0 && (
                      <>
                        <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-4">Top Stories</h3>
                        <div className="grid sm:grid-cols-2 gap-4 mb-12">
                          {currentItems.slice(0, Math.min(3, currentItems.length)).map((item, i) => (
                            <motion.div
                              key={item.url}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <FeaturedCard item={item} color={currentCat.color} />
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Latest News */}
                    {currentItems.length > 3 && (
                      <>
                        <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-4">Latest Updates</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {currentItems.slice(3).map((item, i) => (
                            <NewsCard key={item.url + i} item={item} index={i} color={currentCat.color} />
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {!loading && allItems.length > 0 && <QuickStats allItems={allItems} />}
            </div>
          </div>
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
