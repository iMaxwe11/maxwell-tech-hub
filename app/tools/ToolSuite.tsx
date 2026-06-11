"use client";
// Tools launcher: a searchable grid of 35 tool cards. Opening a card mounts ONLY
// that tool (each tool is its own dynamic chunk — see ./tools/index.ts). The
// active tool is encoded in the URL hash (#toolid), so old anchor links and
// share links (#toolid?v=...) keep working.

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CircleDot, Dice6, Search, Terminal, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CAT_COLORS, CATEGORIES, NAV_IDS, TOOL_META, type ToolId } from "./tool-config";
import { MatrixRain, readHashPrefill, SpotlightCursor, ToolCountBadge, ToolsParticles } from "./shared";
import { TOOL_COMPONENTS } from "./tools";

const TOOL_COUNT = NAV_IDS.length;

function isToolId(id: string): id is ToolId {
  return (NAV_IDS as readonly string[]).includes(id);
}

/* ── Launcher card ── */
function ToolCard({ id, onOpen, index, hackerMode }: { id: ToolId; onOpen: (id: ToolId) => void; index: number; hackerMode: boolean }) {
  const meta = TOOL_META[id];
  const color = hackerMode ? "#4ade80" : CAT_COLORS[meta.cat as keyof typeof CAT_COLORS] ?? "#06b6d4";
  const Icon = meta.icon;

  return (
    <motion.button
      layout
      type="button"
      onClick={() => onOpen(id)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.35 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="group text-left p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-colors relative overflow-hidden"
    >
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"
        style={{ background: color }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <span
            className="p-2 rounded-xl border transition-colors"
            style={{ background: `${color}12`, borderColor: `${color}30`, color }}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden />
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[0.55rem] font-[family-name:var(--font-mono)] uppercase tracking-wider border"
            style={{ background: `${color}10`, borderColor: `${color}25`, color }}
          >
            {meta.cat}
          </span>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-white/85 group-hover:text-white transition-colors">
          {meta.label}
        </h3>
        <p className="mt-1 text-xs text-white/40 leading-relaxed line-clamp-2">{meta.desc}</p>
      </div>
    </motion.button>
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
  const openedRef = useRef(new Set<string>());
  const searchRef = useRef<HTMLInputElement>(null);

  // Hash is the source of truth for which tool is open. Handles direct links,
  // share links (#json?v=...), the quick panels' anchor links, and back/forward.
  useEffect(() => {
    const sync = () => {
      const pref = readHashPrefill();
      if (pref && isToolId(pref.id)) {
        setActiveTool(pref.id);
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

  const openTool = (id: ToolId) => {
    window.location.hash = id;
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

  // Keyboard: Ctrl+K focuses search, Escape closes the active tool.
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && activeTool) {
        closeTool();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [activeTool]);

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

  const luckyTool = () => {
    const source = filteredIds.length > 0 ? filteredIds : NAV_IDS;
    openTool(source[Math.floor(Math.random() * source.length)]);
  };

  const ActiveComponent = activeTool ? TOOL_COMPONENTS[activeTool] : null;

  return (
    <>
      <SpotlightCursor />
      <ToolsParticles />
      <MatrixRain active={hackerMode} />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      <Navbar breadcrumb={activeTool ? ["tools", activeTool] : ["tools"]} />
      <main className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-[1200px] mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeTool && ActiveComponent ? (
            /* ── Focused tool view: only this tool's chunk is loaded & mounted ── */
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeTool}
                  className="tool-btn flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} strokeWidth={1.8} aria-hidden /> All tools
                </button>
                <span className="text-[0.6rem] font-[family-name:var(--font-mono)] text-white/30 hidden sm:inline">
                  Esc to close · #{activeTool} is linkable
                </span>
              </div>
              <ActiveComponent />
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && filteredIds.length === 1) openTool(filteredIds[0]);
                      }}
                      placeholder="Search tools... (Ctrl+K, Enter opens a single match)"
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
              {filteredIds.length === 0 ? (
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
                    {filteredIds.map((id, i) => (
                      <ToolCard key={id} id={id} index={i} onOpen={openTool} hackerMode={hackerMode} />
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
