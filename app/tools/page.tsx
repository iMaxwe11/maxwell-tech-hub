"use client";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

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
function Section({ id, title, desc, children, accent = "cyan", index = 0 }: any) {
  const colors: Record<string, string> = { cyan: "var(--accent-cyan)", purple: "var(--accent-purple)", gold: "var(--accent-gold)" };
  const ref = useRef<HTMLElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return; const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--tool-x', `${((e.clientX-rect.left)/rect.width)*100}%`);
    ref.current.style.setProperty('--tool-y', `${((e.clientY-rect.top)/rect.height)*100}%`);
  }, []);
  return (
    <AnimIn delay={index * 0.05}>
      <section ref={ref} id={id} onMouseMove={handleMouseMove} className="tool-section group shimmer-sweep breathe-border">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0, rotate: -90 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index*0.05, type: "spring", stiffness: 300 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-[family-name:var(--font-mono)]"
              style={{ background: `${colors[accent]||colors.cyan}15`, border: `1px solid ${colors[accent]||colors.cyan}30`, color: colors[accent]||colors.cyan }}>
              {String(index + 1).padStart(2, "0")}
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
  useEffect(() => { if (!inView) return; let i = 0; const iv = setInterval(() => { i++; setCount(i); if (i >= 22) clearInterval(iv); }, 60); return () => clearInterval(iv); }, [inView]);
  return (
    <motion.div ref={ref} initial={{ scale: 0.8, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}} transition={{ type: "spring", stiffness: 300 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/15">
      <motion.span key={count} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--accent-cyan)]">{count}</motion.span>
      <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">tools</span>
    </motion.div>
  );
}

const NAV_IDS = ["palette","markdown","inspo","json","regex","timestamp","contrast","generator","base64","url","lorem","hash","wordcount","cssunit","qrcode","jwt","pomodoro","ipinfo","diff","baseconv","gradient","password"];

/* ═══════════════ TOOL 15: QR Code Generator ═══════════════ */
function QRCodeGenerator() {
  const [text, setText] = useState("https://maxwellnixon.com");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || !text) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const size = 200;
    canvas.width = size; canvas.height = size;
    // Simple QR using a free API as image source
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => { ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,size,size); ctx.drawImage(img, 0, 0, size, size); };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=0a0a0a&color=06b6d4`;
  }, [text]);
  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement("a"); a.download = "qrcode.png";
    a.href = canvas.toDataURL("image/png"); a.click();
  };
  return (
    <Section id="qrcode" title="QR Code Generator" desc="Generate downloadable QR codes from any text or URL." accent="cyan" index={14}>
      <input className="tool-input neon-input mb-4" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter URL or text..." />
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <canvas ref={canvasRef} className="rounded-lg" style={{ width: 180, height: 180 }} />
        </div>
        <div className="space-y-3">
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn-primary tool-btn" onClick={download}>Download PNG</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="tool-btn" onClick={() => navigator.clipboard.writeText(text)}>Copy Text</motion.button>
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
    <Section id="jwt" title="JWT Decoder" desc="Decode and inspect JSON Web Tokens." accent="purple" index={15}>
      <textarea className="tool-input neon-input min-h-[80px] resize-none mb-4 text-xs break-all" value={jwt} onChange={(e) => setJwt(e.target.value)} placeholder="Paste a JWT token..." />
      {decoded ? (
        <div className="space-y-3">
          {(["header", "payload"] as const).map((section) => (
            <div key={section} className="rounded-lg bg-black/20 border border-white/[0.04] p-3 cursor-pointer group" onClick={() => navigator.clipboard.writeText(JSON.stringify(decoded[section], null, 2))}>
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
  const [mode, setMode] = useState<"work"|"break">("work");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false);
            if (mode === "work") { setSessions(p => p + 1); setMode("break"); return 5 * 60; }
            else { setMode("work"); return 25 * 60; }
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);
  const reset = () => { setRunning(false); setMode("work"); setSeconds(25*60); };
  const mins = Math.floor(seconds/60); const secs = seconds%60;
  const pct = mode === "work" ? ((25*60 - seconds) / (25*60)) * 100 : ((5*60 - seconds) / (5*60)) * 100;
  return (
    <Section id="pomodoro" title="Pomodoro Timer" desc="Focus timer with work/break cycles." accent="gold" index={16}>
      <div className="flex flex-col items-center">
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
        <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Sessions completed: <span className="text-[var(--accent-gold)]">{sessions}</span></div>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 18: IP Address Info ═══════════════ */
function IPInfo() {
  const [info, setInfo] = useState<any>(null); const [loading, setLoading] = useState(true);
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
            <motion.div key={label} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] cursor-pointer group" onClick={() => navigator.clipboard.writeText(String(val))}>
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
            <motion.div key={label} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] text-center cursor-pointer group" onClick={() => navigator.clipboard.writeText(val)}>
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
      <div className="rounded-lg bg-black/20 border border-white/[0.04] p-3 flex items-center justify-between group cursor-pointer" onClick={() => navigator.clipboard.writeText(css)}>
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
    const color = pw.length === 0 ? "white/20" : score <= 2 ? "red-400" : score <= 4 ? "yellow-400" : score <= 5 ? "green-400" : "cyan-400";
    // Entropy estimate
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/\d/.test(pw)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pw)) pool += 32;
    const entropy = pw.length > 0 ? Math.round(pw.length * Math.log2(pool || 1)) : 0;
    return { checks, score, strength, color, entropy };
  }, [pw]);
  return (
    <Section id="password" title="Password Strength" desc="Test password strength and get security tips." accent="gold" index={21}>
      <input type="text" className="tool-input neon-input mb-4" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter a password to test..." autoComplete="off" />
      {pw.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(analysis.score / 7) * 100}%` }} className={`h-full rounded-full bg-${analysis.color}`} />
            </div>
            <span className={`text-sm font-bold font-[family-name:var(--font-mono)] text-${analysis.color}`}>{analysis.strength}</span>
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
   CATEGORIES
   ═══════════════════════════════════════════ */
const TOOL_META: Record<string, { cat: string; keywords: string }> = {
  palette: { cat: "Design", keywords: "color palette hsl css design" },
  markdown: { cat: "Text", keywords: "markdown preview convert text" },
  inspo: { cat: "Fun", keywords: "inspiration quote random motivational" },
  json: { cat: "Code", keywords: "json format validate pretty print" },
  regex: { cat: "Code", keywords: "regex regular expression test match" },
  timestamp: { cat: "Convert", keywords: "timestamp unix date time convert" },
  contrast: { cat: "Design", keywords: "contrast wcag accessibility color" },
  generator: { cat: "Code", keywords: "uuid generate random id" },
  base64: { cat: "Encode", keywords: "base64 encode decode binary text" },
  url: { cat: "Encode", keywords: "url encode decode uri component" },
  lorem: { cat: "Text", keywords: "lorem ipsum placeholder dummy text" },
  hash: { cat: "Encode", keywords: "hash md5 sha1 sha256 digest" },
  wordcount: { cat: "Text", keywords: "word count character line text" },
  cssunit: { cat: "Design", keywords: "css unit convert px rem em vh" },
  qrcode: { cat: "Fun", keywords: "qr code generate scan url" },
  jwt: { cat: "Code", keywords: "jwt json web token decode header" },
  pomodoro: { cat: "Fun", keywords: "pomodoro timer focus productivity" },
  ipinfo: { cat: "Convert", keywords: "ip address geolocation info lookup" },
  diff: { cat: "Code", keywords: "diff compare text changes check" },
  baseconv: { cat: "Convert", keywords: "base convert binary hex octal decimal" },
  gradient: { cat: "Design", keywords: "gradient css color generate linear" },
  password: { cat: "Encode", keywords: "password strength test secure checker" },
};
const CATEGORIES = ["All", "Code", "Encode", "Design", "Text", "Convert", "Fun"];
const CAT_COLORS: Record<string, string> = { All: "#06b6d4", Code: "#a855f7", Encode: "#f59e0b", Design: "#ec4899", Text: "#10b981", Convert: "#3b82f6", Fun: "#ef4444" };

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

/* ═══════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════ */
export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [hackerMode, setHackerMode] = useState(false);
  const [toolUses, setToolUses] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Track tool interaction (scroll into view = "use")
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setToolUses(p => p + 1); });
    }, { threshold: 0.5 });
    NAV_IDS.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const filteredIds = NAV_IDS.filter(id => {
    const meta = TOOL_META[id];
    if (!meta) return true;
    if (activeCat !== "All" && meta.cat !== activeCat) return false;
    if (search && !meta.keywords.includes(search.toLowerCase()) && !id.includes(search.toLowerCase())) return false;
    return true;
  });

  const luckyTool = () => {
    const id = NAV_IDS[Math.floor(Math.random() * NAV_IDS.length)];
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Map of ID -> component
  const TOOL_COMPONENTS: Record<string, React.ReactNode> = {
    palette: <Palette key="palette" />, markdown: <MarkdownPreview key="markdown" />, inspo: <Inspiration key="inspo" />,
    json: <JSONFormatter key="json" />, regex: <RegexTester key="regex" />, timestamp: <TimestampConverter key="timestamp" />,
    contrast: <ContrastChecker key="contrast" />, generator: <GeneratorKit key="generator" />, base64: <Base64Tool key="base64" />,
    url: <URLTool key="url" />, lorem: <LoremIpsum key="lorem" />, hash: <HashGenerator key="hash" />,
    wordcount: <WordCounter key="wordcount" />, cssunit: <CSSUnitConverter key="cssunit" />, qrcode: <QRCodeGenerator key="qrcode" />,
    jwt: <JWTDecoder key="jwt" />, pomodoro: <PomodoroTimer key="pomodoro" />, ipinfo: <IPInfo key="ipinfo" />,
    diff: <DiffChecker key="diff" />, baseconv: <BaseConverter key="baseconv" />, gradient: <GradientGenerator key="gradient" />,
    password: <PasswordTester key="password" />,
  };

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
                  {filteredIds.length === 22 ? "22 client-side utilities" : `Showing ${filteredIds.length} of 22 tools`} for encoding, formatting, testing, and generating — zero tracking.
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
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs">&times;</button>}
              </div>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }} onClick={luckyTool}
                  className="tool-btn-primary tool-btn flex items-center gap-1.5 whitespace-nowrap">
                  <span>🎲</span> Feeling Lucky
                </motion.button>
                <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }} onClick={() => setHackerMode(!hackerMode)}
                  className={`tool-btn flex items-center gap-1.5 whitespace-nowrap transition-all ${hackerMode ? "!bg-green-400/10 !border-green-400/30 !text-green-400" : ""}`}>
                  <span>{hackerMode ? "🟢" : "💻"}</span> <span className="hidden sm:inline">{hackerMode ? "Exit Matrix" : "Hacker Mode"}</span>
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
                  {cat} {cat !== "All" && <span className="ml-1 opacity-50">({NAV_IDS.filter(id => TOOL_META[id]?.cat === cat).length})</span>}
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
            filteredIds.map(id => TOOL_COMPONENTS[id])
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
  function copy() { navigator.clipboard.writeText(`hsl(${h} ${s}% ${l}%)`); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return (
    <Section id="palette" title="Color Palette" desc="Generate a quick palette and copy the CSS value." accent="purple" index={0}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <motion.div whileHover={{ scale: 1.05, rotate: 2 }} transition={{ type: "spring", stiffness: 300 }}
          className="w-full sm:w-40 h-24 sm:h-28 rounded-xl border border-white/10 shadow-lg cursor-pointer" style={{ background: color, boxShadow: `0 8px 30px ${color}33` }} onClick={copy} />
        <div className="flex-1 w-full grid sm:grid-cols-3 gap-3 sm:gap-4">
          {[["Hue", h, setH, 360], ["Sat", s, setS, 100], ["Light", l, setL, 100]].map(([label, val, setter, max]: any) => (
            <div key={label}><label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">{label} <span className="text-[var(--accent-cyan)]">{val}</span></label>
              <input type="range" min="0" max={max} value={val} onChange={(e) => setter(+e.target.value)} className="w-full mt-1 accent-[var(--accent-cyan)]" /></div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-sm flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)]">
        <span className="text-[var(--text-muted)]">CSS:</span><code className="text-[var(--accent-cyan)]">hsl({h} {s}% {l}%)</code>
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn-primary tool-btn" onClick={copy}>
          <AnimatePresence mode="wait"><motion.span key={copied?"done":"copy"} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }}>{copied ? "✓ Copied!" : "Copy"}</motion.span></AnimatePresence>
        </motion.button>
      </div>
      <div className="mt-4 flex gap-1 rounded-lg overflow-hidden">
        {[20, 35, 50, 65, 80].map((lt) => (<motion.div key={lt} whileHover={{ scaleY: 1.5 }} className="flex-1 h-6 cursor-pointer transition-transform" style={{ background: `hsl(${h} ${s}% ${lt}%)` }} onClick={() => { setL(lt); copy(); }} />))}
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 2: Markdown Preview ═══════════════ */
function MarkdownPreview() {
  const [text, setText] = useState("# Hello\n\nThis is **live** preview with *italic* support.\n\n## Features\n- Real-time rendering\n- Clean output");
  return (
    <Section id="markdown" title="Markdown Preview" desc="Lightweight headings, bold, italics, lists." accent="cyan" index={1}>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="tool-input neon-input min-h-[200px] sm:min-h-[220px] resize-none" />
        <motion.div layout className="prose prose-invert max-w-none p-4 rounded-xl border border-white/[0.04] bg-black/20 min-h-[200px] overflow-auto text-sm">
          <MDRender text={text} />
        </motion.div>
      </div>
    </Section>
  );
}
function MDRender({ text }: { text: string }) {
  const html = text.replace(/^### (.*$)/gim,"<h3>$1</h3>").replace(/^## (.*$)/gim,"<h2>$1</h2>").replace(/^# (.*$)/gim,"<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim,"<strong>$1</strong>").replace(/\*(.*?)\*/gim,"<em>$1</em>")
    .replace(/^- (.*$)/gim,"<li>$1</li>").replace(/(<li>.*<\/li>)/gims,"<ul>$1</ul>").replace(/\n/g,"<br/>");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
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
  const [input, setInput] = useState('{"hello":"world","arr":[1,2,3]}'); const [space, setSpace] = useState(2);
  const [error, setError] = useState<string|null>(null); const [output, setOutput] = useState("");
  function prettify() { try { setError(null); setOutput(JSON.stringify(JSON.parse(input), null, space)); } catch (e: any) { setError(e.message); setOutput(""); } }
  function minify() { try { setError(null); setOutput(JSON.stringify(JSON.parse(input))); } catch (e: any) { setError(e.message); setOutput(""); } }
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
        <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="tool-btn" onClick={() => navigator.clipboard.writeText(output)}>Copy</motion.button>
      </div>
    </Section>
  );
}

/* ═══════════════ TOOL 5: Regex Tester ═══════════════ */
function RegexTester() {
  const [pattern, setPattern] = useState("\\w+"); const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Try matching multiple words: hello world_123!"); const [error, setError] = useState<string|null>(null);
  const matches = useMemo(() => { try { setError(null); return [...text.matchAll(new RegExp(pattern, flags))].map((x:any) => ({ match: x[0], index: x.index })); } catch (e: any) { setError(e.message); return []; } }, [pattern, flags, text]);
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
        <motion.button whileTap={{ scale:0.9 }} className="tool-btn text-xs" onClick={() => navigator.clipboard.writeText(converted)}>Copy</motion.button>
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
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn whitespace-nowrap" onClick={() => navigator.clipboard.writeText(uuid)}>Copy</motion.button></div>
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2 block">Password ({pwLen} chars)</label>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap"><input className="tool-input neon-input flex-1 min-w-0" readOnly value={pw} />
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn-primary tool-btn whitespace-nowrap" onClick={genPW}>Generate</motion.button>
            <motion.button whileTap={{ scale:0.9 }} className="tool-btn whitespace-nowrap" onClick={() => navigator.clipboard.writeText(pw)}>Copy</motion.button></div>
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
  const [input, setInput] = useState("Hello, World!"); const [output, setOutput] = useState("");
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
      <motion.button whileTap={{ scale:0.9 }} className="tool-btn mt-3" onClick={() => navigator.clipboard.writeText(output)}>Copy Output</motion.button>
    </Section>
  );
}

/* ═══════════════ TOOL 10: URL Encoder/Decoder ═══════════════ */
function URLTool() {
  const [input, setInput] = useState("https://example.com/path?q=hello world&foo=bar baz"); const [output, setOutput] = useState("");
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
      <motion.button whileTap={{ scale:0.9 }} className="tool-btn mt-3" onClick={() => navigator.clipboard.writeText(output)}>Copy Output</motion.button>
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
      <motion.button whileTap={{ scale:0.9 }} className="tool-btn mt-3" onClick={() => navigator.clipboard.writeText(output)}>Copy</motion.button>
    </Section>
  );
}

/* ═══════════════ TOOL 12: Hash Generator ═══════════════ */
function HashGenerator() {
  const [input, setInput] = useState("Hello, World!"); const [hashes, setHashes] = useState<Record<string,string>>({});
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
      <input className="tool-input neon-input mb-4" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text to hash..." />
      <div className="space-y-2">
        {Object.entries(hashes).map(([algo, hash]) => (
          <motion.div key={algo} whileHover={{ scale: 1.01 }} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/[0.04] group cursor-pointer" onClick={() => navigator.clipboard.writeText(hash)}>
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
          <motion.div key={unit} whileHover={{ y: -2, scale: 1.03 }} className="rounded-lg p-3 bg-black/20 border border-white/[0.04] text-center cursor-pointer group" onClick={() => navigator.clipboard.writeText(`${val}${unit}`)}>
            <div className="text-lg font-bold text-[var(--accent-purple)] font-[family-name:var(--font-heading)]">{val}</div>
            <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] mt-0.5">{unit}</div>
            <div className="text-[0.5rem] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1">click to copy</div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
