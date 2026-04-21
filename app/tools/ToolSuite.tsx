"use client";
import { useDeferredValue, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CAT_COLORS, CATEGORIES, NAV_IDS, TOOL_META, type ToolId } from "./tool-config";
import { copyToClipboard, toast } from "@/lib/toast";
import { Dice6, Terminal, CircleDot, Share2 } from "lucide-react";

/* ── URL hash state: share tool inputs via #toolid?v=base64urldata ──
 * Only the four tools that exercise it (json / base64 / url / hash) read
 * from this helper on mount; everything else ignores the hash.
 */
function readHashPrefill(): { id: string; value: string } | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.slice(1);
  if (!raw) return null;
  const [id, queryStr] = raw.split("?");
  if (!id) return null;
  if (!queryStr) return { id, value: "" };
  const params = new URLSearchParams(queryStr);
  const v = params.get("v");
  if (!v) return { id, value: "" };
  try {
    const b64 = v.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const decoded = decodeURIComponent(escape(atob(padded)));
    return { id, value: decoded };
  } catch {
    return { id, value: "" };
  }
}
function prefillFor(toolId: string): string | null {
  const pref = readHashPrefill();
  if (!pref || pref.id !== toolId) return null;
  return pref.value || null;
}
function encodeShareValue(value: string): string {
  try {
    const b64 = btoa(unescape(encodeURIComponent(value)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return "";
  }
}
function buildShareUrl(toolId: string, value: string): string {
  if (typeof window === "undefined") return "";
  const encoded = encodeShareValue(value);
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${toolId}${encoded ? `?v=${encoded}` : ""}`;
}
async function shareLink(toolId: string, value: string) {
  const url = buildShareUrl(toolId, value);
  if (!url) { toast("Share link failed — nothing to encode", "error"); return; }
  // Keep the hash in sync with the shared payload so a quick reload still works.
  try { window.history.replaceState(null, "", url); } catch {}
  await copyToClipboard(url, "Share link copied");
}

/* Small reusable share button rendered inside tool sections. */
function ShareButton({ toolId, value }: { toolId: string; value: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      type="button"
      onClick={() => shareLink(toolId, value)}
      title="Copy a shareable link that prefills this tool with the current input"
      className="tool-btn flex items-center gap-1.5 whitespace-nowrap"
    >
      <Share2 size={13} strokeWidth={1.8} aria-hidden /> Share
    </motion.button>
  );
}

type Accent = "cyan" | "purple" | "gold";

interface SectionProps {
  id: ToolId | string;
  title: string;
  desc?: string;
  children: React.ReactNode;
  accent?: Accent;
  index?: number;
}

interface IpLookup {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  org?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

type PasswordTone = "muted" | "weak" | "fair" | "strong" | "veryStrong";

const TOOL_COUNT = NAV_IDS.length;
const PASSWORD_TONE_STYLES: Record<PasswordTone, { barClass: string; textClass: string }> = {
  muted: { barClass: "bg-white/20", textClass: "text-white/40" },
  weak: { barClass: "bg-red-400", textClass: "text-red-400" },
  fair: { barClass: "bg-yellow-400", textClass: "text-yellow-400" },
  strong: { barClass: "bg-green-400", textClass: "text-green-400" },
  veryStrong: { barClass: "bg-cyan-400", textClass: "text-cyan-400" },
};

const HTTP_STATUSES = [
  { code: 200, label: "OK", category: "Success", note: "Standard successful response." },
  { code: 201, label: "Created", category: "Success", note: "Resource created successfully." },
  { code: 204, label: "No Content", category: "Success", note: "Success with no response body." },
  { code: 301, label: "Moved Permanently", category: "Redirect", note: "Permanent redirect to a new URL." },
  { code: 302, label: "Found", category: "Redirect", note: "Temporary redirect." },
  { code: 304, label: "Not Modified", category: "Redirect", note: "Use cached content." },
  { code: 400, label: "Bad Request", category: "Client", note: "Malformed or invalid request." },
  { code: 401, label: "Unauthorized", category: "Client", note: "Authentication required or invalid." },
  { code: 403, label: "Forbidden", category: "Client", note: "Authenticated but not allowed." },
  { code: 404, label: "Not Found", category: "Client", note: "Requested resource does not exist." },
  { code: 409, label: "Conflict", category: "Client", note: "State conflict, often on writes." },
  { code: 422, label: "Unprocessable Content", category: "Client", note: "Validation failed or semantic issue." },
  { code: 429, label: "Too Many Requests", category: "Client", note: "Rate limit reached." },
  { code: 500, label: "Internal Server Error", category: "Server", note: "Unexpected server failure." },
  { code: 502, label: "Bad Gateway", category: "Server", note: "Upstream dependency returned an invalid response." },
  { code: 503, label: "Service Unavailable", category: "Server", note: "Temporary outage or maintenance." },
  { code: 504, label: "Gateway Timeout", category: "Server", note: "Upstream service timed out." },
] as const;

const CRON_PRESETS = [
  { label: "Every 15 min", value: "*/15 * * * *", detail: "Runs every quarter-hour." },
  { label: "Hourly", value: "0 * * * *", detail: "Runs once at the top of every hour." },
  { label: "Daily 9 AM", value: "0 9 * * *", detail: "Runs daily at 9:00 AM." },
  { label: "Weekdays 9 AM", value: "0 9 * * 1-5", detail: "Runs Monday through Friday at 9:00 AM." },
  { label: "Mondays 8 AM", value: "0 8 * * 1", detail: "Runs every Monday morning." },
] as const;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

/* ── Spotlight Cursor ──────────────────── */
function SpotlightCursor() {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 80, damping: 25 }); const sy = useSpring(y, { stiffness: 80, damping: 25 });
  useEffect(() => { const h = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); }; window.addEventListener("mousemove", h); return () => window.removeEventListener("mousemove", h); }, [x, y]);
  return <motion.div className="spotlight-cursor" style={{ left: sx, top: sy }} />;
}

/* ── Floating Particles (client-only) ──── */
function ToolsParticles() {
  const [ps, setPs] = useState<Array<{l:string;w:string;h:string;bg:string;dur:string;del:string}>>([]);
  useEffect(() => { setPs(Array.from({ length: 20 }, (_, i) => ({
    l: `${Math.random()*100}%`, w: `${Math.random()*2+1}px`, h: `${Math.random()*2+1}px`,
    bg: i%3===0?'var(--accent-cyan)':i%3===1?'var(--accent-purple)':'var(--accent-gold)',
    dur: `${Math.random()*20+14}s`, del: `${Math.random()*10}s`
  }))); }, []);
  if (!ps.length) return null;
  return (<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {ps.map((p, i) => (<div key={i} className="particle" style={{ left:p.l, width:p.w, height:p.h, background:p.bg, animationDuration:p.dur, animationDelay:p.del }} />))}
  </div>);
}

/* ── Animated Section ──────────────────── */
function AnimIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null); const inView = useInView(ref, { once: true, margin: "-60px" });
  return (<motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>{children}</motion.div>);
}

/* ── Section Wrapper ───────────────────── */
function Section({ id, title, desc, children, accent = "cyan", index = 0 }: SectionProps) {
  const colors: Record<Accent, string> = { cyan: "var(--accent-cyan)", purple: "var(--accent-purple)", gold: "var(--accent-gold)" };
  const resolvedIndex = NAV_IDS.includes(id as ToolId) ? NAV_IDS.indexOf(id as ToolId) : index;
  const ref = useRef<HTMLElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return; const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--tool-x', `${((e.clientX-rect.left)/rect.width)*100}%`);
    ref.current.style.setProperty('--tool-y', `${((e.clientY-rect.top)/rect.height)*100}%`);
  }, []);
  return (
    <AnimIn delay={resolvedIndex * 0.05}>
      <section ref={ref} id={id} onMouseMove={handleMouseMove} className="tool-section group shimmer-sweep breathe-border">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0, rotate: -90 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: resolvedIndex * 0.05, type: "spring", stiffness: 300 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-[family-name:var(--font-mono)]"
              style={{ background: `${colors[accent]||colors.cyan}15`, border: `1px solid ${colors[accent]||colors.cyan}30`, color: colors[accent]||colors.cyan }}>
              {String(resolvedIndex + 1).padStart(2, "0")}
            </motion.div>
            <div>
              <span className="text-[0.65rem] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[var(--text-muted)]"><span style={{ color: colors[accent]||colors.cyan }}>❯</span> {id}</span>
              <h2 className="font-[family-name:var(--font-heading)] text-lg sm:text-xl font-semibold mt-0.5 group-hover:text-white transition-colors">{title}</h2>
            </div>
          </div>
          {desc && (<motion.p initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-xs text-[var(--text-muted)] max-w-xs text-right hidden sm:block">{desc}</motion.p>)}
        </div>
        {children}
      </section>
    </AnimIn>
  );
}

/* ── Tool Count Badge ──────────────────── */
function ToolCountBadge() {
  const [count, setCount] = useState(0); const ref = useRef(null); const inView = useInView(ref, { once: true });
  useEffect(() => { if (!inView) return; let i = 0; const iv = setInterval(() => { i++; setCount(i); if (i >= TOOL_COUNT) clearInterval(iv); }, 60); return () => clearInterval(iv); }, [inView]);
  return (
    <motion.div ref={ref} initial={{ scale: 0.8, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}} transition={{ type: "spring", stiffness: 300 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/15">
      <motion.span key={count} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--accent-cyan)]">{count}</motion.span>
      <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">tools</span>
    </motion.div>
  );
}

/* ═══════════════ TOOL 15: QR Code Generator ═══════════════ */
function QRCodeGenerator() {
  const [text, setText] = useState("https://maxwellnixon.com");
  const [size, setSize] = useState(240);
  const [fg, setFg] = useState("06b6d4");
  const [bg, setBg] = useState("0a0a0a");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || !text) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.width = size; canvas.height = size;
    // Simple QR using a free API as image source
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => { ctx.fillStyle = `#${bg}`; ctx.fillRect(0,0,size,size); ctx.drawImage(img, 0, 0, size, size); };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=${bg}&color=${fg}`;
  }, [bg, fg, size, text]);
  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement("a"); a.download = "qrcode.png";
    a.href = canvas.toDataURL("image/png"); a.click();
  };
  return (
    <Section id="qrcode" title="QR Code Generator" desc="Generate branded QR codes with custom size and colors." accent="cyan" index={19}>
      <input className="tool-input neon-input mb-4" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter URL or text..." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">
          Size
          <select value={size} onChange={(event) => setSize(Number(event.target.value))} className="tool-input neon-input ml-2 w-24">
            {[180, 240, 320].map((option) => <option key={option} value={option}>{option}px</option>)}
          </select>
        </label>
        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] flex items-center gap-2">
          Foreground
          <input type="color" value={`#${fg}`} onChange={(event) => setFg(event.target.value.replace("#", ""))} className="w-8 h-8 rounded border border-white/10" />
        </label>
        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] flex items-center gap-2">
          Background
          <input type="color" value={`#${bg}`} onChange={(event) => setBg(event.target.value.replace("#", ""))} className="w-8 h-8 rounded border border-white/10" />
        </label>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <canvas ref={canvasRef} className="rounded-lg" style={{ width: 180, height: 180 }} />
        </div>
        <div className="space-y-3">
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn" onClick={download}>Download PNG</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn" onClick={() => copyToClipboard(text)}>Copy Text</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn" onClick={() => setText("https://maxwellnixon.com/status")}>Load Sample</motion.button>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 16: JWT Decoder ═══════════════ */
function JWTDecoder() {
  const [jwt, setJwt] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1heHdlbGwgTml4b24iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  const decoded = useMemo(() => {
    try {
      const parts = jwt.split(".");
      if (parts.length !== 3) return null;
      const header = JSON.parse(atob(parts[0].replace(/-/g,"+").replace(/_/g,"/")));
      const payload = JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
      const expDate = payload.exp ? new Date(payload.exp * 1000) : null;
      const isExpired = expDate ? expDate < new Date() : false;
      return { header, payload, signature: parts[2], expDate, isExpired };
    } catch { return null; }
  }, [jwt]);
  return (
    <Section id="jwt" title="JWT Decoder" desc="Decode payloads, inspect claims, and spot expired tokens fast." accent="purple" index={20}>
      <textarea className="tool-input neon-input min-h-[80px] resize-none mb-4 text-xs break-all" value={jwt} onChange={(e) => setJwt(e.target.value)} placeholder="Paste a JWT token..." />
      {decoded ? (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
            {[
              ["Algorithm", decoded.header.alg ?? "—"],
              ["Subject", decoded.payload.sub ?? decoded.payload.name ?? "—"],
              ["Issuer", decoded.payload.iss ?? "—"],
              ["Audience", Array.isArray(decoded.payload.aud) ? decoded.payload.aud.join(", ") : decoded.payload.aud ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/[0.05] bg-black/20 px-3 py-3">
                <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{label}</div>
                <div className="mt-2 text-sm text-[var(--text-primary)] break-all">{String(value)}</div>
              </div>
            ))}
          </div>
          {(["header", "payload"] as const).map((section) => (
            <div key={section} className="rounded-lg bg-black/20 border border-white/[0.04] p-3 cursor-pointer group" onClick={() => copyToClipboard(JSON.stringify(decoded[section], null, 2))}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--accent-purple)] uppercase tracking-wider">{section}</span>
                <span className="text-[0.55rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
              </div>
              <pre className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-mono)] overflow-x-auto">{JSON.stringify(decoded[section], null, 2)}</pre>
            </div>
          ))}
          {decoded.expDate && (
            <div className={`text-xs font-[family-name:var(--font-mono)] px-3 py-2 rounded-lg border ${decoded.isExpired ? "bg-red-400/5 border-red-400/20 text-red-400" : "bg-green-400/5 border-green-400/20 text-green-400"}`}>
              {decoded.isExpired ? "⚠ Expired" : "✓ Valid"} — Expires: {decoded.expDate.toLocaleString()}
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-red-400/60 font-[family-name:var(--font-mono)] p-3 rounded-lg bg-red-400/5 border border-red-400/10">Invalid JWT format. Expected 3 base64 segments separated by dots.</div>
      )}
    </Section>
  );
}

/* ═══════════════ TOOL 17: Pomodoro Timer ═══════════════ */
function PomodoroTimer() {
  const PRESETS = [
    { label: "25/5", work: 25, break: 5 },
    { label: "50/10", work: 50, break: 10 },
    { label: "90/15", work: 90, break: 15 },
  ] as const;
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>(PRESETS[0]);
  const [mode, setMode] = useState<"work"|"break">("work");
  const [seconds, setSeconds] = useState(PRESETS[0].work * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false);
            if (mode === "work") { setSessions(p => p + 1); setMode("break"); return preset.break * 60; }
            else { setMode("work"); return preset.work * 60; }
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [mode, preset.break, preset.work, running]);
  useEffect(() => {
    setRunning(false);
    setMode("work");
    setSeconds(preset.work * 60);
  }, [preset]);
  const reset = () => { setRunning(false); setMode("work"); setSeconds(preset.work * 60); };
  const mins = Math.floor(seconds/60); const secs = seconds%60;
  const pct = mode === "work" ? ((preset.work*60 - seconds) / (preset.work*60)) * 100 : ((preset.break*60 - seconds) / (preset.break*60)) * 100;
  return (
    <Section id="pomodoro" title="Pomodoro Timer" desc="Switch between focus presets, track completed rounds, and keep momentum." accent="gold" index={21}>
      <div className="flex flex-col items-center">
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {PRESETS.map((option) => (
            <motion.button
              key={option.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreset(option)}
              className={`px-3 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all ${
                preset.label === option.label
                  ? "bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20"
                  : "bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
        <div className="relative w-48 h-48 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={mode==="work" ? "var(--accent-gold)" : "var(--accent-cyan)"} strokeWidth="4" strokeDasharray={`${2*Math.PI*45}`} strokeDashoffset={`${2*Math.PI*45*(1-pct/100)}`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-white font-[family-name:var(--font-mono)] tabular-nums">{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</div>
            <div className={`text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider mt-1 ${mode==="work" ? "text-[var(--accent-gold)]" : "text-[var(--accent-cyan)]"}`}>{mode}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn" onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn" onClick={reset}>Reset</motion.button>
        </div>
        <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] text-center">
          Sessions completed: <span className="text-[var(--accent-gold)]">{sessions}</span> · Current cadence: {preset.work}m focus / {preset.break}m reset
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 18: IP Address Info ═══════════════ */
function IPInfo() {
  const [info, setInfo] = useState<IpLookup | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("https://ipapi.co/json/").then(r => r.json()).then(data => { setInfo(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const fields = info ? [
    ["IP", info.ip], ["City", info.city], ["Region", info.region], ["Country", info.country_name],
    ["ISP", info.org], ["Timezone", info.timezone], ["Latitude", info.latitude], ["Longitude", info.longitude],
  ].filter(([,v]) => v) : [];
  return (
    <Section id="ipinfo" title="IP Address Info" desc="Your public IP and geolocation details." accent="cyan" index={17}>
      {loading ? (<div className="h-32 bg-white/5 rounded-lg animate-pulse" />) : info ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {fields.map(([label, val]) => (
            <motion.div key={label} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] cursor-pointer group" onClick={() => copyToClipboard(String(val))}>
              <div className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">{label}</div>
              <div className="text-sm text-[var(--text-primary)] font-[family-name:var(--font-mono)] mt-1 break-all">{String(val)}</div>
              <div className="text-[0.5rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1">copy</div>
            </motion.div>
          ))}
        </div>
      ) : (<div className="text-xs text-[var(--text-muted)]">Could not fetch IP info.</div>)}
    </Section>
  );
}

/* ═══════════════ TOOL 19: Diff Checker ═══════════════ */
function DiffChecker() {
  const [textA, setTextA] = useState("Hello World\nThis is line two\nLine three here");
  const [textB, setTextB] = useState("Hello World\nThis is line 2\nLine three here\nNew line four");
  const diff = useMemo(() => {
    const a = textA.split("\n"); const b = textB.split("\n");
    const maxLen = Math.max(a.length, b.length);
    const lines: Array<{ left: string; right: string; type: "same"|"changed"|"added"|"removed" }> = [];
    for (let i = 0; i < maxLen; i++) {
      const l = a[i] ?? ""; const r = b[i] ?? "";
      if (i >= a.length) lines.push({ left: "", right: r, type: "added" });
      else if (i >= b.length) lines.push({ left: l, right: "", type: "removed" });
      else if (l === r) lines.push({ left: l, right: r, type: "same" });
      else lines.push({ left: l, right: r, type: "changed" });
    }
    return lines;
  }, [textA, textB]);
  const colors = { same: "", changed: "bg-yellow-400/5 border-l-2 border-yellow-400/30", added: "bg-green-400/5 border-l-2 border-green-400/30", removed: "bg-red-400/5 border-l-2 border-red-400/30" };
  return (
    <Section id="diff" title="Diff Checker" desc="Compare two texts side by side." accent="purple" index={18}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1 block">Original</label><textarea className="tool-input neon-input min-h-[100px] resize-none text-xs" value={textA} onChange={e => setTextA(e.target.value)} /></div>
        <div><label className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1 block">Modified</label><textarea className="tool-input neon-input min-h-[100px] resize-none text-xs" value={textB} onChange={e => setTextB(e.target.value)} /></div>
      </div>
      <div className="rounded-lg bg-black/20 border border-white/[0.04] overflow-hidden">
        {diff.map((line, i) => (
          <div key={i} className={`grid grid-cols-2 text-xs font-[family-name:var(--font-mono)] ${colors[line.type]}`}>
            <div className={`px-3 py-1 border-r border-white/[0.04] ${line.type==="removed"?"text-red-400/80":line.type==="changed"?"text-yellow-400/80":"text-[var(--text-secondary)]"}`}>
              <span className="text-[var(--text-muted)] mr-2 select-none">{i+1}</span>{line.left}
            </div>
            <div className={`px-3 py-1 ${line.type==="added"?"text-green-400/80":line.type==="changed"?"text-yellow-400/80":"text-[var(--text-secondary)]"}`}>
              <span className="text-[var(--text-muted)] mr-2 select-none">{i+1}</span>{line.right}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 20: Number Base Converter ═══════════════ */
function BaseConverter() {
  const [value, setValue] = useState("255"); const [fromBase, setFromBase] = useState(10);
  const conversions = useMemo(() => {
    try {
      const num = parseInt(value, fromBase);
      if (isNaN(num)) return null;
      return { Decimal: num.toString(10), Binary: num.toString(2), Octal: num.toString(8), Hex: num.toString(16).toUpperCase() };
    } catch { return null; }
  }, [value, fromBase]);
  const bases = [{ label: "Dec", val: 10 }, { label: "Bin", val: 2 }, { label: "Oct", val: 8 }, { label: "Hex", val: 16 }];
  return (
    <Section id="baseconv" title="Number Base Converter" desc="Convert between decimal, binary, octal, and hex." accent="gold" index={19}>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <input className="tool-input neon-input flex-1 min-w-[120px]" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter number..." />
        <div className="flex gap-1">
          {bases.map(b => (<motion.button key={b.val} whileTap={{ scale: 0.95 }} onClick={() => setFromBase(b.val)}
            className={`px-3 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all ${fromBase===b.val?"bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>{b.label}</motion.button>))}
        </div>
      </div>
      {conversions ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(conversions).map(([label, val]) => (
            <motion.div key={label} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] text-center cursor-pointer group" onClick={() => copyToClipboard(val)}>
              <div className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">{label}</div>
              <div className="text-sm text-[var(--accent-gold)] font-[family-name:var(--font-mono)] mt-1 break-all">{val}</div>
              <div className="text-[0.5rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1">copy</div>
            </motion.div>
          ))}
        </div>
      ) : (<div className="text-xs text-red-400/60 font-[family-name:var(--font-mono)] p-3 rounded-lg bg-red-400/5 border border-red-400/10">Invalid number for selected base.</div>)}
    </Section>
  );
}

/* ═══════════════ TOOL 21: CSS Gradient Generator ═══════════════ */
function GradientGenerator() {
  const [c1, setC1] = useState("#06b6d4"); const [c2, setC2] = useState("#8b5cf6");
  const [angle, setAngle] = useState(135); const [type, setType] = useState<"linear"|"radial">("linear");
  const gradient = type === "linear" ? `linear-gradient(${angle}deg, ${c1}, ${c2})` : `radial-gradient(circle, ${c1}, ${c2})`;
  const css = `background: ${gradient};`;
  return (
    <Section id="gradient" title="Gradient Generator" desc="Create and copy beautiful CSS gradients." accent="cyan" index={20}>
      <div className="rounded-xl overflow-hidden mb-4 border border-white/[0.06]" style={{ background: gradient, height: 140 }} />
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <input type="color" value={c1} onChange={e => setC1(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
          <input className="tool-input neon-input w-24 text-center text-xs" value={c1} onChange={e => setC1(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input type="color" value={c2} onChange={e => setC2(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
          <input className="tool-input neon-input w-24 text-center text-xs" value={c2} onChange={e => setC2(e.target.value)} />
        </div>
        {type === "linear" && (<input type="range" min={0} max={360} value={angle} onChange={e => setAngle(+e.target.value)} className="flex-1 min-w-[80px] h-1 appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400" />)}
        {type === "linear" && <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] w-10">{angle}°</span>}
        {(["linear","radial"] as const).map(t => (<motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setType(t)}
          className={`px-3 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase transition-all ${type===t?"bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>{t}</motion.button>))}
      </div>
      <div className="rounded-lg bg-black/20 border border-white/[0.04] p-3 flex items-center justify-between group cursor-pointer" onClick={() => copyToClipboard(css)}>
        <code className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-mono)]">{css}</code>
        <span className="text-[0.55rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 22: Password Strength Tester ═══════════════ */
function PasswordTester() {
  const [pw, setPw] = useState("");
  const analysis = useMemo(() => {
    const checks = [
      { label: "8+ characters", pass: pw.length >= 8 },
      { label: "Uppercase letter", pass: /[A-Z]/.test(pw) },
      { label: "Lowercase letter", pass: /[a-z]/.test(pw) },
      { label: "Number", pass: /\d/.test(pw) },
      { label: "Special character", pass: /[^A-Za-z0-9]/.test(pw) },
      { label: "12+ characters", pass: pw.length >= 12 },
      { label: "No common patterns", pass: !/^(password|123456|qwerty|abc123)/i.test(pw) && pw.length > 0 },
    ];
    const score = checks.filter(c => c.pass).length;
    const strength = pw.length === 0 ? "" : score <= 2 ? "Weak" : score <= 4 ? "Fair" : score <= 5 ? "Strong" : "Very Strong";
    const tone: PasswordTone = pw.length === 0 ? "muted" : score <= 2 ? "weak" : score <= 4 ? "fair" : score <= 5 ? "strong" : "veryStrong";
    // Entropy estimate
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/\d/.test(pw)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pw)) pool += 32;
    const entropy = pw.length > 0 ? Math.round(pw.length * Math.log2(pool || 1)) : 0;
    return { checks, score, strength, tone, entropy };
  }, [pw]);
  const toneStyles = PASSWORD_TONE_STYLES[analysis.tone];
  return (
    <Section id="password" title="Password Strength" desc="Test password strength and get security tips." accent="gold" index={21}>
      <input type="text" className="tool-input neon-input mb-4" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter a password to test..." autoComplete="off" />
      {pw.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(analysis.score / 7) * 100}%` }} className={`h-full rounded-full ${toneStyles.barClass}`} />
            </div>
            <span className={`text-sm font-bold font-[family-name:var(--font-mono)] ${toneStyles.textClass}`}>{analysis.strength}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="rounded-lg p-2 bg-black/20 border border-white/[0.04] text-center">
              <div className="text-lg font-bold text-[var(--accent-gold)] font-[family-name:var(--font-heading)]">{analysis.entropy}</div>
              <div className="text-[0.55rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Entropy bits</div>
            </div>
            <div className="rounded-lg p-2 bg-black/20 border border-white/[0.04] text-center">
              <div className="text-lg font-bold text-[var(--accent-gold)] font-[family-name:var(--font-heading)]">{pw.length}</div>
              <div className="text-[0.55rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Length</div>
            </div>
            <div className="rounded-lg p-2 bg-black/20 border border-white/[0.04] text-center">
              <div className="text-lg font-bold text-[var(--accent-gold)] font-[family-name:var(--font-heading)]">{analysis.score}/7</div>
              <div className="text-[0.55rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Score</div>
            </div>
            <div className="rounded-lg p-2 bg-black/20 border border-white/[0.04] text-center">
              <div className="text-lg font-bold text-[var(--accent-gold)] font-[family-name:var(--font-heading)]">{new Set(pw).size}</div>
              <div className="text-[0.55rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Unique chars</div>
            </div>
          </div>
          <div className="space-y-1">
            {analysis.checks.map(c => (
              <div key={c.label} className="flex items-center gap-2 text-xs font-[family-name:var(--font-mono)]">
                <span className={c.pass ? "text-green-400" : "text-white/20"}>{c.pass ? "✓" : "○"}</span>
                <span className={c.pass ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}>{c.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

/* ═══════════════════════════════════════════
   HACKER MODE (Easter Egg)
   ═══════════════════════════════════════════ */
function MatrixRain({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 14);
    const drops = Array(cols).fill(1);
    const chars = "01アイウエオカキクケコサシスセソタチツテトMNDEV";
    const draw = () => {
      ctx.fillStyle = "rgba(2,2,4,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#06b6d4";
      ctx.font = "12px monospace";
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.96 ? "#fff" : `rgba(6,182,212,${Math.random() * 0.5 + 0.3})`;
        ctx.fillText(text, i * 14, drops[i] * 14);
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const id = setInterval(draw, 50);
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { clearInterval(id); window.removeEventListener("resize", resize); };
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
}

/* ═══════════════ TOOL 33: SQL Formatter ═══════════════ */
function SQLFormatter() {
  const [raw, setRaw] = useState(
    "select id, name, email, created_at from users where active = 1 and created_at > '2024-01-01' order by name limit 10",
  );
  const formatted = useMemo(() => {
    if (!raw.trim()) return "";
    const KEYWORDS = /\b(select|from|where|and|or|inner join|left join|right join|full join|cross join|on|group by|order by|having|limit|offset|insert into|values|update|set|delete|returning|with|as|union|case|when|then|else|end|is null|is not null|between|in|like|desc|asc|distinct|all)\b/gi;
    const MAJOR = /\b(select|from|where|group by|order by|having|limit|offset|insert into|values|update|set|delete|returning|with|union|left join|right join|inner join|full join|cross join|join|on)\b/gi;

    // Normalise whitespace, then uppercase keywords
    let s = raw.replace(/\s+/g, " ").trim().replace(KEYWORDS, (m) => m.toUpperCase());
    // Newline before each major clause (except the very first occurrence)
    let first = true;
    s = s.replace(MAJOR, (m) => {
      if (first) {
        first = false;
        return m.toUpperCase();
      }
      return "\n" + m.toUpperCase();
    });
    // Indent continuations (nested JOIN / ON)
    s = s
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (/^(ON|AND|OR)\s/i.test(trimmed)) return "  " + trimmed;
        return trimmed;
      })
      .join("\n");
    // Break long SELECT column lists onto their own indented lines
    s = s.replace(/^(SELECT\s+)(.+)$/im, (_full, prefix: string, cols: string) => {
      // Skip if the SELECT body already contains a subquery
      if (/\bSELECT\b/i.test(cols)) return prefix + cols.trim();
      const parts = cols.split(",").map((c) => c.trim()).filter(Boolean);
      if (parts.length <= 2) return prefix + parts.join(", ");
      return prefix + "\n  " + parts.join(",\n  ");
    });
    // Add a trailing semicolon if the original had one or if the statement looks complete
    if (raw.trim().endsWith(";") && !s.endsWith(";")) s += ";";
    return s;
  }, [raw]);

  return (
    <Section id="sql" title="SQL Formatter" desc="Paste SQL → indented, uppercased, clause-broken output." accent="purple" index={32}>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1 block">
            Input
          </label>
          <textarea
            className="tool-input neon-input min-h-[220px] resize-none text-xs"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
            placeholder="Paste SQL here…"
          />
        </div>
        <div>
          <label className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1 block">
            Formatted
          </label>
          <pre className="rounded-lg bg-black/30 border border-white/[0.06] p-3 min-h-[220px] max-h-[420px] overflow-auto text-xs font-[family-name:var(--font-mono)] text-[var(--accent-cyan)] whitespace-pre">
            {formatted || <span className="text-white/20">Output will appear here</span>}
          </pre>
        </div>
      </div>
      <div className="mt-3 flex gap-2 flex-wrap">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => copyToClipboard(formatted, "SQL copied")}
          disabled={!formatted}
          className="tool-btn-primary tool-btn disabled:opacity-30"
        >
          Copy Formatted
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setRaw("")}
          className="tool-btn"
        >
          Clear
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            setRaw(
              "SELECT u.id, u.name, count(o.id) as orders FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE u.active = 1 GROUP BY u.id, u.name HAVING count(o.id) > 5 ORDER BY orders DESC LIMIT 20",
            )
          }
          className="tool-btn"
        >
          Load Sample
        </motion.button>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 34: Emoji & Symbol Picker ═══════════════ */
const EMOJI_SET: { char: string; name: string; cat: string }[] = [
  // Faces
  { char: "😀", name: "grinning face happy", cat: "Face" },
  { char: "😂", name: "joy tears laughing lol", cat: "Face" },
  { char: "🥲", name: "smile tear", cat: "Face" },
  { char: "😍", name: "heart eyes love", cat: "Face" },
  { char: "🤔", name: "thinking consider hmm", cat: "Face" },
  { char: "😎", name: "sunglasses cool", cat: "Face" },
  { char: "🥳", name: "party celebrate hat", cat: "Face" },
  { char: "😴", name: "sleeping tired zzz", cat: "Face" },
  { char: "🤯", name: "mind blown explosion shocked", cat: "Face" },
  { char: "😭", name: "crying sad sob", cat: "Face" },
  { char: "🙃", name: "upside down face silly", cat: "Face" },
  { char: "😬", name: "grimace awkward", cat: "Face" },
  // Gestures
  { char: "👍", name: "thumbs up approve ok yes", cat: "Hand" },
  { char: "👎", name: "thumbs down reject no", cat: "Hand" },
  { char: "👋", name: "wave hello hi bye", cat: "Hand" },
  { char: "👏", name: "clap applause bravo", cat: "Hand" },
  { char: "🙏", name: "pray thanks please", cat: "Hand" },
  { char: "💪", name: "flex strong muscle", cat: "Hand" },
  { char: "🤝", name: "handshake deal agree", cat: "Hand" },
  { char: "✌️", name: "peace victory two fingers", cat: "Hand" },
  { char: "🤞", name: "fingers crossed hope luck", cat: "Hand" },
  { char: "👌", name: "ok perfect circle", cat: "Hand" },
  { char: "🫶", name: "heart hands love", cat: "Hand" },
  { char: "🤌", name: "pinched fingers italian", cat: "Hand" },
  // Symbols
  { char: "❤️", name: "heart red love", cat: "Symbol" },
  { char: "🧡", name: "heart orange", cat: "Symbol" },
  { char: "💛", name: "heart yellow", cat: "Symbol" },
  { char: "💚", name: "heart green", cat: "Symbol" },
  { char: "💙", name: "heart blue", cat: "Symbol" },
  { char: "💜", name: "heart purple", cat: "Symbol" },
  { char: "🖤", name: "heart black", cat: "Symbol" },
  { char: "💯", name: "hundred perfect 100", cat: "Symbol" },
  { char: "🔥", name: "fire hot lit", cat: "Symbol" },
  { char: "⭐", name: "star favorite", cat: "Symbol" },
  { char: "✨", name: "sparkles shine magic glitter", cat: "Symbol" },
  { char: "⚡", name: "lightning bolt fast zap", cat: "Symbol" },
  { char: "💡", name: "lightbulb idea", cat: "Symbol" },
  { char: "🎉", name: "party popper celebrate", cat: "Symbol" },
  { char: "🚀", name: "rocket launch fast ship", cat: "Symbol" },
  { char: "💰", name: "money bag cash", cat: "Symbol" },
  { char: "🏆", name: "trophy winner first", cat: "Symbol" },
  { char: "🎯", name: "target bullseye goal", cat: "Symbol" },
  // Tech
  { char: "💻", name: "laptop computer", cat: "Tech" },
  { char: "📱", name: "phone mobile iphone", cat: "Tech" },
  { char: "⌨️", name: "keyboard type", cat: "Tech" },
  { char: "🖥️", name: "desktop monitor computer", cat: "Tech" },
  { char: "💾", name: "floppy save disk", cat: "Tech" },
  { char: "🌐", name: "globe web internet world", cat: "Tech" },
  { char: "📡", name: "satellite signal antenna", cat: "Tech" },
  { char: "🔋", name: "battery power", cat: "Tech" },
  { char: "🔌", name: "plug electric power", cat: "Tech" },
  { char: "📶", name: "signal wifi bars", cat: "Tech" },
  { char: "🎮", name: "game controller", cat: "Tech" },
  { char: "🕹️", name: "joystick arcade", cat: "Tech" },
  // Arrows
  { char: "→", name: "arrow right next", cat: "Arrow" },
  { char: "←", name: "arrow left back previous", cat: "Arrow" },
  { char: "↑", name: "arrow up", cat: "Arrow" },
  { char: "↓", name: "arrow down", cat: "Arrow" },
  { char: "↗", name: "arrow up right diagonal", cat: "Arrow" },
  { char: "↘", name: "arrow down right diagonal", cat: "Arrow" },
  { char: "↙", name: "arrow down left diagonal", cat: "Arrow" },
  { char: "↖", name: "arrow up left diagonal", cat: "Arrow" },
  { char: "⇒", name: "arrow thick right implies", cat: "Arrow" },
  { char: "⇐", name: "arrow thick left", cat: "Arrow" },
  { char: "⇄", name: "arrows left right swap exchange", cat: "Arrow" },
  { char: "⟶", name: "long arrow right", cat: "Arrow" },
  // Marks
  { char: "✓", name: "check mark yes done", cat: "Mark" },
  { char: "✔", name: "check mark heavy", cat: "Mark" },
  { char: "✗", name: "cross x no wrong", cat: "Mark" },
  { char: "✘", name: "cross heavy no", cat: "Mark" },
  { char: "⚠️", name: "warning caution alert", cat: "Mark" },
  { char: "❓", name: "question mark unknown", cat: "Mark" },
  { char: "❗", name: "exclamation important", cat: "Mark" },
  { char: "ℹ️", name: "info information", cat: "Mark" },
  { char: "⭕", name: "circle hollow ok", cat: "Mark" },
  { char: "•", name: "bullet point dot", cat: "Mark" },
  { char: "—", name: "em dash long", cat: "Mark" },
  { char: "…", name: "ellipsis three dots", cat: "Mark" },
  // Math
  { char: "×", name: "multiply times cross", cat: "Math" },
  { char: "÷", name: "divide division", cat: "Math" },
  { char: "±", name: "plus minus plusminus", cat: "Math" },
  { char: "≈", name: "approximately equal", cat: "Math" },
  { char: "≠", name: "not equal", cat: "Math" },
  { char: "≤", name: "less than or equal", cat: "Math" },
  { char: "≥", name: "greater than or equal", cat: "Math" },
  { char: "∞", name: "infinity", cat: "Math" },
  { char: "π", name: "pi math", cat: "Math" },
  { char: "Σ", name: "sigma sum", cat: "Math" },
  { char: "√", name: "square root radical", cat: "Math" },
  { char: "°", name: "degree temperature", cat: "Math" },
];

function EmojiPicker() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const cats = useMemo(
    () => ["All", ...Array.from(new Set(EMOJI_SET.map((e) => e.cat)))],
    [],
  );
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return EMOJI_SET.filter((e) => {
      if (cat !== "All" && e.cat !== cat) return false;
      if (!query) return true;
      return e.name.includes(query) || e.char === query;
    });
  }, [q, cat]);

  return (
    <Section
      id="emoji"
      title="Emoji & Symbol Picker"
      desc="Search, click to copy — emojis, arrows, checks, math."
      accent="gold"
      index={33}
    >
      <div className="flex gap-2 mb-3 flex-wrap">
        <input
          className="tool-input neon-input flex-1 min-w-[160px]"
          placeholder="Search emojis… (e.g. rocket, heart, arrow)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search emojis"
        />
        <div className="flex gap-1 flex-wrap">
          {cats.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCat(c)}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider border transition-colors ${
                cat === c
                  ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border-[var(--accent-gold)]/40"
                  : "bg-white/[0.02] text-white/40 border-white/[0.06] hover:text-white/70"
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
          {filtered.map((e, i) => (
            <motion.button
              key={`${e.char}-${i}`}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.2, y: -2 }}
              onClick={() => copyToClipboard(e.char, `Copied ${e.char}`)}
              title={`${e.name} — click to copy`}
              aria-label={`Copy ${e.name}`}
              className="aspect-square rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-[var(--accent-gold)]/30 flex items-center justify-center text-xl transition-colors"
            >
              {e.char}
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="text-center text-white/40 py-6 font-[family-name:var(--font-mono)] text-xs">
          No matches for &quot;{q}&quot;
        </p>
      )}
      <p className="mt-3 text-[10px] text-white/30 font-[family-name:var(--font-mono)] text-center">
        {filtered.length} shown · Click any symbol to copy
      </p>
    </Section>
  );
}

/* ═══════════════ TOOL 35: Box Shadow Generator ═══════════════ */
interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

function ShadowGenerator() {
  const [shadows, setShadows] = useState<ShadowLayer[]>([
    { x: 0, y: 12, blur: 30, spread: -4, color: "#000000", opacity: 0.35, inset: false },
    { x: 0, y: 2, blur: 6, spread: 0, color: "#06b6d4", opacity: 0.35, inset: false },
  ]);

  const renderLayer = (s: ShadowLayer) => {
    const c = s.color.replace("#", "");
    const r = parseInt(c.slice(0, 2), 16) || 0;
    const g = parseInt(c.slice(2, 4), 16) || 0;
    const b = parseInt(c.slice(4, 6), 16) || 0;
    return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(${r}, ${g}, ${b}, ${s.opacity})`;
  };

  const cssValue = shadows.map(renderLayer).join(", ");
  const cssMultiLine = shadows.map(renderLayer).join(",\n             ");

  const update = (i: number, patch: Partial<ShadowLayer>) => {
    setShadows((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  };
  const remove = (i: number) =>
    setShadows((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev));
  const add = () =>
    setShadows((prev) => [
      ...prev,
      { x: 0, y: 4, blur: 12, spread: 0, color: "#a855f7", opacity: 0.3, inset: false },
    ]);
  const reset = () => {
    setShadows([
      { x: 0, y: 12, blur: 30, spread: -4, color: "#000000", opacity: 0.35, inset: false },
      { x: 0, y: 2, blur: 6, spread: 0, color: "#06b6d4", opacity: 0.35, inset: false },
    ]);
    toast("Reset to defaults", "info");
  };

  const sliders: Array<[string, keyof ShadowLayer, number, number, string]> = [
    ["X", "x", -50, 50, "px"],
    ["Y", "y", -50, 50, "px"],
    ["Blur", "blur", 0, 100, "px"],
    ["Spread", "spread", -50, 50, "px"],
  ];

  return (
    <Section
      id="shadow"
      title="Box Shadow Generator"
      desc="Multi-layer CSS box-shadow with live preview."
      accent="purple"
      index={34}
    >
      <div className="grid md:grid-cols-[1fr_300px] gap-5">
        {/* Preview */}
        <div
          className="flex items-center justify-center min-h-[260px] rounded-xl p-8 border border-white/[0.06]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04), transparent), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 8px, transparent 8px 16px)",
          }}
        >
          <motion.div
            layout
            className="w-36 h-36 rounded-2xl bg-white/95"
            style={{ boxShadow: cssValue }}
          />
        </div>
        {/* Controls */}
        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {shadows.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-white/[0.08] bg-black/20 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-[family-name:var(--font-mono)] text-white/40 uppercase tracking-wider">
                  Layer {i + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-[family-name:var(--font-mono)] text-white/55 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.inset}
                      onChange={(e) => update(i, { inset: e.target.checked })}
                      className="accent-[var(--accent-purple)]"
                    />{" "}
                    inset
                  </label>
                  <button
                    onClick={() => remove(i)}
                    disabled={shadows.length <= 1}
                    aria-label="Remove layer"
                    className="text-white/30 hover:text-red-400 text-base leading-none w-5 h-5 rounded hover:bg-red-400/10 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {sliders.map(([label, key, min, max, unit]) => {
                  const v = s[key] as number;
                  return (
                    <label
                      key={key as string}
                      className="text-[9px] font-[family-name:var(--font-mono)] text-white/40 uppercase tracking-wider flex flex-col gap-1"
                    >
                      <span className="flex justify-between">
                        <span>{label}</span>
                        <span className="text-white/60 normal-case">
                          {v}
                          {unit}
                        </span>
                      </span>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={v}
                        onChange={(e) =>
                          update(i, { [key]: parseInt(e.target.value, 10) } as Partial<ShadowLayer>)
                        }
                        className="w-full accent-[var(--accent-purple)]"
                      />
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => update(i, { color: e.target.value })}
                  aria-label={`Layer ${i + 1} color`}
                  className="w-7 h-7 rounded border border-white/10 cursor-pointer"
                />
                <label className="flex-1 text-[9px] font-[family-name:var(--font-mono)] text-white/40 uppercase tracking-wider flex flex-col gap-0.5">
                  <span className="flex justify-between">
                    <span>Opacity</span>
                    <span className="text-white/60 normal-case">
                      {Math.round(s.opacity * 100)}%
                    </span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.opacity * 100}
                    onChange={(e) => update(i, { opacity: parseInt(e.target.value, 10) / 100 })}
                    className="w-full accent-[var(--accent-purple)]"
                  />
                </label>
              </div>
            </motion.div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={add}
              className="tool-btn text-xs"
            >
              + Add layer
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="tool-btn text-xs"
            >
              Reset
            </motion.button>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-black/30 border border-white/[0.06] p-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <pre className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--accent-cyan)] whitespace-pre-wrap flex-1 min-w-[200px]">{`box-shadow: ${cssMultiLine};`}</pre>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => copyToClipboard(`box-shadow: ${cssValue};`, "CSS copied")}
            className="tool-btn-primary tool-btn shrink-0"
          >
            Copy CSS
          </motion.button>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════ */
export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [activeCat, setActiveCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [hackerMode, setHackerMode] = useState(false);
  const [toolUses, setToolUses] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const seenToolsRef = useRef(new Set<string>());

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // On mount — and on subsequent hash changes — if the URL has #toolid(?v=...),
  // scroll that tool section into view. Tools that opt into prefill (json,
  // base64, url, hash) read the ?v= payload themselves from prefillFor().
  useEffect(() => {
    const scrollToHash = () => {
      const pref = readHashPrefill();
      if (!pref) return;
      // Defer one frame so tool sections have mounted.
      requestAnimationFrame(() => {
        const el = document.getElementById(pref.id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  // Track tool interaction (scroll into view = "use")
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = (entry.target as HTMLElement).id;
        if (seenToolsRef.current.has(id)) return;
        seenToolsRef.current.add(id);
        setToolUses(seenToolsRef.current.size);
      });
    }, { threshold: 0.5 });
    NAV_IDS.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const filteredIds = useMemo(() => NAV_IDS.filter((id) => {
    const meta = TOOL_META[id];
    if (activeCat !== "All" && meta.cat !== activeCat) return false;
    if (deferredSearch && !meta.keywords.includes(deferredSearch) && !id.includes(deferredSearch)) return false;
    return true;
  }), [activeCat, deferredSearch]);

  const luckyTool = () => {
    const source = filteredIds.length > 0 ? filteredIds : NAV_IDS;
    const id = source[Math.floor(Math.random() * source.length)];
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Map of ID -> component
  const toolComponents = useMemo<Record<ToolId, React.ComponentType>>(() => ({
    palette: Palette, markdown: MarkdownPreview, inspo: Inspiration,
    json: JSONFormatter, regex: RegexTester, timestamp: TimestampConverter,
    contrast: ContrastChecker, generator: GeneratorKit, base64: Base64Tool,
    url: URLTool, lorem: LoremIpsum, hash: HashGenerator,
    wordcount: WordCounter, cssunit: CSSUnitConverter, slug: SlugStudio,
    textcase: TextCaseStudio, csvjson: CSVJSONStudio, httpstatus: HTTPStatusExplorer,
    cron: CronBuilder, qrcode: QRCodeGenerator,
    jwt: JWTDecoder, pomodoro: PomodoroTimer, ipinfo: IPInfo,
    diff: DiffChecker, baseconv: BaseConverter, gradient: GradientGenerator,
    password: PasswordTester, eightball: Magic8Ball, coinflip: CoinFlip,
    dice: DiceRoller, ascii: ASCIIArtGenerator, colorgame: ColorGuessingGame,
    sql: SQLFormatter, emoji: EmojiPicker, shadow: ShadowGenerator,
  }), []);

  return (
    <>
      <SpotlightCursor />
      <ToolsParticles />
      <MatrixRain active={hackerMode} />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      <Navbar breadcrumb={["tools"]} />
      <main className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-[1200px] mx-auto space-y-6 sm:space-y-8 relative z-10">
        <AnimIn>
          <div className="mb-8 sm:mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 mb-4">
              <motion.span animate={{ boxShadow: ["0 0 8px var(--accent-cyan)", "0 0 20px var(--accent-cyan)", "0 0 8px var(--accent-cyan)"] }} transition={{ duration: 2.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
              <span className={`text-sm font-[family-name:var(--font-mono)] ${hackerMode ? "text-green-400" : "text-[var(--accent-cyan)]"}`}>{hackerMode ? "$ sudo developer_tools --hacker" : "❯ developer_tools"}</span>
            </motion.div>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-bold">
                  <span className={hackerMode ? "text-green-400" : "text-shimmer"}>{hackerMode ? "> Developer_Tools" : "Developer Tools"}</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-[var(--text-secondary)] max-w-xl text-sm sm:text-base">
                  {filteredIds.length === TOOL_COUNT ? `${TOOL_COUNT} client-side utilities` : `Showing ${filteredIds.length} of ${TOOL_COUNT} tools`} for encoding, formatting, testing, and generating — zero tracking.
                </motion.p>
              </div>
              <div className="flex items-center gap-3">
                <ToolCountBadge />
                {toolUses > 5 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-purple)]/5 border border-[var(--accent-purple)]/15">
                    <span className="text-xs text-[var(--accent-purple)] font-[family-name:var(--font-mono)]">{toolUses} explored</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Search + Actions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools... (Ctrl+K)"
                  className="tool-input neon-input pl-10 pr-4" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs" aria-label="Clear tool search">&times;</button>}
              </div>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }} onClick={luckyTool}
                  className="tool-btn-primary tool-btn flex items-center gap-1.5 whitespace-nowrap">
                  <Dice6 size={14} strokeWidth={1.8} aria-hidden /> Feeling Lucky
                </motion.button>
                <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }} onClick={() => setHackerMode(!hackerMode)}
                  className={`tool-btn flex items-center gap-1.5 whitespace-nowrap transition-all ${hackerMode ? "!bg-green-400/10 !border-green-400/30 !text-green-400" : ""}`}>
                  {hackerMode ? <CircleDot size={14} strokeWidth={1.8} aria-hidden /> : <Terminal size={14} strokeWidth={1.8} aria-hidden />}
                  <span className="hidden sm:inline">{hackerMode ? "Exit Matrix" : "Hacker Mode"}</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Category Filters */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <motion.button key={cat} whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[0.65rem] font-[family-name:var(--font-mono)] uppercase tracking-wider border transition-all cursor-pointer ${
                    activeCat === cat
                      ? "text-white border-transparent"
                      : "text-white/40 border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:text-white/60"
                  }`}
                  style={activeCat === cat ? { background: `${CAT_COLORS[cat]}20`, borderColor: `${CAT_COLORS[cat]}40`, color: CAT_COLORS[cat] } : {}}>
                  {cat} {cat !== "All" && <span className="ml-1 opacity-50">({NAV_IDS.filter(id => TOOL_META[id].cat === cat).length})</span>}
                </motion.button>
              ))}
            </motion.div>

            {/* Quick Jump Tags */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-4 flex flex-wrap gap-1.5">
              {filteredIds.map((id, i) => (
                <motion.a key={id} href={`#${id}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9+i*0.02 }} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}
                  className={`tech-tag text-[0.6rem] cursor-pointer ${hackerMode ? "!text-green-400/60 !border-green-400/20 hover:!text-green-400 hover:!border-green-400/40" : ""}`}>
                  {id}
                </motion.a>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-6 grid md:grid-cols-3 gap-3">
              {[
                {
                  title: "Content Ops",
                  desc: "Slug, text case, and markdown tools for shipping cleaner copy.",
                  links: ["slug", "textcase", "markdown"],
                },
                {
                  title: "API Debugging",
                  desc: "JSON, regex, HTTP status codes, and JWT inspection in one stop.",
                  links: ["json", "regex", "httpstatus", "jwt"],
                },
                {
                  title: "Shipping Prep",
                  desc: "Cron schedules, CSV transforms, QR codes, and generators for handoff work.",
                  links: ["cron", "csvjson", "qrcode", "generator"],
                },
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
        </AnimIn>

        {/* Filtered tools */}
        <AnimatePresence mode="sync">
          {filteredIds.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white/50 font-[family-name:var(--font-mono)] text-sm">No tools match &quot;{search}&quot; in {activeCat}</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setSearch(""); setActiveCat("All"); }}
                className="mt-4 tool-btn-primary tool-btn">Clear Filters</motion.button>
            </motion.div>
          ) : (
            filteredIds.map((id) => {
              const ToolComponent = toolComponents[id];
              return <ToolComponent key={id} />;
            })
          )}
        </AnimatePresence>

        <AnimIn delay={0.2}>
          <div className="text-center pt-8 pb-4">
            <motion.p whileHover={{ scale: 1.02 }} className={`text-xs font-[family-name:var(--font-mono)] ${hackerMode ? "text-green-400/40" : "text-[var(--text-muted)]"}`}>
              {hackerMode ? "// all tools run client-side | no data exfiltrated | privacy: maximum" : "All tools run client-side · No data leaves your browser"} · <Link href="/" className={hackerMode ? "text-green-400 hover:underline" : "text-[var(--accent-cyan)] hover:underline"}>Back to Hub</Link>
            </motion.p>
          </div>
        </AnimIn>
      </main>
    </>
  );
}

/* ═══════════════ TOOL 1: Color Palette ═══════════════ */
function Palette() {
  const [h, setH] = useState(200); const [s, setS] = useState(100); const [l, setL] = useState(60); const [copied, setCopied] = useState(false);
  const color = `hsl(${h} ${s}% ${l}%)`;
  const hslToRgb = useCallback((hue: number, sat: number, light: number) => {
    const saturation = sat / 100;
    const brightness = light / 100;
    const chroma = (1 - Math.abs(2 * brightness - 1)) * saturation;
    const segment = hue / 60;
    const x = chroma * (1 - Math.abs((segment % 2) - 1));
    let r = 0, g = 0, b = 0;

    if (segment >= 0 && segment < 1) [r, g, b] = [chroma, x, 0];
    else if (segment < 2) [r, g, b] = [x, chroma, 0];
    else if (segment < 3) [r, g, b] = [0, chroma, x];
    else if (segment < 4) [r, g, b] = [0, x, chroma];
    else if (segment < 5) [r, g, b] = [x, 0, chroma];
    else [r, g, b] = [chroma, 0, x];

    const match = brightness - chroma / 2;
    return [r, g, b].map((channel) => Math.round((channel + match) * 255));
  }, []);
  const [r, g, b] = useMemo(() => hslToRgb(h, s, l), [h, s, l, hslToRgb]);
  const hex = useMemo(
    () =>
      `#${[r, g, b]
        .map((channel) => channel.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()}`,
    [r, g, b],
  );
  const paletteControls = [
    { label: "Hue", value: h, setValue: setH, max: 360 },
    { label: "Sat", value: s, setValue: setS, max: 100 },
    { label: "Light", value: l, setValue: setL, max: 100 },
  ] as const;
  const swatches = [20, 35, 50, 65, 80];
  function copy(value = `hsl(${h} ${s}% ${l}%)`) { copyToClipboard(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  function randomize() {
    setH(Math.floor(Math.random() * 361));
    setS(Math.floor(Math.random() * 41) + 55);
    setL(Math.floor(Math.random() * 31) + 35);
  }
  return (
    <Section id="palette" title="Color Palette" desc="Generate a quick palette, randomize a colorway, and copy CSS-ready values." accent="purple" index={0}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <motion.div whileHover={{ scale: 1.05, rotate: 2 }} transition={{ type: "spring", stiffness: 300 }}
          className="w-full sm:w-40 h-24 sm:h-28 rounded-xl border border-white/10 shadow-lg cursor-pointer" style={{ background: color, boxShadow: `0 8px 30px ${color}33` }} onClick={() => copy()} />
        <div className="flex-1 w-full grid sm:grid-cols-3 gap-3 sm:gap-4">
          {paletteControls.map((control) => (
            <div key={control.label}><label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">{control.label} <span className="text-[var(--accent-cyan)]">{control.value}</span></label>
              <input type="range" min="0" max={control.max} value={control.value} onChange={(e) => control.setValue(+e.target.value)} className="w-full mt-1 accent-[var(--accent-cyan)]" /></div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-3 gap-2">
        {[
          { label: "HSL", value: `hsl(${h} ${s}% ${l}%)` },
          { label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
          { label: "HEX", value: hex },
        ].map((token) => (
          <motion.button
            key={token.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => copy(token.value)}
            className="rounded-lg border border-white/[0.05] bg-black/20 px-3 py-3 text-left transition-colors hover:border-white/10"
          >
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{token.label}</div>
            <div className="mt-1 text-sm text-[var(--accent-cyan)] font-[family-name:var(--font-mono)] break-all">{token.value}</div>
          </motion.button>
        ))}
      </div>
      <div className="mt-4 text-sm flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)]">
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn-primary tool-btn" onClick={() => copy()}>
          <AnimatePresence mode="wait"><motion.span key={copied?"done":"copy"} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }}>{copied ? "✓ Copied!" : "Copy"}</motion.span></AnimatePresence>
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn" onClick={randomize}>
          Randomize
        </motion.button>
      </div>
      <div className="mt-4 flex gap-1 rounded-lg overflow-hidden">
        {swatches.map((lt) => (
          <motion.div
            key={lt}
            whileHover={{ scaleY: 1.5 }}
            className="flex-1 h-6 cursor-pointer transition-transform"
            style={{ background: `hsl(${h} ${s}% ${lt}%)` }}
            onClick={() => {
              setL(lt);
              copy(`hsl(${h} ${s}% ${lt}%)`);
            }}
          />
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 2: Markdown Preview ═══════════════ */
function MarkdownPreview() {
  const starter =
    "# Release Notes\n\nThis is **live** preview with *italic* support.\n\n## Features\n- Real-time rendering\n- Copy-ready notes\n- Fast client-only parsing";
  const [text, setText] = useState(starter);
  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const headings = text.split("\n").filter((line) => line.startsWith("#")).length;
    return { words, headings };
  }, [text]);
  return (
    <Section id="markdown" title="Markdown Preview" desc="Lightweight headings, bold, italics, lists." accent="cyan" index={1}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-[family-name:var(--font-mono)]">
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-white/50">
          {stats.words} words
        </span>
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-white/50">
          {stats.headings} headings
        </span>
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn text-xs" onClick={() => setText(starter)}>
          Reset Sample
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn text-xs" onClick={() => copyToClipboard(text)}>
          Copy Markdown
        </motion.button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="tool-input neon-input min-h-[200px] sm:min-h-[220px] resize-none" />
        <motion.div layout className="prose prose-invert max-w-none p-4 rounded-xl border border-white/[0.04] bg-black/20 min-h-[200px] overflow-auto text-sm">
          <MDRender text={text} />
        </motion.div>
      </div>
    </Section>
  );
}

function renderInlineMarkdown(text: string, keyPrefix: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-strong-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${keyPrefix}-em-${index}`}>{part.slice(1, -1)}</em>;
    }

    return <span key={`${keyPrefix}-text-${index}`}>{part}</span>;
  });
}

function MDRender({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc pl-5 space-y-1 mb-3">
        {listItems.map((item, index) => (
          <li key={`list-item-${index}`}>{renderInlineMarkdown(item, `list-${blocks.length}-${index}`)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line) => {
    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();

    if (!line.trim()) {
      blocks.push(<div key={`space-${blocks.length}`} className="h-3" />);
      return;
    }

    if (line.startsWith("### ")) {
      blocks.push(<h3 key={`h3-${blocks.length}`} className="text-lg font-semibold mb-2">{renderInlineMarkdown(line.slice(4), `h3-${blocks.length}`)}</h3>);
      return;
    }

    if (line.startsWith("## ")) {
      blocks.push(<h2 key={`h2-${blocks.length}`} className="text-xl font-semibold mb-2">{renderInlineMarkdown(line.slice(3), `h2-${blocks.length}`)}</h2>);
      return;
    }

    if (line.startsWith("# ")) {
      blocks.push(<h1 key={`h1-${blocks.length}`} className="text-2xl font-semibold mb-2">{renderInlineMarkdown(line.slice(2), `h1-${blocks.length}`)}</h1>);
      return;
    }

    blocks.push(<p key={`p-${blocks.length}`} className="mb-3">{renderInlineMarkdown(line, `p-${blocks.length}`)}</p>);
  });

  flushList();

  return <div>{blocks}</div>;
}

/* ═══════════════ TOOL 3: Inspiration ═══════════════ */
function Inspiration() {
  const ideas = ["What if UI elements behaved like liquids?","Turn keyboard input into ambient visuals.","Map Git commit history to sound and color.","Build a CSS-only particle system.","Create a terminal that responds to music.","Design a portfolio that looks like a game HUD.","Build a clock using only CSS animations.","Make a dark theme so dark it feels like space."];
  const [idx, setIdx] = useState(0);
  return (
    <Section id="inspo" title="Inspiration" desc="Quick idea spark." accent="gold" index={2}>
      <div className="flex items-center justify-between gap-4">
        <AnimatePresence mode="wait"><motion.div key={idx} initial={{ opacity: 0, x: -20, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: 20, filter: "blur(4px)" }} transition={{ duration: 0.4 }} className="text-[var(--text-primary)] text-base sm:text-lg font-[family-name:var(--font-heading)]">&ldquo;{ideas[idx]}&rdquo;</motion.div></AnimatePresence>
        <motion.button whileTap={{ scale: 0.9, rotate: 180 }} whileHover={{ scale: 1.1 }} className="tool-btn-primary tool-btn whitespace-nowrap" onClick={() => setIdx((idx + 1) % ideas.length)}>Next ↻</motion.button>
      </div>
      <div className="mt-4 flex gap-1.5 justify-center">{ideas.map((_, i) => (<motion.div key={i} animate={{ scale: i===idx?1.3:1, background: i===idx?"var(--accent-gold)":"rgba(255,255,255,0.1)" }} className="w-1.5 h-1.5 rounded-full cursor-pointer" onClick={() => setIdx(i)} />))}</div>
    </Section>
  );
}

/* ═══════════════ TOOL 4: JSON Formatter ═══════════════ */
function JSONFormatter() {
  const starterJson = '{"hello":"world","arr":[1,2,3]}';
  const [input, setInput] = useState(() => prefillFor("json") ?? starterJson);
  const [space, setSpace] = useState(2);
  const [error, setError] = useState<string|null>(null);
  const [output, setOutput] = useState(() => {
    try { return JSON.stringify(JSON.parse(prefillFor("json") ?? starterJson), null, 2); }
    catch { return prefillFor("json") ?? starterJson; }
  });
  function prettify() { try { setError(null); setOutput(JSON.stringify(JSON.parse(input), null, space)); } catch (error) { setError(getErrorMessage(error)); setOutput(""); } }
  function minify() { try { setError(null); setOutput(JSON.stringify(JSON.parse(input))); } catch (error) { setError(getErrorMessage(error)); setOutput(""); } }
  return (
    <Section id="json" title="JSON Formatter" desc="Validate, prettify, or minify." accent="cyan" index={3}>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="tool-input neon-input min-h-[200px] sm:min-h-[220px] resize-none" placeholder="Paste JSON here…" />
        <textarea value={output} readOnly className="tool-input min-h-[200px] sm:min-h-[220px] resize-none bg-black/20" placeholder="Output…" />
      </div>
      <AnimatePresence>{error && (<motion.div initial={{ opacity:0, y:-5, height:0 }} animate={{ opacity:1, y:0, height:"auto" }} exit={{ opacity:0 }} className="text-red-400 text-xs mt-2 font-[family-name:var(--font-mono)] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Error: {error}</motion.div>)}</AnimatePresence>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <label className="text-xs text-[var(--text-muted)]">Spaces</label>
        <input type="number" min={0} max={8} value={space} onChange={(e) => setSpace(parseInt(e.target.value||"0"))} className="tool-input w-16 text-center neon-input" />
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn-primary tool-btn" onClick={prettify}>Prettify</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn" onClick={minify}>Minify</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn" onClick={() => setInput('{"name":"maxwell","stack":["next","react","tailwind"],"status":"shipping"}')}>Load Sample</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn" onClick={() => copyToClipboard(output)}>Copy</motion.button>
        <ShareButton toolId="json" value={input} />
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 5: Regex Tester ═══════════════ */
function RegexTester() {
  const [pattern, setPattern] = useState("\\w+"); const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Try matching multiple words: hello world_123!"); const [error, setError] = useState<string|null>(null);
  const matches = useMemo(() => { try { setError(null); return [...text.matchAll(new RegExp(pattern, flags))].map((match) => ({ match: match[0], index: match.index ?? 0 })); } catch (error) { setError(getErrorMessage(error)); return []; } }, [pattern, flags, text]);
  return (
    <Section id="regex" title="Regex Tester" desc="Test JavaScript regexes." accent="purple" index={4}>
      <div className="grid gap-3">
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <input className="tool-input neon-input flex-1 min-w-0" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Pattern" />
          <input className="tool-input neon-input w-20 sm:w-24" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="Flags" />
        </div>
        <textarea className="tool-input neon-input min-h-[120px] sm:min-h-[140px] resize-none" value={text} onChange={(e) => setText(e.target.value)} />
        {error ? (<motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-red-400 text-xs font-[family-name:var(--font-mono)]">{error}</motion.div>) : (
          <div className="text-sm text-[var(--text-secondary)]"><span className="text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Matches ({matches.length}):</span>{" "}
            <div className="flex flex-wrap gap-1 mt-1">{matches.map((m, i) => (<motion.span key={i} initial={{ opacity:0, scale:0.7, y:5 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ delay:i*0.04, type:"spring", stiffness:300 }} whileHover={{ scale:1.1, y:-2 }} className="inline-block bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 rounded-md px-2 py-1 text-xs font-[family-name:var(--font-mono)] cursor-default">{m.match}<span className="text-[var(--text-muted)]"> @{m.index}</span></motion.span>))}</div>
          </div>
        )}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 6: Timestamp Converter ═══════════════ */
function TimestampConverter() {
  const [ts, setTs] = useState(String(Math.floor(Date.now()/1000)));
  const [mode, setMode] = useState<"ts"|"date">("ts");
  const [dateStr, setDateStr] = useState("");
  const converted = useMemo(() => {
    if (mode === "ts") { const n = Number(ts); if (isNaN(n)) return "Invalid timestamp"; const d = new Date(n * (String(n).length <= 10 ? 1000 : 1)); return d.toString() === "Invalid Date" ? "Invalid timestamp" : d.toLocaleString() + " (UTC: " + d.toUTCString() + ")"; }
    else { try { const d = new Date(dateStr || Date.now()); return isNaN(d.getTime()) ? "Invalid date" : `Unix: ${Math.floor(d.getTime()/1000)}  ·  ms: ${d.getTime()}`; } catch { return "Invalid date"; } }
  }, [ts, dateStr, mode]);
  return (
    <Section id="timestamp" title="Timestamp Converter" desc="Unix ↔ human-readable." accent="gold" index={5}>
      <div className="flex gap-2 mb-4">
        {(["ts","date"] as const).map((m) => (<motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => setMode(m)}
          className={`px-4 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${mode===m?"bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>
          {m === "ts" ? "Unix → Date" : "Date → Unix"}</motion.button>))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:10 }}>
          {mode === "ts" ? (<input className="tool-input neon-input" value={ts} onChange={(e) => setTs(e.target.value)} placeholder="Enter Unix timestamp..." />)
            : (<input type="datetime-local" className="tool-input neon-input" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />)}
        </motion.div>
      </AnimatePresence>
      <motion.div layout className="mt-3 p-3 rounded-lg bg-black/20 border border-white/[0.04] text-sm text-[var(--text-secondary)] font-[family-name:var(--font-mono)] break-all">{converted}</motion.div>
      <div className="mt-3 flex gap-2">
        <motion.button whileTap={{ scale:0.9 }} className="tool-btn text-xs" onClick={() => setTs(String(Math.floor(Date.now()/1000)))}>Now</motion.button>
        <motion.button whileTap={{ scale:0.9 }} className="tool-btn text-xs" onClick={() => copyToClipboard(converted)}>Copy</motion.button>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 7: Contrast Checker ═══════════════ */
function ContrastChecker() {
  const [fg, setFg] = useState("#ffffff"); const [bg, setBg] = useState("#1a1a2e");
  function hexToRgb(hex: string) { const m = hex.replace("#","").match(/.{2}/g); return m ? m.map(x => parseInt(x,16)) : [0,0,0]; }
  function luminance(r:number,g:number,b:number) { const [rs,gs,bs] = [r,g,b].map(c => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); }); return 0.2126*rs + 0.7152*gs + 0.0722*bs; }
  const ratio = useMemo(() => { const [r1,g1,b1] = hexToRgb(fg); const [r2,g2,b2] = hexToRgb(bg); const l1 = luminance(r1,g1,b1); const l2 = luminance(r2,g2,b2); return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)); }, [fg, bg]);
  const grade = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail";
  const gradeColor = ratio >= 4.5 ? "text-green-400" : ratio >= 3 ? "text-yellow-400" : "text-red-400";
  return (
    <Section id="contrast" title="Contrast Checker" desc="WCAG accessibility ratio." accent="cyan" index={6}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div><label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">Foreground</label>
            <div className="flex gap-2 mt-1"><input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-white/10" /><input className="tool-input neon-input flex-1" value={fg} onChange={(e) => setFg(e.target.value)} /></div></div>
          <div><label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">Background</label>
            <div className="flex gap-2 mt-1"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-white/10" /><input className="tool-input neon-input flex-1" value={bg} onChange={(e) => setBg(e.target.value)} /></div></div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl p-6 flex flex-col items-center justify-center text-center" style={{ background: bg, color: fg, border: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">Aa</span>
          <span className="text-sm mt-1">Sample Text</span>
          <span className={`text-xs mt-3 font-bold font-[family-name:var(--font-mono)] ${gradeColor}`}>{ratio.toFixed(2)}:1 — {grade}</span>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 8: Generator Kit ═══════════════ */
function GeneratorKit() {
  const [uuid, setUuid] = useState(""); const [pw, setPw] = useState(""); const [pwLen, setPwLen] = useState(20);
  const [upper, setUpper] = useState(true); const [nums, setNums] = useState(true); const [syms, setSyms] = useState(true);
  function genUUID() { setUuid(crypto.randomUUID()); }
  function genPW() { let chars = "abcdefghijklmnopqrstuvwxyz"; if (upper) chars+="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; if (nums) chars+="0123456789"; if (syms) chars+="!@#$%^&*()_+-=[]{}|;:,./<>?"; const arr = new Uint32Array(pwLen); crypto.getRandomValues(arr); setPw(Array.from(arr, v => chars[v % chars.length]).join("")); }
  useEffect(() => { genUUID(); genPW(); }, []);
  return (
    <Section id="generator" title="Generator Kit" desc="UUID v4 + secure passwords." accent="purple" index={7}>
      <div className="space-y-5">
        <div>
          <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2 block">UUID v4</label>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap"><input className="tool-input neon-input flex-1 min-w-0" readOnly value={uuid} />
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn-primary tool-btn whitespace-nowrap" onClick={genUUID}>Generate</motion.button>
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn whitespace-nowrap" onClick={() => copyToClipboard(uuid)}>Copy</motion.button></div>
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2 block">Password ({pwLen} chars)</label>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap"><input className="tool-input neon-input flex-1 min-w-0" readOnly value={pw} />
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn-primary tool-btn whitespace-nowrap" onClick={genPW}>Generate</motion.button>
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn whitespace-nowrap" onClick={() => copyToClipboard(pw)}>Copy</motion.button></div>
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <label className="text-xs text-[var(--text-muted)]">Length <input type="number" min={6} max={64} value={pwLen} onChange={(e) => setPwLen(+e.target.value||16)} className="tool-input w-16 text-center ml-1 neon-input" /></label>
            {[["A-Z", upper, setUpper], ["0-9", nums, setNums], ["!@#", syms, setSyms]].map(([label, val, setter]: any) => (
              <label key={label} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer">
                <motion.div whileTap={{ scale:0.8 }} className={`w-4 h-4 rounded border transition-all cursor-pointer flex items-center justify-center ${val?"bg-[var(--accent-purple)] border-[var(--accent-purple)]":"border-white/20"}`} onClick={() => setter(!val)}>
                  {val && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                </motion.div>{label}</label>))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 9: Base64 Tool ═══════════════ */
function Base64Tool() {
  const [input, setInput] = useState(() => prefillFor("base64") ?? "Hello, World!"); const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode"|"decode">("encode");
  function convert() { try { setOutput(mode === "encode" ? btoa(input) : atob(input)); } catch { setOutput("Error: Invalid input"); } }
  useEffect(() => { convert(); }, [input, mode]);
  return (
    <Section id="base64" title="Base64 Encoder / Decoder" desc="Encode or decode Base64 strings." accent="gold" index={8}>
      <div className="flex gap-2 mb-4">
        {(["encode","decode"] as const).map((m) => (<motion.button key={m} whileTap={{ scale:0.95 }} onClick={() => setMode(m)}
          className={`px-4 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${mode===m?"bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>{m}</motion.button>))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea className="tool-input neon-input min-h-[140px] resize-none" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input..." />
        <textarea className="tool-input min-h-[140px] resize-none bg-black/20" readOnly value={output} placeholder="Output..." />
      </div>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <motion.button whileTap={{ scale:0.9 }} className="tool-btn" onClick={() => copyToClipboard(output)}>Copy Output</motion.button>
        <ShareButton toolId="base64" value={input} />
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 10: URL Encoder/Decoder ═══════════════ */
function URLTool() {
  const [input, setInput] = useState(() => prefillFor("url") ?? "https://example.com/path?q=hello world&foo=bar baz"); const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode"|"decode">("encode");
  useEffect(() => { try { setOutput(mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input)); } catch { setOutput("Error: Invalid input"); } }, [input, mode]);
  return (
    <Section id="url" title="URL Encoder / Decoder" desc="Encode or decode URL components." accent="cyan" index={9}>
      <div className="flex gap-2 mb-4">
        {(["encode","decode"] as const).map((m) => (<motion.button key={m} whileTap={{ scale:0.95 }} onClick={() => setMode(m)}
          className={`px-4 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${mode===m?"bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>{m}</motion.button>))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea className="tool-input neon-input min-h-[120px] resize-none" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input..." />
        <textarea className="tool-input min-h-[120px] resize-none bg-black/20" readOnly value={output} placeholder="Output..." />
      </div>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <motion.button whileTap={{ scale:0.9 }} className="tool-btn" onClick={() => copyToClipboard(output)}>Copy Output</motion.button>
        <ShareButton toolId="url" value={input} />
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 11: Lorem Ipsum Generator ═══════════════ */
function LoremIpsum() {
  const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
  const [count, setCount] = useState(3); const [unit, setUnit] = useState<"paragraphs"|"sentences"|"words">("paragraphs"); const [output, setOutput] = useState("");
  function generate() {
    const randWords = (n: number) => Array.from({ length: n }, () => WORDS[Math.floor(Math.random()*WORDS.length)]).join(" ");
    const sentence = () => { const w = randWords(8 + Math.floor(Math.random()*8)); return w.charAt(0).toUpperCase() + w.slice(1) + "."; };
    const paragraph = () => Array.from({ length: 4 + Math.floor(Math.random()*4) }, sentence).join(" ");
    if (unit === "words") setOutput(randWords(count));
    else if (unit === "sentences") setOutput(Array.from({ length: count }, sentence).join(" "));
    else setOutput(Array.from({ length: count }, paragraph).join("\n\n"));
  }
  useEffect(() => { generate(); }, [count, unit]);
  return (
    <Section id="lorem" title="Lorem Ipsum" desc="Generate placeholder text." accent="purple" index={10}>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(+e.target.value||1)} className="tool-input neon-input w-20 text-center" />
        {(["paragraphs","sentences","words"] as const).map((u) => (<motion.button key={u} whileTap={{ scale:0.95 }} onClick={() => setUnit(u)}
          className={`px-3 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${unit===u?"bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] border border-[var(--accent-purple)]/20":"bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"}`}>{u}</motion.button>))}
        <motion.button whileTap={{ scale:0.9 }} className="tool-btn-primary tool-btn" onClick={generate}>Regenerate</motion.button>
      </div>
      <textarea className="tool-input min-h-[160px] resize-none bg-black/20 text-sm" readOnly value={output} />
      <motion.button whileTap={{ scale:0.9 }} className="tool-btn mt-3" onClick={() => copyToClipboard(output)}>Copy</motion.button>
    </Section>
  );
}

/* ═══════════════ TOOL 12: Hash Generator ═══════════════ */
function HashGenerator() {
  const [input, setInput] = useState(() => prefillFor("hash") ?? "Hello, World!"); const [hashes, setHashes] = useState<Record<string,string>>({});
  async function compute() {
    const enc = new TextEncoder().encode(input);
    const results: Record<string,string> = {};
    for (const algo of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]) {
      const buf = await crypto.subtle.digest(algo, enc);
      results[algo] = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    setHashes(results);
  }
  useEffect(() => { compute(); }, [input]);
  return (
    <Section id="hash" title="Hash Generator" desc="SHA-1/256/384/512 hashing." accent="gold" index={11}>
      <div className="mb-4 flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <input className="tool-input neon-input flex-1 min-w-0" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text to hash..." />
        <ShareButton toolId="hash" value={input} />
      </div>
      <div className="space-y-2">
        {Object.entries(hashes).map(([algo, hash]) => (
          <motion.div key={algo} whileHover={{ scale: 1.01 }} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/[0.04] group cursor-pointer" onClick={() => copyToClipboard(hash)}>
            <span className="text-xs text-[var(--accent-gold)] font-[family-name:var(--font-mono)] w-16 shrink-0">{algo}</span>
            <span className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-mono)] break-all flex-1 min-w-0">{hash}</span>
            <span className="text-[0.6rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">copy</span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 13: Word Counter ═══════════════ */
function WordCounter() {
  const [text, setText] = useState("Paste or type your text here to see live statistics.");
  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length; const charsNoSpace = text.replace(/\s/g,"").length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
    const readMin = Math.ceil(words / 200);
    return { words, chars, charsNoSpace, sentences, paragraphs, readMin };
  }, [text]);
  return (
    <Section id="wordcount" title="Word Counter" desc="Live word, character, and reading time stats." accent="cyan" index={12}>
      <textarea className="tool-input neon-input min-h-[140px] resize-none mb-4" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste text..." />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {([["Words", stats.words], ["Chars", stats.chars], ["No Space", stats.charsNoSpace], ["Sentences", stats.sentences], ["Paras", stats.paragraphs], ["Read", `${stats.readMin}m`]] as const).map(([label, val]) => (
          <motion.div key={label} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] text-center">
            <div className="text-lg font-bold text-[var(--accent-cyan)] font-[family-name:var(--font-heading)]">{val}</div>
            <div className="text-[0.6rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 14: CSS Unit Converter ═══════════════ */
function CSSUnitConverter() {
  const [value, setValue] = useState(16); const [baseFont, setBaseFont] = useState(16);
  const conversions = useMemo(() => ({
    px: value,
    rem: +(value / baseFont).toFixed(4),
    em: +(value / baseFont).toFixed(4),
    pt: +(value * 0.75).toFixed(2),
    vw: +((value / 1920) * 100).toFixed(4),
    vh: +((value / 1080) * 100).toFixed(4),
    "%": +((value / baseFont) * 100).toFixed(2),
    cm: +(value * 0.02646).toFixed(4),
  }), [value, baseFont]);
  return (
    <Section id="cssunit" title="CSS Unit Converter" desc="Convert between px, rem, em, pt, vw, vh, etc." accent="purple" index={13}>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Value (px)</label>
        <input type="number" value={value} onChange={(e) => setValue(+e.target.value||0)} className="tool-input neon-input w-24 text-center" />
        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Base font</label>
        <input type="number" value={baseFont} onChange={(e) => setBaseFont(+e.target.value||16)} className="tool-input neon-input w-24 text-center" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(conversions).map(([unit, val]) => (
          <motion.div key={unit} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] text-center cursor-pointer group" onClick={() => copyToClipboard(`${val}${unit}`)}>
            <div className="text-lg font-bold text-[var(--accent-purple)] font-[family-name:var(--font-heading)]">{val}</div>
            <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] mt-0.5">{unit}</div>
            <div className="text-[0.5rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1">click to copy</div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 15: Slug Studio ═══════════════ */
function SlugStudio() {
  const [input, setInput] = useState("Maxwell Nixon Portfolio Launch Checklist");
  const slug = useMemo(() => {
    return input
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, [input]);
  const snake = slug.replace(/-/g, "_");

  return (
    <Section id="slug" title="Slug Studio" desc="Generate clean SEO slugs, URL paths, and snake case handles." accent="gold" index={14}>
      <textarea
        className="tool-input neon-input min-h-[120px] resize-none"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste a title, page name, or route label..."
      />
      <div className="mt-4 grid md:grid-cols-3 gap-3">
        {[
          { label: "Slug", value: slug || "-" },
          { label: "Snake", value: snake || "-" },
          { label: "Route", value: slug ? `/${slug}` : "/" },
        ].map((token) => (
          <motion.button
            key={token.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => copyToClipboard(token.value)}
            className="rounded-xl border border-white/[0.05] bg-black/20 p-4 text-left"
          >
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{token.label}</div>
            <div className="mt-2 text-sm text-[var(--accent-gold)] font-[family-name:var(--font-mono)] break-all">{token.value}</div>
          </motion.button>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 16: Text Case Studio ═══════════════ */
function TextCaseStudio() {
  const [input, setInput] = useState("Launch the obsidian luxe dashboard");
  const words = useMemo(
    () => input.trim().split(/\s+/).filter(Boolean),
    [input],
  );
  const titleCase = useMemo(
    () => words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" "),
    [words],
  );
  const sentenceCase = useMemo(() => {
    const normalized = input.trim();
    return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase() : "";
  }, [input]);
  const camelCase = useMemo(
    () =>
      words
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(""),
    [words],
  );
  const pascalCase = useMemo(
    () => words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(""),
    [words],
  );
  const kebabCase = useMemo(() => words.map((word) => word.toLowerCase()).join("-"), [words]);
  const snakeCase = useMemo(() => words.map((word) => word.toLowerCase()).join("_"), [words]);
  const outputs = [
    { label: "Upper", value: input.toUpperCase() },
    { label: "Lower", value: input.toLowerCase() },
    { label: "Title", value: titleCase },
    { label: "Sentence", value: sentenceCase },
    { label: "camelCase", value: camelCase },
    { label: "PascalCase", value: pascalCase },
    { label: "kebab-case", value: kebabCase },
    { label: "snake_case", value: snakeCase },
  ];

  return (
    <Section id="textcase" title="Text Case Studio" desc="Flip between title, sentence, camel, Pascal, kebab, and snake case." accent="cyan" index={15}>
      <textarea
        className="tool-input neon-input min-h-[120px] resize-none"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Type text to transform..."
      />
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {outputs.map((output) => (
          <motion.button
            key={output.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => copyToClipboard(output.value)}
            className="rounded-xl border border-white/[0.05] bg-black/20 p-4 text-left"
          >
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{output.label}</div>
            <div className="mt-2 text-sm text-[var(--text-primary)] break-all">{output.value || "—"}</div>
          </motion.button>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 17: CSV ↔ JSON ═══════════════ */
function CSVJSONStudio() {
  const csvSample = "name,role,stack\nMaxwell,Builder,Next.js\nClaude,Reviewer,Research\nCodex,Shipper,React";
  const jsonSample = '[{"name":"Maxwell","role":"Builder","stack":"Next.js"},{"name":"Claude","role":"Reviewer","stack":"Research"}]';
  const [mode, setMode] = useState<"csv-to-json" | "json-to-csv">("csv-to-json");
  const [input, setInput] = useState(csvSample);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parseCsvLine = useCallback((line: string) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }

    cells.push(current.trim());
    return cells;
  }, []);

  const convert = useCallback(() => {
    try {
      setError(null);

      if (mode === "csv-to-json") {
        const lines = input.split(/\r?\n/).filter((line) => line.trim());
        const [headerLine, ...rows] = lines;
        if (!headerLine) {
          setOutput("[]");
          return;
        }

        const headers = parseCsvLine(headerLine);
        const items = rows.map((row) => {
          const values = parseCsvLine(row);
          return headers.reduce<Record<string, string>>((acc, header, index) => {
            acc[header] = values[index] ?? "";
            return acc;
          }, {});
        });

        setOutput(JSON.stringify(items, null, 2));
        return;
      }

      const records = JSON.parse(input) as Array<Record<string, unknown>>;
      if (!Array.isArray(records)) {
        throw new Error("Expected an array of objects.");
      }

      const headers = Array.from(
        new Set(records.flatMap((record) => Object.keys(record ?? {}))),
      );
      const csv = [
        headers.join(","),
        ...records.map((record) =>
          headers
            .map((header) => {
              const raw = String(record?.[header] ?? "");
              return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
            })
            .join(","),
        ),
      ].join("\n");

      setOutput(csv);
    } catch (error) {
      setError(getErrorMessage(error));
      setOutput("");
    }
  }, [input, mode, parseCsvLine]);

  useEffect(() => {
    convert();
  }, [convert]);

  return (
    <Section id="csvjson" title="CSV ↔ JSON Studio" desc="Convert flat CSV rows into JSON objects and send object arrays back to CSV." accent="purple" index={16}>
      <div className="mb-4 flex flex-wrap gap-2">
        {([
          ["csv-to-json", "CSV → JSON"],
          ["json-to-csv", "JSON → CSV"],
        ] as const).map(([value, label]) => (
          <motion.button
            key={value}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMode(value);
              setInput(value === "csv-to-json" ? csvSample : jsonSample);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-300 ${
              mode === value
                ? "bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] border border-[var(--accent-purple)]/20"
                : "bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04]"
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea className="tool-input neon-input min-h-[200px] resize-none" value={input} onChange={(event) => setInput(event.target.value)} />
        <textarea className="tool-input min-h-[200px] resize-none bg-black/20" value={output} readOnly />
      </div>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-xs text-red-400 font-[family-name:var(--font-mono)]">
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-4 flex flex-wrap gap-2">
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn-primary tool-btn" onClick={convert}>Convert</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn" onClick={() => copyToClipboard(output)}>Copy Output</motion.button>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 18: HTTP Status Explorer ═══════════════ */
function HTTPStatusExplorer() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return HTTP_STATUSES;
    return HTTP_STATUSES.filter((status) =>
      `${status.code} ${status.label} ${status.category} ${status.note}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  return (
    <Section id="httpstatus" title="HTTP Status Explorer" desc="Search the common response codes you keep half-remembering mid-debug." accent="cyan" index={17}>
      <input
        className="tool-input neon-input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search 404, auth, validation, redirects..."
      />
      <div className="mt-4 grid md:grid-cols-2 gap-3">
        {results.map((status) => (
          <motion.button
            key={status.code}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => copyToClipboard(String(status.code))}
            className="rounded-xl border border-white/[0.05] bg-black/20 p-4 text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-2xl font-bold text-[var(--accent-cyan)] font-[family-name:var(--font-heading)]">{status.code}</div>
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">{status.category}</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-white">{status.label}</div>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">{status.note}</p>
          </motion.button>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 19: Cron Builder ═══════════════ */
function CronBuilder() {
  const [minute, setMinute] = useState("*/15");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  const explanation = useMemo(() => {
    const phrases = [
      minute === "*" ? "every minute" : minute.startsWith("*/") ? `every ${minute.slice(2)} minutes` : `at minute ${minute}`,
      hour === "*" ? "every hour" : `at hour ${hour}`,
      dayOfMonth === "*" ? "every day of the month" : `on day ${dayOfMonth}`,
      month === "*" ? "every month" : `in month ${month}`,
      dayOfWeek === "*" ? "every weekday" : `weekday ${dayOfWeek}`,
    ];
    return phrases.join(" • ");
  }, [dayOfMonth, dayOfWeek, hour, minute, month]);

  return (
    <Section id="cron" title="Cron Builder" desc="Build a five-field cron expression with presets and a plain-English summary." accent="gold" index={18}>
      <div className="flex flex-wrap gap-2 mb-4">
        {CRON_PRESETS.map((preset) => (
          <motion.button
            key={preset.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const [nextMinute, nextHour, nextDayOfMonth, nextMonth, nextDayOfWeek] = preset.value.split(" ");
              setMinute(nextMinute);
              setHour(nextHour);
              setDayOfMonth(nextDayOfMonth);
              setMonth(nextMonth);
              setDayOfWeek(nextDayOfWeek);
            }}
            className="px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[0.65rem] uppercase tracking-[0.18em] text-white/50 font-[family-name:var(--font-mono)]"
            title={preset.detail}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>
      <div className="grid sm:grid-cols-5 gap-3">
        {[
          ["Minute", minute, setMinute, "*/15"],
          ["Hour", hour, setHour, "9"],
          ["Day", dayOfMonth, setDayOfMonth, "*"],
          ["Month", month, setMonth, "*"],
          ["Weekday", dayOfWeek, setDayOfWeek, "1-5"],
        ].map(([label, value, setter, placeholder]) => (
          <div key={label as string}>
            <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">{label as string}</label>
            <input
              className="tool-input neon-input mt-1"
              value={value as string}
              onChange={(event) => (setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)}
              placeholder={placeholder as string}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-white/[0.05] bg-black/20 p-4">
        <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Expression</div>
        <div className="mt-2 text-lg text-[var(--accent-gold)] font-[family-name:var(--font-mono)] break-all">{expression}</div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">{explanation}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn-primary tool-btn" onClick={() => copyToClipboard(expression)}>Copy Cron</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn" onClick={() => copyToClipboard(explanation)}>Copy Summary</motion.button>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 23: Magic 8-Ball ═══════════════ */
function Magic8Ball() {
  const responses = [
    "It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely on it",
    "As I see it yes", "Most likely", "Outlook good", "Yes", "Signs point to yes",
    "Reply hazy try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again",
    "Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"
  ];
  const [result, setResult] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const shake = () => {
    setShaking(true);
    setResult(null);
    setTimeout(() => {
      setResult(responses[Math.floor(Math.random() * responses.length)]);
      setShaking(false);
    }, 1200);
  };
  return (
    <Section id="eightball" title="Magic 8-Ball" desc="Ask a question and shake for answers." accent="purple" index={22}>
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={shaking ? { rotate: [0, -15, 15, -15, 15, 0], y: [0, -10, 0, -10, 0] } : {}}
          transition={{ duration: 1.2 }}
          onClick={shake}
          className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-900 to-black border-4 border-slate-700 flex items-center justify-center cursor-pointer shadow-2xl relative"
        >
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-2 left-4 w-3 h-3 rounded-full bg-blue-300 opacity-60" />
                {result ? (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <p className="text-xs font-bold text-white font-[family-name:var(--font-heading)] text-center px-2">{result}</p>
                  </motion.div>
                ) : (
                  <span className="text-white text-3xl font-bold opacity-40">8</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        <div className="text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-3 font-[family-name:var(--font-mono)]">Ask a yes/no question and click the ball</p>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn" onClick={shake}>
            {shaking ? "Shaking..." : "Shake Ball"}
          </motion.button>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 24: Coin Flip ═══════════════ */
function CoinFlip() {
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [history, setHistory] = useState<Array<"heads" | "tails">>([]);
  const [streak, setStreak] = useState(0);
  const flip = () => {
    setFlipping(true);
    setResult(null);
    setTimeout(() => {
      const newResult = Math.random() > 0.5 ? "heads" : "tails";
      setResult(newResult);
      const newHistory = [newResult, ...history].slice(0, 10) as Array<"heads" | "tails">;
      setHistory(newHistory);
      const newStreak = newHistory[0] === newHistory[1] ? streak + 1 : 1;
      setStreak(newStreak);
      setFlipping(false);
    }, 1000);
  };
  const heads = history.filter(h => h === "heads").length;
  const headsPercent = history.length > 0 ? Math.round((heads / history.length) * 100) : 50;
  return (
    <Section id="coinflip" title="Coin Flip" desc="3D animated coin with streak tracker." accent="gold" index={23}>
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={flipping ? { rotateY: [0, 1800], rotateX: [0, 360] } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ perspective: 1000 }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center cursor-pointer shadow-xl text-3xl font-bold border-4 border-yellow-700"
          onClick={flip}
        >
          {!flipping && result && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-white font-[family-name:var(--font-heading)]">
              {result === "heads" ? "H" : "T"}
            </motion.div>
          )}
        </motion.div>
        <div className="text-center">
          {result && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-bold text-white capitalize mb-2 font-[family-name:var(--font-heading)]">
              {result}!
            </motion.p>
          )}
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn mb-4" onClick={flip}>
            {flipping ? "Flipping..." : "Flip Coin"}
          </motion.button>
        </div>
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>Streak: <span className="text-[var(--accent-gold)] font-bold">{streak}</span></span>
            <span>Last 10: <span className="text-[var(--accent-gold)]">{heads}</span>H / <span className="text-[var(--accent-gold)]">{history.length - heads}</span>T</span>
          </div>
          <div className="flex gap-1 h-6">
            {history.slice(0, 10).map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex-1 rounded ${h === "heads" ? "bg-[var(--accent-cyan)]" : "bg-[var(--accent-purple)]"} relative`} title={h} />
            ))}
          </div>
          {history.length > 0 && (
            <div className="text-xs text-center text-[var(--text-secondary)]">
              Heads: <span className="text-[var(--accent-gold)]">{headsPercent}%</span> | Tails: <span className="text-[var(--accent-gold)]">{100 - headsPercent}%</span>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 25: Dice Roller ═══════════════ */
function DiceRoller() {
  const [numDice, setNumDice] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const roll = () => {
    const newResults = Array.from({ length: numDice }, () => Math.floor(Math.random() * 6) + 1);
    setResults(newResults);
    const sum = newResults.reduce((a, b) => a + b, 0);
    setHistory([sum, ...history].slice(0, 15));
  };
  useEffect(() => {
    roll();
  }, []);
  const sum = results.reduce((a, b) => a + b, 0);
  return (
    <Section id="dice" title="Dice Roller" desc="Roll 1-6 dice with sum and history." accent="cyan" index={24}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 mb-2">
          <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Dice count</label>
          <input type="number" min={1} max={6} value={numDice} onChange={e => setNumDice(+e.target.value || 1)} className="tool-input neon-input w-20 text-center" />
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {results.map((result, i) => (
            <motion.div key={i} initial={{ rotateZ: Math.random() * 360, scale: 0 }} animate={{ rotateZ: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300 }} className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-2xl font-bold border-2 border-red-800 shadow-lg" title={`Die ${i + 1}`}>
              {result}
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <motion.p key={sum} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-3xl font-bold text-[var(--accent-cyan)] font-[family-name:var(--font-heading)] mb-3">
            Total: {sum}
          </motion.p>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn" onClick={roll}>
            Roll Dice
          </motion.button>
        </div>
        {history.length > 0 && (
          <div className="w-full">
            <p className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] mb-2">Roll History:</p>
            <div className="flex gap-1 flex-wrap">
              {history.map((h, i) => (
                <span key={i} className="px-2 py-1 rounded text-xs bg-black/20 border border-white/10 text-[var(--text-secondary)]">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 26: ASCII Art Generator ═══════════════ */
function ASCIIArtGenerator() {
  const [input, setInput] = useState("Hello");
  const BLOCK_CHARS: Record<string, string[]> = {
    A: [" ███ ", "█   █", "█████", "█   █"],
    B: ["████ ", "█   █", "████ ", "█   █", "████ "],
    C: [" ███ ", "█    ", "█    ", " ███ "],
    D: ["████ ", "█   █", "█   █", "████ "],
    E: ["█████", "█    ", "███  ", "█    ", "█████"],
    F: ["█████", "█    ", "███  ", "█    ", "█    "],
    G: [" ███ ", "█    ", "█  ██", "█   █", " ███ "],
    H: ["█   █", "█   █", "█████", "█   █", "█   █"],
    I: ["█████", "  █  ", "  █  ", "  █  ", "█████"],
    J: ["█████", "    █", "    █", "█   █", " ███ "],
    K: ["█   █", "█  █ ", "███  ", "█  █ ", "█   █"],
    L: ["█    ", "█    ", "█    ", "█    ", "█████"],
    M: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
    N: ["█   █", "██  █", "█ █ █", "█  ██", "█   █"],
    O: [" ███ ", "█   █", "█   █", "█   █", " ███ "],
    P: ["████ ", "█   █", "████ ", "█    ", "█    "],
    Q: [" ███ ", "█   █", "█   █", "█  ██", " ██ █"],
    R: ["████ ", "█   █", "████ ", "█  █ ", "█   █"],
    S: [" ███ ", "█    ", " ███ ", "    █", " ███ "],
    T: ["█████", "  █  ", "  █  ", "  █  ", "  █  "],
    U: ["█   █", "█   █", "█   █", "█   █", " ███ "],
    V: ["█   █", "█   █", "█   █", " █ █ ", "  █  "],
    W: ["█   █", "█   █", "█ █ █", "██ ██", "█   █"],
    X: ["█   █", " █ █ ", "  █  ", " █ █ ", "█   █"],
    Y: ["█   █", " █ █ ", "  █  ", "  █  ", "  █  "],
    Z: ["█████", "    █", "  █  ", " █   ", "█████"],
    "0": [" ███ ", "█   █", "█   █", "█   █", " ███ "],
    "1": ["  █  ", " ██  ", "  █  ", "  █  ", " ███ "],
    "2": [" ███ ", "█   █", "    █", "  █  ", "█████"],
    "3": [" ███ ", "█   █", "   █ ", "█   █", " ███ "],
    "4": ["█   █", "█   █", "█████", "    █", "    █"],
    "5": ["█████", "█    ", "████ ", "    █", "████ "],
    "6": [" ███ ", "█    ", "████ ", "█   █", " ███ "],
    "7": ["█████", "    █", "   █ ", "  █  ", " █   "],
    "8": [" ███ ", "█   █", " ███ ", "█   █", " ███ "],
    "9": [" ███ ", "█   █", " ████", "    █", " ███ "],
    " ": ["     ", "     ", "     ", "     ", "     "],
  };
  const output = input.toUpperCase().split("").map(c => BLOCK_CHARS[c] || BLOCK_CHARS[" "]);
  const lines = Array.from({ length: 5 }, (_, row) => output.map(col => col[row]).join(" ")).join("\n");
  return (
    <Section id="ascii" title="ASCII Art Generator" desc="Convert text to large ASCII block letters." accent="purple" index={25}>
      <input className="tool-input neon-input mb-4" value={input} onChange={e => setInput(e.target.value.slice(0, 8))} placeholder="Type text (max 8 chars)..." />
      <motion.pre className="bg-black/20 border border-white/[0.04] p-4 rounded-lg overflow-x-auto text-xs font-[family-name:var(--font-mono)] text-[var(--accent-cyan)] mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {lines}
      </motion.pre>
      <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn" onClick={() => copyToClipboard(lines)}>
        Copy ASCII
      </motion.button>
    </Section>
  );
}

/* ═══════════════ TOOL 27: Color Guessing Game ═══════════════ */
function ColorGuessingGame() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [colors, setColors] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong" | null; shake?: boolean }>({ type: null });
  const [shaking, setShaking] = useState(false);

  const generateRound = useCallback(() => {
    const diffRange = [80, 60, 40, 20][Math.min(difficulty, 3)];
    const baseHue = Math.floor(Math.random() * 360);
    const targetColor = `hsl(${baseHue}, 100%, 50%)`;
    const shuffledColors = [
      targetColor,
      `hsl(${(baseHue + diffRange) % 360}, 100%, 50%)`,
      `hsl(${(baseHue - diffRange) % 360}, 100%, 50%)`,
    ].sort(() => Math.random() - 0.5);
    setColors(shuffledColors);
    setTarget(targetColor);
    setFeedback({ type: null });
    setShaking(false);
  }, [difficulty]);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handleGuess = (color: string) => {
    if (color === target) {
      setScore(score + 1);
      setStreak(streak + 1);
      setFeedback({ type: "correct" });
      setTimeout(() => {
        setDifficulty(Math.min(difficulty + 1, 3));
        generateRound();
      }, 800);
    } else {
      setFeedback({ type: "wrong", shake: true });
      setStreak(0);
      setShaking(true);
      setTimeout(() => {
        generateRound();
        setShaking(false);
      }, 1000);
    }
  };

  return (
    <Section id="colorgame" title="Color Guessing Game" desc="Match the hex color with one of three squares." accent="gold" index={26}>
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] mb-2">Match this color:</p>
          <motion.div animate={shaking ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.4 }} className="w-24 h-24 rounded-lg border-2 border-white/20" style={{ background: target }} />
        </div>

        <motion.div className="grid grid-cols-3 gap-4 w-full max-w-xs" animate={shaking ? { x: [-5, 5, -5, 0] } : {}}>
          {colors.map((color, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleGuess(color)}
              className="h-20 rounded-lg border-2 border-white/20 transition-all hover:border-white/40"
              style={{ background: color }}
              disabled={feedback.type !== null}
            />
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {feedback.type === "correct" && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="text-center px-4 py-2 bg-green-400/20 border border-green-400/40 rounded-lg"
            >
              <p className="text-green-400 font-bold text-sm font-[family-name:var(--font-heading)]">Correct!</p>
            </motion.div>
          )}
          {feedback.type === "wrong" && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="text-center px-4 py-2 bg-red-400/20 border border-red-400/40 rounded-lg"
            >
              <p className="text-red-400 font-bold text-sm font-[family-name:var(--font-heading)]">Wrong!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6 text-center w-full">
          <div className="flex-1">
            <div className="text-2xl font-bold text-[var(--accent-gold)] font-[family-name:var(--font-heading)]">{score}</div>
            <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Score</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-[var(--accent-cyan)] font-[family-name:var(--font-heading)]">{streak}</div>
            <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Streak</div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-[var(--accent-purple)] font-[family-name:var(--font-heading)]">{difficulty + 1}</div>
            <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Level</div>
          </div>
        </div>
      </div>
    </Section>
  );
}
