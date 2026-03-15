"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";

type VTStats = { harmless?: number; undetected?: number; suspicious?: number; malicious?: number; timeout?: number; failure?: number; type_unsupported?: number };
type VTFlag = { engine: string; category: string; result?: string };

function isHash(s: string) {
  return /^([a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/.test(s || "");
}

/* ── Animated Section ──────────────────── */
function AnimIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Floating Particles (client-only) ──── */
function SecurityParticles() {
  const [ps, setPs] = useState<Array<{l:string;w:string;h:string;bg:string;dur:string;del:string}>>([]);
  useEffect(() => {
    setPs(Array.from({ length: 12 }, (_, i) => ({
      l: `${Math.random()*100}%`, w: `${Math.random()*2+1}px`, h: `${Math.random()*2+1}px`,
      bg: i%2===0 ? 'var(--accent-cyan)' : 'var(--accent-gold)',
      dur: `${Math.random()*20+12}s`, del: `${Math.random()*10}s`,
    })));
  }, []);
  if (!ps.length) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {ps.map((p, i) => (<div key={i} className="particle" style={{ left:p.l, width:p.w, height:p.h, background:p.bg, animationDuration:p.dur, animationDelay:p.del }} />))}
    </div>
  );
}

/* ── Scanning Animation ───────────────── */
function ScanningAnimation() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <motion.div
        className="relative w-20 h-20"
      >
        {/* Shield outline */}
        <motion.svg
          viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5"
          className="w-full h-full"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </motion.svg>
        {/* Scan beam */}
        <motion.div
          className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent"
          animate={{ top: ["20%", "80%", "20%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Glow pulse */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ boxShadow: ["0 0 0 0 rgba(0,229,255,0)", "0 0 30px 10px rgba(0,229,255,0.15)", "0 0 0 0 rgba(0,229,255,0)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-[var(--accent-cyan)]/30 border-t-[var(--accent-cyan)] rounded-full"
        />
        <span className="text-sm text-[var(--text-secondary)] font-[family-name:var(--font-mono)]">Analyzing...</span>
      </div>
    </div>
  );
}

/* ── Stat Card ─────────────────────────── */
function StatCard({ label, value, color = "default" }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    safe: "border-green-500/20 bg-green-500/5",
    danger: "border-red-500/20 bg-red-500/5",
    warn: "border-yellow-500/20 bg-yellow-500/5",
    default: "border-white/[0.06] bg-white/[0.02]",
  };
  const textColors: Record<string, string> = {
    safe: "text-green-400",
    danger: "text-red-400",
    warn: "text-yellow-400",
    default: "text-[var(--text-primary)]",
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={`rounded-xl p-4 border ${colors[color]} transition-all`}
    >
      <span className="text-[0.65rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">{label}</span>
      <div className={`text-lg font-bold font-[family-name:var(--font-heading)] mt-1 ${textColors[color]}`}>
        {value}
      </div>
    </motion.div>
  );
}

/* ── Threat Ring SVG Visualization ──────── */
function ThreatRing({ stats }: { stats: VTStats }) {
  const total = Object.values(stats).reduce((a, b) => a + (b || 0), 0);
  if (!total) return null;
  const mal = stats.malicious || 0;
  const sus = stats.suspicious || 0;
  const safe = stats.harmless || 0;
  const undetected = stats.undetected || 0;
  const r = 54; const c = 2 * Math.PI * r;
  const segments = [
    { val: safe, color: "#22c55e", label: "Safe" },
    { val: undetected, color: "#6b7280", label: "Undetected" },
    { val: sus, color: "#eab308", label: "Suspicious" },
    { val: mal, color: "#ef4444", label: "Malicious" },
  ].filter(s => s.val > 0);
  let offset = 0;
  const threatLevel = mal > 3 ? "Critical" : mal > 0 ? "Detected" : sus > 0 ? "Suspicious" : "Clean";
  const threatColor = mal > 3 ? "#ef4444" : mal > 0 ? "#f97316" : sus > 0 ? "#eab308" : "#22c55e";
  return (
    <div className="glass-card p-6 sm:p-8">
      <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)] text-[var(--text-secondary)] mb-6 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: threatColor, boxShadow: `0 0 8px ${threatColor}` }} />
        Threat Analysis
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <div className="relative w-36 h-36 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={r} className="threat-ring-track" strokeWidth="8" />
            {segments.map((seg, i) => {
              const len = (seg.val / total) * c;
              const el = (<circle key={i} cx="60" cy="60" r={r} className="threat-ring-progress" stroke={seg.color} strokeWidth="8"
                strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} style={{ transition: "all 1.2s cubic-bezier(0.25,0.1,0.25,1)" }} />);
              offset += len; return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: threatColor }}>{mal + sus}</span>
            <span className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase">{threatLevel}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: seg.color }} />
              <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{seg.label}: <span className="text-[var(--text-secondary)]">{seg.val}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const [mode, setMode] = useState<"file" | "hash">("file");
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VTStats | null>(null);
  const [flags, setFlags] = useState<VTFlag[]>([]);
  const [reportLink, setReportLink] = useState<string | null>(null);

  async function scanFile() {
    if (!file) return;
    setBusy(true); setError(null); setStats(null); setFlags([]); setReportLink(null);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/scan/vt", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Scan failed");
      setStats(data.stats || null);
      setFlags(data.flags || []);
      setReportLink(data.permalink || null);
    } catch (e: any) {
      setError(e.message || "Scan failed");
    } finally {
      setBusy(false);
    }
  }

  async function scanHash() {
    if (!isHash(hash)) { setError("Enter a valid MD5, SHA1, or SHA256 hash."); return; }
    setBusy(true); setError(null); setStats(null); setFlags([]); setReportLink(null);
    try {
      const res = await fetch("/api/scan/vt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hash }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Lookup failed");
      setStats(data.stats || null);
      setFlags(data.flags || []);
      setReportLink(data.permalink || null);
    } catch (e: any) {
      setError(e.message || "Lookup failed");
    } finally {
      setBusy(false);
    }
  }

  function getStatColor(key: string, val: number): string {
    if (key === "malicious" && val > 0) return "danger";
    if (key === "suspicious" && val > 0) return "warn";
    if (key === "harmless" && val > 0) return "safe";
    return "default";
  }

  return (
    <div className="min-h-screen bg-[#050505] relative">
      {/* Aurora */}
      <div className="aurora-bg">
        <div className="aurora-band" />
        <div className="aurora-band" />
      </div>

      {/* Floating particles (client-only) */}
      <SecurityParticles />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.04]"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group">
            <motion.div whileHover={{ x: -3 }} className="text-xs">←</motion.div>
            <span className="text-sm font-[family-name:var(--font-mono)]">
              <span className="text-[var(--accent-cyan)]">MN</span>
              <span className="text-[var(--text-muted)]"> / </span>
              security
            </span>
          </Link>
          <div className="hidden sm:flex gap-4">
            {[{ href: "/tools", label: "Tools" }, { href: "/terminal", label: "Terminal" }, { href: "/contact", label: "Contact" }].map((l) => (
              <Link key={l.href} href={l.href}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors font-[family-name:var(--font-mono)] uppercase tracking-wider glow-underline">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.nav>

      <main className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 max-w-3xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <AnimIn>
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4"
            >
              <motion.span
                animate={{ boxShadow: ["0 0 8px var(--accent-gold)", "0 0 20px var(--accent-gold)", "0 0 8px var(--accent-gold)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[var(--accent-gold)]"
              />
              <span className="text-sm font-[family-name:var(--font-mono)] text-[var(--accent-gold)]">❯ security_scan</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold"
            >
              <span className="text-shimmer">Security Scanner</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-[var(--text-secondary)] max-w-xl"
            >
              Upload a file or paste a hash for real-time analysis via VirusTotal integration.
            </motion.p>
          </div>
        </AnimIn>

        {/* Scanner Card */}
        <AnimIn delay={0.1}>
          <div className="glass-card p-8 shimmer-sweep">
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              {(["file", "hash"] as const).map((m) => (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode(m)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${
                    mode === m
                      ? "bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20 shadow-[0_0_20px_rgba(0,229,255,0.06)]"
                      : "bg-white/[0.03] text-[var(--text-muted)] border border-white/[0.06] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {m}
                </motion.button>
              ))}
            </div>

            {/* File or Hash input */}
            <AnimatePresence mode="wait">
              {mode === "file" ? (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">Upload File (32MB max)</label>
                  <div className="relative">
                    <motion.div
                      whileHover={{ borderColor: "rgba(0, 229, 255, 0.3)" }}
                      className="border-2 border-dashed border-white/[0.08] rounded-xl p-8 text-center transition-colors cursor-pointer"
                    >
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[var(--text-muted)]"
                      >
                        <svg className="w-8 h-8 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <span className="text-sm font-[family-name:var(--font-mono)]">
                          {file ? file.name : "Drop a file or click to browse"}
                        </span>
                        {file && (
                          <div className="text-xs text-[var(--text-muted)] mt-1">{file.size.toLocaleString()} bytes</div>
                        )}
                      </motion.div>
                    </motion.div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    disabled={!file || busy}
                    onClick={scanFile}
                    className="glow-btn glow-btn-filled w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {busy ? "Scanning..." : "Scan File"}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="hash"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">MD5 / SHA1 / SHA256</label>
                  <input
                    className="tool-input neon-input"
                    placeholder="Paste hash here..."
                    value={hash}
                    onChange={(e) => setHash(e.target.value.trim())}
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    disabled={!hash || busy}
                    onClick={scanHash}
                    className="glow-btn glow-btn-filled w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {busy ? "Looking up..." : "Lookup Hash"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AnimIn>

        {/* Loading */}
        <AnimatePresence>
          {busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScanningAnimation />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-5 border-red-500/20"
            >
              <div className="flex items-center gap-3 text-red-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span className="text-sm font-[family-name:var(--font-mono)]">Error: {error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {stats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <AnimIn>
                <div className="glass-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </motion.div>
                    <h2 className="text-xl font-semibold font-[family-name:var(--font-heading)]">Scan Results</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(stats).map(([k, v], i) => (
                      <motion.div
                        key={k}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <StatCard
                          label={k}
                          value={String(v)}
                          color={getStatColor(k, Number(v))}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {flags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold font-[family-name:var(--font-heading)] mb-3 text-red-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]" />
                        Flagged Engines
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {flags.map((f, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ scale: 1.05 }}
                            className="px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/15 text-sm font-[family-name:var(--font-mono)]"
                          >
                            <span className="text-[var(--text-secondary)]">{f.engine}:</span>{" "}
                            <span className="text-red-400">{f.category}</span>
                            {f.result && <span className="text-[var(--text-muted)]"> ({f.result})</span>}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-[var(--text-muted)] mt-6 font-[family-name:var(--font-mono)]">
                    Results provided by VirusTotal — always handle files cautiously.
                  </p>
                </div>
              </AnimIn>

              {reportLink && (
                <AnimIn delay={0.1}>
                  <motion.a
                    href={reportLink}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="glass-card p-5 flex items-center justify-between group cursor-pointer block"
                  >
                    <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-mono)]">
                      Open full VirusTotal report
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="text-[var(--accent-cyan)] group-hover:translate-x-1 transition-transform">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </motion.a>
                </AnimIn>
              )}

              {/* Threat Ring Visualization */}
              <AnimIn delay={0.15}>
                <ThreatRing stats={stats} />
              </AnimIn>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
