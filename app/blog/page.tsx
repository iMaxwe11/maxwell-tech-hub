"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Inbox, PenLine, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SORTED_POSTS, type BlogPost } from "@/lib/blog-posts";
import { CATEGORIES, CATEGORY_COLORS, getPostIcon } from "@/lib/blog-icons";

/* ═══ Origin Badge ═══ */
function OriginBadge({ post, size = "sm" }: { post: BlogPost; size?: "sm" | "md" }) {
  const cls =
    size === "md"
      ? "px-2.5 py-1 text-[10px] gap-1.5"
      : "px-2 py-0.5 text-[9px] gap-1";
  return (
    <span
      className={`inline-flex items-center rounded-full font-mono border border-white/10 text-white/35 ${cls}`}
      title={post.original ? "Written by Maxwell from real project work" : "AI-curated micro-article"}
    >
      {post.original ? <PenLine size={size === "md" ? 11 : 9} /> : <Sparkles size={size === "md" ? 11 : 9} />}
      {post.original ? "FIELD NOTES" : "AI"}
    </span>
  );
}

/* ═══ Featured Card ═══ */
function FeaturedCard({ post }: { post: BlogPost }) {
  const color = CATEGORY_COLORS[post.category] || "#06b6d4";
  const Icon = getPostIcon(post.icon);

  return (
    <Link href={`/blog/${post.id}`} className="block">
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
            <span style={{ color }}>
              <Icon size={20} />
            </span>
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
            <OriginBadge post={post} size="md" />
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
            <span>Read post</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ═══ Post Card ═══ */
function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const color = CATEGORY_COLORS[post.category] || "#06b6d4";
  const Icon = getPostIcon(post.icon);

  return (
    <Link href={`/blog/${post.id}`} className="block">
      <motion.div
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
          <span className="flex-shrink-0 mt-0.5" style={{ color }}>
            <Icon size={18} />
          </span>
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
              <OriginBadge post={post} />
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
          <ArrowRight
            size={14}
            className="shrink-0 mt-1 text-white/10 group-hover:text-white/30 group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </motion.div>
    </Link>
  );
}

/* ═══ BLOG PAGE ═══ */
export default function BlogPage() {
  const [activeCat, setActiveCat] = useState("all");

  const posts = useMemo(
    () =>
      activeCat === "all"
        ? SORTED_POSTS
        : SORTED_POSTS.filter((p) => p.category === activeCat),
    [activeCat]
  );

  const featured = posts.length > 0 ? posts[0] : null;
  const others = posts.length > 1 ? posts.slice(1) : [];

  const stats = {
    totalPosts: SORTED_POSTS.length,
    fieldNotes: SORTED_POSTS.filter((p) => p.original).length,
    avgReadTime:
      SORTED_POSTS.length > 0
        ? Math.round(
            SORTED_POSTS.reduce((sum, p) => sum + parseInt(p.readTime), 0) /
              SORTED_POSTS.length
          )
        : 0,
  };

  return (
    <>
      <div className="aurora-bg">
        <div className="aurora-band" />
        <div className="aurora-band" />
      </div>

      <Navbar breadcrumb={["blog"]} accent="#a855f7" />

      {/* Hero */}
      <div className="pt-28 pb-4 px-4 sm:px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="terminal-prompt font-mono text-sm text-white/50">$ blog --field-notes --shorts</span>
            <h1 className="mt-3 font-bold text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
              Tech <span className="gradient-text">Shorts</span>
            </h1>
            <p className="mt-3 text-white/50 max-w-xl text-lg">
              Build logs from my own projects and homelab, plus AI-curated micro-articles on tech,
              science, space, and dev culture.
            </p>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono text-white/40">
                <PenLine size={11} className="text-[#d4af37]" />
                FIELD NOTES · WRITTEN BY ME
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono text-white/40">
                <Sparkles size={11} className="text-purple-400" />
                SHORTS · AI-CURATED
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="sticky top-16 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 mt-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              return (
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
                  <CatIcon size={14} />
                  <span>{cat.label}</span>
                  <span className="text-[10px] font-mono opacity-60">
                    {cat.id === "all"
                      ? SORTED_POSTS.length
                      : SORTED_POSTS.filter((p) => p.category === cat.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 pb-24 mt-12 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main column */}
            <div className="lg:col-span-3">
              {posts.length === 0 ? (
                <div className="text-center py-20">
                  <Inbox size={36} className="mx-auto mb-4 text-white/20" />
                  <p className="text-white/40 text-sm">No articles available for this category.</p>
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
                    {/* Featured Post */}
                    {featured && (
                      <>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" />
                          <span className="text-xs font-mono uppercase tracking-[0.3em] text-purple-400/80">Featured</span>
                        </div>
                        <div className="mb-12">
                          <FeaturedCard post={featured} />
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
                            <PostCard key={post.id} post={post} index={i} />
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
                    <p className="text-2xl font-bold text-[#d4af37]">{stats.fieldNotes}</p>
                    <p className="text-[10px] text-white/30 font-mono mt-1">Field Notes</p>
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
            <p className="text-white/20 text-[10px] font-mono">Field notes &amp; curated tech shorts</p>
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
