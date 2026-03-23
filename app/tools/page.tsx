"use client";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";

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
  useEffect(() => { if (!inView) return; let i = 0; const iv = setInterval(() => { i++; setCount(i); if (i >= 14) clearInterval(iv); }, 60); return () => clearInterval(iv); }, [inView]);
  return (
    <motion.div ref={ref} initial={{ scale: 0.8, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}} transition={{ type: "spring", stiffness: 300 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/15">
      <motion.span key={count} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--accent-cyan)]">{count}</motion.span>
      <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">tools</span>
    </motion.div>
  );
}

const NAV_IDS = ["palette","markdown","inspo","json","regex","timestamp","contrast","generator","base64","url","lorem","hash","wordcount","cssunit"];

/* ═══════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════ */
export default function ToolsPage() {
  return (
    <>
      <SpotlightCursor />
      <ToolsParticles />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group">
            <motion.div whileHover={{ x: -3 }} className="text-xs">←</motion.div>
            <span className="text-sm font-[family-name:var(--font-mono)]"><span className="text-[var(--accent-cyan)]">MN</span><span className="text-[var(--text-muted)]"> / </span>tools</span>
          </Link>
          <div className="hidden sm:flex gap-4">
            {[{ href: "/", label: "Home" }, { href: "/contact", label: "Contact" }].map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors font-[family-name:var(--font-mono)] uppercase tracking-wider glow-underline">{l.label}</Link>
            ))}
          </div>
        </div>
      </motion.nav>
      <main className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-[1200px] mx-auto space-y-6 sm:space-y-8 relative z-10">
        <AnimIn>
          <div className="mb-8 sm:mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 mb-4">
              <motion.span animate={{ boxShadow: ["0 0 8px var(--accent-cyan)", "0 0 20px var(--accent-cyan)", "0 0 8px var(--accent-cyan)"] }} transition={{ duration: 2.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
              <span className="text-sm font-[family-name:var(--font-mono)] text-[var(--accent-cyan)]">❯ developer_tools</span>
            </motion.div>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-bold">
                  <span className="text-shimmer">Developer Tools</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-[var(--text-secondary)] max-w-xl text-sm sm:text-base">
                  14 client-side utilities for encoding, formatting, testing, and generating — zero tracking.
                </motion.p>
              </div>
              <ToolCountBadge />
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-6 sm:mt-8 flex flex-wrap gap-2">
              {NAV_IDS.map((id, i) => (
                <motion.a key={id} href={`#${id}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8+i*0.03 }} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }} className="tech-tag text-[0.65rem] cursor-pointer">{id}</motion.a>
              ))}
            </motion.div>
          </div>
        </AnimIn>

        <Palette /><MarkdownPreview /><Inspiration /><JSONFormatter /><RegexTester /><TimestampConverter /><ContrastChecker />
        <GeneratorKit /><Base64Tool /><URLTool /><LoremIpsum /><HashGenerator /><WordCounter /><CSSUnitConverter />

        <AnimIn delay={0.2}>
          <div className="text-center pt-8 pb-4">
            <motion.p whileHover={{ scale: 1.02 }} className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">
              All tools run client-side · No data leaves your browser · <Link href="/" className="text-[var(--accent-cyan)] hover:underline">Back to Hub</Link>
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
