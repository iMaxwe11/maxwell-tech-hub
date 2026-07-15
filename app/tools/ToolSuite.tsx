"use client";
// Tools launcher: a searchable grid of 35 tool cards. Opening a card mounts ONLY
// that tool (each tool is its own dynamic chunk — see ./tools/index.ts). The
// active tool is encoded in the URL hash (#toolid), so old anchor links and
// share links (#toolid?v=...) keep working.
//
// Launcher niceties: pinned tools sort first, a Recently Used strip appears
// above the grid, arrow keys walk the grid (Enter launches), and the focused
// tool view carries a proper header with a copy-share-link button plus a
// related-tools row.

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Check, CircleDot, Dice6, History, Link2, Pin, Search, Terminal, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CAT_COLORS, CATEGORIES, NAV_IDS, TOOL_META, type ToolId } from "./tool-config";
import { MatrixRain, readHashPrefill, SpotlightCursor, ToolCountBadge, ToolsParticles } from "./shared";
import { readPinned, readRecents, readUsage, recordToolUse, togglePinned } from "./tool-prefs";
import { TOOL_COMPONENTS } from "./tools";

const TOOL_COUNT = NAV_IDS.length;

function isToolId(id: string): id is ToolId {
  return (NAV_IDS as readonly string[]).includes(id);
}

/* ── Launcher card ── */
function ToolCard({
  id,
  onOpen,
  index,
  hackerMode,
  selected,
  pinned,
  onTogglePin,
  uses,
  dataIdx,
}: {
  id: ToolId;
  onOpen: (id: ToolId) => void;
  index: number;
  hackerMode: boolean;
  selected: boolean;
  pinned: boolean;
  onTogglePin: (id: ToolId) => void;
  uses: number;
  dataIdx: number;
}) {
  const meta = TOOL_META[id];
  const color = hackerMode ? "#4ade80" : CAT_COLORS[meta.cat as keyof typeof CAT_COLORS] ?? "#06b6d4";
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      data-tool-idx={dataIdx}
      onClick={() => onOpen(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(id);
        }
      }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.35 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="group cursor-pointer text-left p-4 rounded-2xl bg-white/[0.02] border hover:bg-white/[0.04] transition-colors relative overflow-hidden focus:outline-none"
      style={{
        borderColor: selected ? `${color}70` : "rgba(255,255,255,0.06)",
        boxShadow: selected ? `0 0 0 1px ${color}70, 0 0 24px ${color}25` : undefined,
      }}
    >
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"
        style={{ background: color }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <motion.span
            whileHover={{ rotate: -8, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="p-2 rounded-xl border transition-colors"
            style={{ background: `${color}12`, borderColor: `${color}30`, color }}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden />
          </motion.span>
          <span className="flex items-center gap-1.5">
            <span
              className="px-2 py-0.5 rounded-full text-[0.55rem] font-[family-name:var(--font-mono)] uppercase tracking-wider border"
              style={{ background: `${color}10`, borderColor: `${color}25`, color }}
            >
              {meta.cat}
            </span>
            <button
              type="button"
              aria-label={pinned ? `Unpin ${meta.label}` : `Pin ${meta.label}`}
              aria-pressed={pinned}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(id);
              }}
              className={`p-1 rounded-md border transition-all ${
                pinned
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 border-white/10 text-white/35 hover:text-white/70 bg-white/[0.03]"
              }`}
              style={pinned ? { background: `${color}15`, borderColor: `${color}40`, color } : undefined}
            >
              <Pin size={11} strokeWidth={2} fill={pinned ? "currentColor" : "none"} aria-hidden />
            </button>
          </span>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-white/85 group-hover:text-white transition-colors flex items-baseline gap-1.5">
          {meta.label}
          {uses >= 3 && (
            <span className="text-[0.55rem] font-[family-name:var(--font-mono)] text-white/25">×{uses}</span>
          )}
        </h3>
        <p className="mt-1 text-xs text-white/40 leading-relaxed line-clamp-2">{meta.desc}</p>
      </div>
    </motion.div>
  );
}

/* ── Page ── */
export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [activeCat, setActiveCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [hackerMode, setHackerMode] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [openedCount, setOpenedCount] = useState(0);
  const [recents, setRecents] = useState<ToolId[]>([]);
  const [pinned, setPinned] = useState<ToolId[]>([]);
  const [usage, setUsage] = useState<Partial<Record<ToolId, number>>>({});
  const [selIdx, setSelIdx] = useState(-1);
  const [cols, setCols] = useState(3);
  const [copied, setCopied] = useState(false);
  const openedRef = useRef(new Set<string>());
  const searchRef = useRef<HTMLInputElement>(null);

  // Hash is the source of truth for which tool is open. Handles direct links,
  // share links (#json?v=...), the quick panels' anchor links, and back/forward.
  useEffect(() => {
    const sync = () => {
      const pref = readHashPrefill();
      if (pref && isToolId(pref.id)) {
        setActiveTool(pref.id);
        setCopied(false);
        if (!openedRef.current.has(pref.id)) {
          openedRef.current.add(pref.id);
          setOpenedCount(openedRef.current.size);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setActiveTool(null);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Launcher prefs (localStorage)
  useEffect(() => {
    setRecents(readRecents());
    setPinned(readPinned());
    setUsage(readUsage());
  }, []);

  // Grid column count for arrow-key navigation, tracked via the same
  // breakpoints the grid classes use (sm:grid-cols-2 lg:grid-cols-3).
  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const sm = window.matchMedia("(min-width: 640px)");
    const update = () => setCols(lg.matches ? 3 : sm.matches ? 2 : 1);
    update();
    lg.addEventListener("change", update);
    sm.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      sm.removeEventListener("change", update);
    };
  }, []);

  const openTool = (id: ToolId) => {
    const next = recordToolUse(id);
    setRecents(next.recents);
    setUsage(next.usage);
    window.location.hash = id;
  };

  const togglePin = (id: ToolId) => {
    setPinned(togglePinned(id));
  };

  const closeTool = () => {
    // Clear the hash without adding a scroll jump; pushState doesn't fire
    // hashchange, so update state directly.
    try {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    } catch {
      window.location.hash = "";
    }
    setActiveTool(null);
  };

  const filteredIds = useMemo(
    () =>
      NAV_IDS.filter((id) => {
        const meta = TOOL_META[id];
        if (activeCat !== "All" && meta.cat !== activeCat) return false;
        if (
          deferredSearch &&
          !meta.keywords.includes(deferredSearch) &&
          !meta.label.toLowerCase().includes(deferredSearch) &&
          !id.includes(deferredSearch)
        )
          return false;
        return true;
      }),
    [activeCat, deferredSearch]
  );

  // Pinned tools float to the front of the grid (stable within each group).
  const orderedIds = useMemo(() => {
    if (pinned.length === 0) return filteredIds;
    const pinnedSet = new Set(pinned);
    return [...filteredIds].sort((a, b) => Number(pinnedSet.has(b)) - Number(pinnedSet.has(a)));
  }, [filteredIds, pinned]);

  // Selection resets whenever the visible set changes shape.
  useEffect(() => {
    setSelIdx(-1);
  }, [deferredSearch, activeCat]);

  // Keyboard: Ctrl+K focuses search, Escape closes the active tool, arrows walk
  // the launcher grid (ArrowDown from the search box drops into the grid),
  // Enter launches the selected card.
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        if (activeTool) closeTool();
        else setSelIdx(-1);
        return;
      }
      if (activeTool) return;

      const target = e.target as HTMLElement | null;
      const inSearch = target === searchRef.current;
      const inOtherField =
        !inSearch &&
        (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable);
      if (inOtherField) return;

      const max = orderedIds.length - 1;
      if (max < 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (inSearch) searchRef.current?.blur();
        setSelIdx((i) => (i < 0 ? 0 : Math.min(max, i + cols)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelIdx((i) => (i < 0 ? 0 : Math.max(0, i - cols)));
      } else if (e.key === "ArrowRight" && !inSearch) {
        e.preventDefault();
        setSelIdx((i) => (i < 0 ? 0 : Math.min(max, i + 1)));
      } else if (e.key === "ArrowLeft" && !inSearch) {
        e.preventDefault();
        setSelIdx((i) => (i < 0 ? 0 : Math.max(0, i - 1)));
      } else if (e.key === "Enter") {
        if (inSearch && filteredIds.length === 1) {
          openTool(filteredIds[0]);
        } else if (!inSearch && selIdx >= 0 && selIdx <= max) {
          e.preventDefault();
          openTool(orderedIds[selIdx]);
        }
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, orderedIds, filteredIds, cols, selIdx]);

  // Keep the keyboard-selected card in view.
  useEffect(() => {
    if (selIdx < 0) return;
    document
      .querySelector(`[data-tool-idx="${selIdx}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selIdx]);

  const luckyTool = () => {
    const source = filteredIds.length > 0 ? filteredIds : NAV_IDS;
    openTool(source[Math.floor(Math.random() * source.length)]);
  };

  const copyShareLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  };

  const relatedIds = useMemo(() => {
    if (!activeTool) return [];
    const cat = TOOL_META[activeTool].cat;
    return NAV_IDS.filter((id) => id !== activeTool && TOOL_META[id].cat === cat).slice(0, 4);
  }, [activeTool]);

  const showRecents = !deferredSearch && activeCat === "All" && recents.length > 0;
  const pinnedSet = useMemo(() => new Set(pinned), [pinned]);

  const ActiveComponent = activeTool ? TOOL_COMPONENTS[activeTool] : null;
  const activeMeta = activeTool ? TOOL_META[activeTool] : null;
  const activeColor =
    activeMeta && !hackerMode
      ? CAT_COLORS[activeMeta.cat as keyof typeof CAT_COLORS] ?? "#06b6d4"
      : "#4ade80";
  const ActiveIcon = activeMeta?.icon;

  return (
    <>
      <SpotlightCursor />
      <ToolsParticles />
      <MatrixRain active={hackerMode} />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      <Navbar breadcrumb={activeTool ? ["tools", activeTool] : ["tools"]} />
      <main className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-[1200px] mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeTool && ActiveComponent && activeMeta ? (
            /* ── Focused tool view: only this tool's chunk is loaded & mounted ── */
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Tool chrome: identity + share */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button type="button" onClick={closeTool} className="tool-btn flex items-center gap-1.5 shrink-0">
                    <ArrowLeft size={14} strokeWidth={1.8} aria-hidden /> All tools
                  </button>
                  <span
                    className="p-2 rounded-xl border shrink-0"
                    style={{ background: `${activeColor}12`, borderColor: `${activeColor}30`, color: activeColor }}
                  >
                    {ActiveIcon && <ActiveIcon size={16} strokeWidth={1.8} aria-hidden />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-white truncate">{activeMeta.label}</h2>
                      <span
                        className="px-2 py-0.5 rounded-full text-[0.55rem] font-[family-name:var(--font-mono)] uppercase tracking-wider border shrink-0"
                        style={{ background: `${activeColor}10`, borderColor: `${activeColor}25`, color: activeColor }}
                      >
                        {activeMeta.cat}
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-white/35 truncate">{activeMeta.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={copyShareLink}
                    className="tool-btn flex items-center gap-1.5"
                    aria-live="polite"
                  >
                    {copied ? (
                      <>
                        <Check size={13} strokeWidth={2} aria-hidden className="text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Link2 size={13} strokeWidth={1.8} aria-hidden /> Copy link
                      </>
                    )}
                  </motion.button>
                  <span className="text-[0.6rem] font-[family-name:var(--font-mono)] text-white/30 hidden md:inline">
                    Esc to close
                  </span>
                </div>
              </div>

              <ActiveComponent />

              {/* Related tools */}
              {relatedIds.length > 0 && (
                <div className="mt-10 pt-6 border-t border-white/[0.05]">
                  <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-mono)] mb-3">
                    More {activeMeta.cat} tools
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {relatedIds.map((id) => {
                      const meta = TOOL_META[id];
                      const color = hackerMode ? "#4ade80" : CAT_COLORS[meta.cat as keyof typeof CAT_COLORS] ?? "#06b6d4";
                      const RIcon = meta.icon;
                      return (
                        <motion.button
                          key={id}
                          type="button"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => openTool(id)}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-colors text-left"
                        >
                          <span
                            className="p-1.5 rounded-lg border shrink-0"
                            style={{ background: `${color}12`, borderColor: `${color}30`, color }}
                          >
                            <RIcon size={14} strokeWidth={1.8} aria-hidden />
                          </span>
                          <span className="text-xs text-white/70 truncate">{meta.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* ── Launcher ── */
            <motion.div key="launcher" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="mb-8 sm:mb-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-4">
                  <motion.span
                    animate={{ boxShadow: ["0 0 8px var(--accent-cyan)", "0 0 20px var(--accent-cyan)", "0 0 8px var(--accent-cyan)"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]"
                  />
                  <span className={`text-sm font-[family-name:var(--font-mono)] ${hackerMode ? "text-green-400" : "text-[var(--accent-cyan)]"}`}>
                    {hackerMode ? "$ sudo developer_tools --hacker" : "❯ developer_tools"}
                  </span>
                </motion.div>
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
                  <div>
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-bold"
                    >
                      <span className={hackerMode ? "text-green-400" : "text-shimmer"}>{hackerMode ? "> Developer_Tools" : "Developer Tools"}</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-4 text-[var(--text-secondary)] max-w-xl text-sm sm:text-base">
                      {filteredIds.length === TOOL_COUNT ? `${TOOL_COUNT} client-side utilities` : `Showing ${filteredIds.length} of ${TOOL_COUNT} tools`} — pick one to launch it. Zero tracking, nothing leaves your browser.
                    </motion.p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ToolCountBadge />
                    {openedCount > 3 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-purple)]/5 border border-[var(--accent-purple)]/15">
                        <span className="text-xs text-[var(--accent-purple)] font-[family-name:var(--font-mono)]">{openedCount} explored</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Search + Actions */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={16} strokeWidth={1.8} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search tools... (Ctrl+K, ↓ into grid, Enter opens)"
                      className="tool-input neon-input pl-10 pr-9"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60" aria-label="Clear tool search">
                        <X size={14} strokeWidth={1.8} aria-hidden />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }} onClick={luckyTool} className="tool-btn-primary tool-btn flex items-center gap-1.5 whitespace-nowrap">
                      <Dice6 size={14} strokeWidth={1.8} aria-hidden /> Feeling Lucky
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      whileHover={{ scale: 1.04 }}
                      onClick={() => setHackerMode(!hackerMode)}
                      className={`tool-btn flex items-center gap-1.5 whitespace-nowrap transition-all ${hackerMode ? "!bg-green-400/10 !border-green-400/30 !text-green-400" : ""}`}
                    >
                      {hackerMode ? <CircleDot size={14} strokeWidth={1.8} aria-hidden /> : <Terminal size={14} strokeWidth={1.8} aria-hidden />}
                      <span className="hidden sm:inline">{hackerMode ? "Exit Matrix" : "Hacker Mode"}</span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Category Filters */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-4 flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveCat(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[0.65rem] font-[family-name:var(--font-mono)] uppercase tracking-wider border transition-all cursor-pointer ${
                        activeCat === cat ? "text-white border-transparent" : "text-white/40 border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:text-white/60"
                      }`}
                      style={activeCat === cat ? { background: `${CAT_COLORS[cat]}20`, borderColor: `${CAT_COLORS[cat]}40`, color: CAT_COLORS[cat] } : {}}
                    >
                      {cat} {cat !== "All" && <span className="ml-1 opacity-50">({NAV_IDS.filter((id) => TOOL_META[id].cat === cat).length})</span>}
                    </motion.button>
                  ))}
                </motion.div>

                {/* Recently used */}
                {showRecents && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-5">
                    <p className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-mono)] mb-2">
                      <History size={11} strokeWidth={2} aria-hidden /> Recently used
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recents.filter(isToolId).map((id) => {
                        const meta = TOOL_META[id];
                        const color = hackerMode ? "#4ade80" : CAT_COLORS[meta.cat as keyof typeof CAT_COLORS] ?? "#06b6d4";
                        const RIcon = meta.icon;
                        return (
                          <motion.button
                            key={id}
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openTool(id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.07] hover:bg-white/[0.05] transition-colors"
                          >
                            <RIcon size={13} strokeWidth={1.8} aria-hidden style={{ color }} />
                            <span className="text-[0.7rem] text-white/60">{meta.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Workflow panels */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mt-6 grid md:grid-cols-3 gap-3">
                  {[
                    { title: "Content Ops", desc: "Slug, text case, and markdown tools for shipping cleaner copy.", links: ["slug", "textcase", "markdown"] },
                    { title: "API Debugging", desc: "JSON, regex, HTTP status codes, and JWT inspection in one stop.", links: ["json", "regex", "httpstatus", "jwt"] },
                    { title: "Shipping Prep", desc: "Cron schedules, CSV transforms, QR codes, and generators for handoff work.", links: ["cron", "csvjson", "qrcode", "generator"] },
                  ].map((panel) => (
                    <div key={panel.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{panel.title}</div>
                      <p className="mt-3 text-sm text-[var(--text-secondary)]">{panel.desc}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {panel.links.map((link) => (
                          <a key={link} href={`#${link}`} className="tech-tag text-[0.6rem]">
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Launcher grid */}
              {orderedIds.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <Search size={40} strokeWidth={1.5} aria-hidden className="mx-auto mb-4 text-white/20" />
                  <p className="text-white/50 font-[family-name:var(--font-mono)] text-sm">
                    No tools match &quot;{search}&quot; in {activeCat}
                  </p>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setSearch(""); setActiveCat("All"); }} className="mt-4 tool-btn-primary tool-btn">
                    Clear Filters
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                    {orderedIds.map((id, i) => (
                      <ToolCard
                        key={id}
                        id={id}
                        index={i}
                        dataIdx={i}
                        onOpen={openTool}
                        hackerMode={hackerMode}
                        selected={i === selIdx}
                        pinned={pinnedSet.has(id)}
                        onTogglePin={togglePin}
                        uses={usage[id] ?? 0}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              <div className="text-center pt-12 pb-4">
                <motion.p whileHover={{ scale: 1.02 }} className={`text-xs font-[family-name:var(--font-mono)] ${hackerMode ? "text-green-400/40" : "text-[var(--text-muted)]"}`}>
                  {hackerMode ? "// all tools run client-side | no data exfiltrated | privacy: maximum" : "All tools run client-side · No data leaves your browser"} ·{" "}
                  <Link href="/" className={hackerMode ? "text-green-400 hover:underline" : "text-[var(--accent-cyan)] hover:underline"}>
                    Back to Hub
                  </Link>
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
