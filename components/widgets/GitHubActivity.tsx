"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GitHubActivityItem, GitHubProfileSummary } from "@/lib/types";
import { siteConfig } from "@/lib/site-config";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface GitHubActivityResponse {
  profile: GitHubProfileSummary | null;
  items: GitHubActivityItem[];
}

export function GitHubActivity() {
  const [profile, setProfile] = useState<GitHubProfileSummary | null>(null);
  const [items, setItems] = useState<GitHubActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch("/api/github/activity");
      if (!response.ok) {
        throw new Error(`GitHub activity request failed with ${response.status}`);
      }

      const data = (await response.json()) as GitHubActivityResponse;
      setProfile(data.profile);
      setItems(data.items);
    } catch (fetchError) {
      console.error(fetchError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  if (loading) {
    return (
      <div className="glass-card p-7 animate-pulse">
        <div className="h-4 w-28 bg-white/10 rounded mb-4" />
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 space-y-2">
              <div className="h-6 bg-white/10 rounded" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 rounded-xl bg-white/[0.03] border border-white/[0.05]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="glass-card p-7">
        <h3 className="text-lg font-bold text-white mb-2">GitHub Activity</h3>
        <p className="text-white/45 text-sm">GitHub activity is temporarily unavailable.</p>
        <button
          onClick={() => void fetchActivity()}
          className="mt-4 px-4 py-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 text-xs font-mono hover:bg-cyan-400/15 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-7">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">⌘</span> GitHub Activity
          </h3>
          <p className="text-xs text-white/40 font-mono mt-1">@{profile.login}</p>
        </div>
        <a
          href={profile.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          View profile ↗
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Public repos", value: profile.publicRepos },
          { label: "Followers", value: profile.followers },
          { label: "Recent events", value: items.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
            <div className="text-2xl font-bold text-cyan-300">{stat.value}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="block rounded-xl border border-white/[0.05] bg-black/20 hover:border-cyan-400/20 hover:bg-white/[0.03] transition-all p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 flex items-center justify-center font-mono">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-white font-semibold line-clamp-1">{item.action}</p>
                    <span className="text-[10px] font-mono text-white/30 shrink-0">{timeAgo(item.createdAt)}</span>
                  </div>
                  <p className="text-xs font-mono text-cyan-300/80 mt-1 line-clamp-1">{item.repo}</p>
                  {item.detail && <p className="text-xs text-white/45 mt-2 line-clamp-2">{item.detail}</p>}
                </div>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>

      <p className="mt-4 text-[10px] text-white/25 font-mono">
        Live from public GitHub events with a cached server-side proxy.
      </p>
    </motion.div>
  );
}
