"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";

/* ── Floating Particles (client-only to prevent hydration mismatch) ── */
function Particles() {
  const [ps, setPs] = useState<Array<{l:string;w:string;h:string;bg:string;dur:string;del:string}>>([]);
  useEffect(() => {
    setPs(Array.from({ length: 15 }, (_, i) => ({
      l: `${Math.random()*100}%`, w: `${Math.random()*2+1}px`, h: `${Math.random()*2+1}px`,
      bg: i%2===0 ? 'var(--accent-cyan)' : 'var(--accent-purple)',
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

const LINKS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "mnixon112@outlook.com",
    href: "mailto:mnixon112@outlook.com",
    accent: "cyan",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    label: "github.com/iMaxwe11",
    href: "https://github.com/iMaxwe11",
    accent: "purple",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Southampton, NJ",
    href: "#",
    accent: "gold",
  },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  return (
    <div className="min-h-screen bg-[#050505] relative">
      <Particles />

      {/* Aurora */}
      <div className="aurora-bg">
        <div className="aurora-band" />
        <div className="aurora-band" />
      </div>

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
              contact
            </span>
          </Link>
          <div className="hidden sm:flex gap-4">
            {[{ href: "/tools", label: "Tools" }, { href: "/terminal", label: "Terminal" }, { href: "/security", label: "Security" }].map((l) => (
              <Link key={l.href} href={l.href}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors font-[family-name:var(--font-mono)] uppercase tracking-wider glow-underline">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.nav>

      <main className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <AnimIn>
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)]" />
              <span className="text-sm font-[family-name:var(--font-mono)] text-[var(--accent-cyan)]">❯ contact</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold"
            >
              Let&apos;s <span className="gradient-text">Connect</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto"
            >
              Got a project idea, collaboration, or just want to say hi? Reach out anytime.
            </motion.p>
          </div>
        </AnimIn>

        {/* Contact Links */}
        <AnimIn delay={0.1}>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {LINKS.map((l, i) => {
              const accentColors: Record<string, string> = {
                cyan: "var(--accent-cyan)",
                purple: "var(--accent-purple)",
                gold: "var(--accent-gold)",
              };
              const color = accentColors[l.accent] || accentColors.cyan;
              return (
                <motion.a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 300 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass-card flex items-center gap-3 px-5 py-4 group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      color: color,
                    }}
                  >
                    {l.icon}
                  </motion.div>
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-mono)]">
                    {l.label}
                  </span>
                </motion.a>
              );
            })}
          </div>
        </AnimIn>

        {/* Contact Form */}
        <AnimIn delay={0.2}>
          <div className="glass-card p-8 shimmer-sweep">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 flex items-center justify-center mx-auto mb-6"
                  >
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2"
                    >
                      <motion.path d="M20 6L9 17l-5-5" />
                    </motion.svg>
                  </motion.div>
                  <h3 className="text-xl font-semibold font-[family-name:var(--font-heading)]">Message Sent!</h3>
                  <p className="text-[var(--text-secondary)] mt-2">I&apos;ll get back to you as soon as I can.</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSent(false)}
                    className="mt-6 tool-btn text-sm"
                  >
                    Send another
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSending(true);
                    setError(null);
                    try {
                      const res = await fetch("/api/contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data?.error || "Failed to send");
                      setSent(true);
                    } catch (err: any) {
                      setError(err.message || "Something went wrong. Try again.");
                    } finally {
                      setSending(false);
                    }
                  }}
                  className="space-y-5"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: "name", label: "Name", type: "text", placeholder: "Your name" },
                      { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1.5 block">
                          {field.label}
                        </label>
                        <motion.input
                          required
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                          onFocus={() => setFocused(field.name)}
                          onBlur={() => setFocused(null)}
                          animate={{
                            borderColor: focused === field.name ? "rgba(0, 229, 255, 0.4)" : "rgba(255,255,255,0.06)",
                            boxShadow: focused === field.name ? "0 0 0 3px rgba(0, 229, 255, 0.06), 0 0 20px rgba(0, 229, 255, 0.06)" : "none",
                          }}
                          className="w-full bg-black/30 border border-white/[0.06] rounded-xl px-4 py-3 outline-none text-[var(--text-primary)] font-[family-name:var(--font-mono)] text-sm transition-all placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1.5 block">
                      Message
                    </label>
                    <motion.textarea
                      required
                      rows={5}
                      placeholder="Tell me about your project or idea..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      onFocus={() => setFocused("message")}
                      onBlur={() => setFocused(null)}
                      animate={{
                        borderColor: focused === "message" ? "rgba(0, 229, 255, 0.4)" : "rgba(255,255,255,0.06)",
                        boxShadow: focused === "message" ? "0 0 0 3px rgba(0, 229, 255, 0.06), 0 0 20px rgba(0, 229, 255, 0.06)" : "none",
                      }}
                      className="w-full bg-black/30 border border-white/[0.06] rounded-xl px-4 py-3 outline-none text-[var(--text-primary)] font-[family-name:var(--font-mono)] text-sm resize-none transition-all placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm font-[family-name:var(--font-mono)] flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      {error}
                    </motion.div>
                  )}
                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="glow-btn glow-btn-filled group w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="group-hover:translate-x-1 transition-transform">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    <span>{sending ? "Sending..." : "Send Message"}</span>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </AnimIn>
      </main>
    </div>
  );
}
