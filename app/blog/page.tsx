"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";
import { Navbar } from "@/components/Navbar";
import type { BlogPost } from "@/app/api/blog/route";

/* ═══ Section Wrapper ═══ */
function Sec({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ═══ Category Config ═══ */
const CATEGORIES = [
  { id: "all", label: "All", emoji: "✨", color: "#06b6d4" },
  { id: "ai", label: "AI", emoji: "🧠", color: "#a855f7" },
  { id: "dev", label: "Dev", emoji: "💻", color: "#06b6d4" },
  { id: "space", label: "Space", emoji: "🚀", color: "#6366f1" },
  { id: "gaming", label: "Gaming", emoji: "🎮", color: "#22c55e" },
  { id: "science", label: "Science", emoji: "🔬", color: "#f59e0b" },
  { id: "security", label: "Security", emoji: "🔐", color: "#ef4444" },
];

const CATEGORY_COLORS: Record<string, string> = {
  ai: "#a855f7",
  dev: "#06b6d4",
  space: "#6366f1",
  gaming: "#22c55e",
  science: "#f59e0b",
  security: "#ef4444",
};

/* ═══ Featured Card ═══ */
function FeaturedCard({ post }: { post: BlogPost }) {
  const color = CATEGORY_COLORS[post.category] || "#06b6d4";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 sm:p-8 relative overflow-hidden group hover:border-white/10 transition-all"
    >
      {/* Decorative gradient */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ background: color }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xl">{post.emoji}</span>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-mono border"
            style={{
              background: `${color}15`,
              borderColor: `${color}40`,
              color: color,
            }}
          >
            {post.category.toUpperCase()}
          </span>
          <span className="text-[10px] text-white/30 font-mono">{post.date}</span>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 text-white/30">
            FEATURED
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-cyan-200 transition-colors">
          {post.title}
        </h2>
        <p className="mt-3 text-sm text-white/60 leading-relaxed">{post.excerpt}</p>
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-white/30 group-hover:text-cyan-400/50 transition-colors">
          <span>{post.readTime}</span>
          <span>•</span>
          <span>{post.tags.length} tags</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ Post Card ═══ */
function PostCard({ post, index, onExpand }: { post: BlogPost; index: number; onExpand: (id: string) => void }) {
  const color = CATEGORY_COLORS[post.category] || "#06b6d4";

  return (
    <motion.button
      onClick={() => onExpand(post.id)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="text-left p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all group relative overflow-hidden w-full"
    >
      {/* Left accent border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all"
        style={{ background: color }}
      />

      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{post.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-mono border"
              style={{
                background: `${color}15`,
                borderColor: `${color}40`,
                color: color,
              }}
            >
              {post.category}
            </span>
            <span className="text-[9px] text-white/25 font-mono">{post.date}</span>
          </div>
          <h3 className="text-sm font-semibold text-white/80 leading-snug group-hover:text-white transition-colors line-clamp-2">
            {post.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-[8px] text-white/30 font-mono">
            <span>{post.readTime}</span>
            <span>•</span>
            <span>{post.tags.length} tags</span>
          </div>
        </div>
        <svg
          className="shrink-0 mt-1 text-white/10 group-hover:text-white/30 transition-colors"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
}

/* ═══ Expanded Post View ═══ */
function ExpandedPost({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const color = CATEGORY_COLORS[post.category] || "#06b6d4";
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const paragraphs = post.content.split("\n\n");

  return (
    <motion.div
      ref={contentRef}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 sm:p-8 mb-4 relative overflow-hidden"
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{post.emoji}</span>
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-mono border"
                style={{
                  background: `${color}15`,
                  borderColor: `${color}40`,
                  color: color,
                }}
              >
                {post.category.toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{post.title}</h2>
            <div className="mt-3 flex items-center gap-3 flex-wrap text-xs font-mono text-white/40">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Close article"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Excerpt */}
        <p className="text-lg text-white/70 leading-relaxed mb-6 pb-6 border-b border-white/10">{post.excerpt}</p>

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-6">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-white/60 leading-relaxed mb-4 last:mb-0">
              {para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) =>
                chunk.startsWith("**") ? (
                  <strong key={j} className="text-white/80 font-semibold">
                    {chunk.slice(2, -2)}
                  </strong>
                ) : (
                  chunk
                )
              )}
            </p>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-[10px] font-mono border"
              style={{
                background: `${color}10`,
                borderColor: `${color}30`,
                color: color,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ BLOG PAGE ═══ */
export default function BlogPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/blog?category=${activeCat}`);
      if (!res.ok) {
        throw new Error(`Blog request failed with ${res.status}`);
      }

      const data = (await res.json()) as BlogPost[];
      // Sort by date descending
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPosts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Blog fetch error [${activeCat}]:`, err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [activeCat]);

  useEffect(() => {
    setExpandedId(null); // Clear expanded post when category changes
    void fetchPosts();
  }, [activeCat, fetchPosts]);

  const featured = posts.length > 0 ? posts[0] : null;
  const others = posts.length > 1 ? posts.slice(1) : [];
  const allPosts = useMemo(() => posts, [posts]);

  const categoryCount = (catId: string) => {
    if (catId === "all") return posts.length;
    return posts.filter(p => p.category === catId).length;
  };

  const stats = {
    totalPosts: allPosts.length,
    categories: new Set(allPosts.map(p => p.category)).size,
    avgReadTime:
      allPosts.length > 0
        ? Math.round(
            allPosts.reduce((sum, p) => sum + parseInt(p.readTime), 0) / allPosts.length
          )
        : 0,
  };

  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg">
        <div className="aurora-band" />
        <div className="aurora-band" />
      </div>

      <Navbar breadcrumb={["blog"]} accent="#a855f7" />

      {/* Hero */}
      <div className="pt-28 pb-4 px-4 sm:px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="terminal-prompt font-mono text-sm text-white/50">$ blog --ai-generated</span>
            <h1 className="mt-3 font-bold text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
              Tech <span className="gradient-text">Shorts</span>
            </h1>
            <p className="mt-3 text-white/50 max-w-xl text-lg">
              AI-generated micro-articles on tech, science, space, and dev culture. Fresh perspectives, zero fluff.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono text-white/40">
                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                  ✨
                </motion.span>
                AI-GENERATED · AUTO-CURATED
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="sticky top-16 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 mt-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeCat === cat.id ? "text-white border" : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
                style={
                  activeCat === cat.id
                    ? {
                        background: `${cat.color}10`,
                        borderColor: `${cat.color}30`,
                        color: cat.color,
                      }
                    : undefined
                }
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] font-mono opacity-60">
                  {posts.filter(p => cat.id === "all" || p.category === cat.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 pb-24 mt-12 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main column */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="space-y-4">
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
              ) : error && posts.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <span className="text-4xl mb-4 block">⚠️</span>
                  <p className="text-white/60 text-sm">Articles are temporarily unavailable.</p>
                  <p className="text-white/30 text-xs font-mono mt-2">{error}</p>
                  <button
                    onClick={() => void fetchPosts()}
                    className="mt-4 px-4 py-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 text-xs font-mono hover:bg-cyan-400/15 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-4xl mb-4 block">📭</span>
                  <p className="text-white/40 text-sm">No articles available for this category.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={activeCat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    {/* Featured Post */}
                    {featured && (
                      <>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" />
                          <span className="text-xs font-mono uppercase tracking-[0.3em] text-purple-400/80">Featured</span>
                        </div>
                        <div className="mb-12">
                          <AnimatePresence mode="wait">
                            {expandedId === featured.id ? (
                              <ExpandedPost key={featured.id} post={featured} onClose={() => setExpandedId(null)} />
                            ) : (
                              <FeaturedCard key={featured.id} post={featured} />
                            )}
                          </AnimatePresence>
                        </div>
                      </>
                    )}

                    {/* Other Posts Grid */}
                    {others.length > 0 && (
                      <>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" />
                          <span className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400/80">Articles</span>
                        </div>

                        <div className="space-y-3">
                          {others.map((post, i) => (
                            <AnimatePresence key={post.id} mode="wait">
                              {expandedId === post.id ? (
                                <ExpandedPost key={post.id} post={post} onClose={() => setExpandedId(null)} />
                              ) : (
                                <PostCard key={post.id} post={post} index={i} onExpand={setExpandedId} />
                              )}
                            </AnimatePresence>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Sidebar Stats */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] sticky top-32 h-fit"
              >
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-4">Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">{stats.totalPosts}</p>
                    <p className="text-[10px] text-white/30 font-mono mt-1">Total Posts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{stats.categories}</p>
                    <p className="text-[10px] text-white/30 font-mono mt-1">Categories</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-400">{stats.avgReadTime}</p>
                    <p className="text-[10px] text-white/30 font-mono mt-1">Avg Read Time (min)</p>
                  </div>
                </div>
              </motion.div>
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
            <p className="text-white/20 text-[10px] font-mono">Curated tech micro-articles</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">
              Home
            </Link>
            <Link href="/news" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">
              News
            </Link>
            <Link href="/space" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">
              Space
            </Link>
            <Link href="/tools" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">
              Tools
            </Link>
            <Link href="/play" className="text-white/30 hover:text-cyan-400 transition-colors text-xs font-mono">
              Arcade
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
