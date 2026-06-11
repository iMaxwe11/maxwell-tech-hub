"use client";
// Shared scaffolding for the tools suite: section chrome, share links, ambient FX.
// Extracted from the former ToolSuite.tsx monolith.

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Share2 } from "lucide-react";
import { copyToClipboard, toast } from "@/lib/toast";
import { NAV_IDS, type ToolId } from "./tool-config";

export function readHashPrefill(): { id: string; value: string } | null {
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

export function prefillFor(toolId: string): string | null {
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

export async function shareLink(toolId: string, value: string) {
  const url = buildShareUrl(toolId, value);
  if (!url) { toast("Share link failed — nothing to encode", "error"); return; }
  // Keep the hash in sync with the shared payload so a quick reload still works.
  try { window.history.replaceState(null, "", url); } catch {}
  await copyToClipboard(url, "Share link copied");
}

/* Small reusable share button rendered inside tool sections. */

export function ShareButton({ toolId, value }: { toolId: string; value: string }) {
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

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function SpotlightCursor() {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 80, damping: 25 }); const sy = useSpring(y, { stiffness: 80, damping: 25 });
  useEffect(() => { const h = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); }; window.addEventListener("mousemove", h); return () => window.removeEventListener("mousemove", h); }, [x, y]);
  return <motion.div className="spotlight-cursor" style={{ left: sx, top: sy }} />;
}

export function ToolsParticles() {
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

export function AnimIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null); const inView = useInView(ref, { once: true, margin: "-60px" });
  return (<motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>{children}</motion.div>);
}

export function Section({ id, title, desc, children, accent = "cyan", index = 0 }: SectionProps) {
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

export function ToolCountBadge() {
  const [count, setCount] = useState(0); const ref = useRef(null); const inView = useInView(ref, { once: true });
  useEffect(() => { if (!inView) return; let i = 0; const iv = setInterval(() => { i++; setCount(i); if (i >= NAV_IDS.length) clearInterval(iv); }, 60); return () => clearInterval(iv); }, [inView]);
  return (
    <motion.div ref={ref} initial={{ scale: 0.8, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}} transition={{ type: "spring", stiffness: 300 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/15">
      <motion.span key={count} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--accent-cyan)]">{count}</motion.span>
      <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider">tools</span>
    </motion.div>
  );
}

export function MatrixRain({ active }: { active: boolean }) {
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

/** Loading placeholder while a tool's chunk streams in. */
export function ToolSkeleton() {
  return (
    <div className="glass-card p-6 sm:p-8 animate-pulse">
      <div className="h-4 w-44 bg-white/10 rounded mb-3" />
      <div className="h-3 w-72 max-w-full bg-white/5 rounded mb-6" />
      <div className="h-40 rounded-xl bg-white/[0.03] border border-white/[0.05]" />
    </div>
  );
}
