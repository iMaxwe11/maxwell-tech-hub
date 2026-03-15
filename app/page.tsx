"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════
   GROK STARFIELD — Rotating stars + shooting stars
   ═══════════════════════════════════════════ */
function GrokStarfield() {
  const [stars, setStars] = useState<Array<{x:number;y:number;size:number;opacity:number;twinkle:boolean}>>([]);
  const [shootingStar, setShootingStar] = useState<{x:number;y:number;angle:number} | null>(null);
  
  useEffect(() => {
    // Generate 150 stars (mix of static and twinkling)
    setStars(
      Array.from({ length: 150 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5, // 0.5-2.5px
        opacity: Math.random() * 0.5 + 0.3, // 0.3-0.8
        twinkle: Math.random() > 0.6, // 40% twinkle
      }))
    );
    
    // Occasional shooting star (every 8-15 seconds)
    const shootingStarInterval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance
        setShootingStar({
          x: Math.random() * 100,
          y: Math.random() * 40, // Top half of screen
          angle: Math.random() * 30 - 15, // -15° to +15°
        });
        setTimeout(() => setShootingStar(null), 1500);
      }
    }, Math.random() * 7000 + 8000);
    
    return () => clearInterval(shootingStarInterval);
  }, []);
  
  if (stars.length === 0) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background starfield - rotating */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
      >
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
            animate={star.twinkle ? {
              opacity: [star.opacity, star.opacity * 0.3, star.opacity],
              scale: [1, 0.8, 1],
            } : {}}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </motion.div>
      
      {/* Shooting star */}
      {shootingStar && (
        <motion.div
          className="absolute w-[80px] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            left: `${shootingStar.x}%`,
            top: `${shootingStar.y}%`,
            transform: `rotate(${shootingStar.angle}deg)`,
            filter: 'blur(0.5px)',
          }}
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: [0, 1, 0.8, 0], x: 200 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      )}
    </div>
  );
}

/* ── Spotlight Cursor ──────────────────── */
function SpotlightCursor() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 25 });
  const sy = useSpring(y, { stiffness: 60, damping: 25 });
  useEffect(() => {
    const handler = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [x, y]);
  return <motion.div className="spotlight-cursor" style={{ left: sx, top: sy }} />;
}

/* ── Animated Section Wrapper ──────────── */
function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}>
      {children}
    </motion.section>
  );
}

/* ── Navbar ─────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { href: "/tools", label: "Tools" },
    { href: "/terminal", label: "Terminal" },
    { href: "/security", label: "Security" },
    { href: "/contact", label: "Contact" },
  ];
  return (
    <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? "bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.04]" : "bg-transparent"}`}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center">
              <span className="text-xs font-bold font-[family-name:var(--font-heading)] gradient-text">M</span>
            </div>
          </div>
          <span className="text-sm font-medium tracking-wide text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-500 hidden sm:inline">
            maxwellnixon<span className="text-[var(--accent-cyan)]">.</span>com
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}
              className="px-4 py-2 text-[0.8rem] font-medium tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-400 font-[family-name:var(--font-mono)] glow-underline">
              {link.label}
            </Link>
          ))}
          <div className="ml-3 h-4 w-px bg-white/[0.06]" />
          <a href="https://github.com/iMaxwe11" target="_blank" rel="noopener noreferrer"
            className="ml-3 px-4 py-2 text-[0.8rem] text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors duration-400" aria-label="GitHub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[var(--text-secondary)]" aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.04]">
            <div className="px-6 py-4 flex flex-col gap-2">
              {links.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}>
                  <Link href={link.href} onClick={() => setMobileOpen(false)}
                    className="py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-mono)] block">
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ── Hero Section ──────────────────────── */
function HeroSection() {
  const [time, setTime] = useState("");
  const [headerMode, setHeaderMode] = useState<"static" | "shimmer" | "rgb" | "custom">("static");
  const [customColor, setCustomColor] = useState("#00e5ff");
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -60]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.96]);

  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "America/New_York" }).format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="mesh-gradient-hero" />
      <div className="absolute inset-0 grid-bg opacity-40" />
      <motion.div style={{ opacity: heroOpacity, y: heroY, scale: heroScale }} className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="flex items-center gap-4 mb-8 sm:mb-10">
          <motion.span animate={{ boxShadow: ["0 0 8px var(--accent-cyan)", "0 0 20px var(--accent-cyan)", "0 0 8px var(--accent-cyan)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] }} className="status-dot" />
          <span className="terminal-prompt font-[family-name:var(--font-mono)] text-xs sm:text-sm">
            {time ? `EST ${time}` : "loading..."}<span className="text-[var(--text-muted)] mx-2">·</span>Southampton, NJ
          </span>
        </motion.div>
        <div className="space-y-2">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-[family-name:var(--font-heading)] text-[clamp(2.2rem,8vw,6rem)] font-bold leading-[0.95] tracking-tight"
            style={headerMode === "custom" ? { "--header-color": customColor } as React.CSSProperties : undefined}>
            <span className={headerMode === "rgb" ? "rgb-sweep" : headerMode === "custom" ? "custom-color-sweep" : headerMode === "shimmer" ? "text-shimmer" : "text-static"}>Maxwell Nixon</span>
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}
            className="flex items-center gap-2 flex-wrap mt-3">
            {([{ key: "shimmer" as const, label: "Sweep" }, { key: "rgb" as const, label: "RGB" }, { key: "custom" as const, label: "Pick" }]).map((m) => (
              <motion.button key={m.key} whileTap={{ scale: 0.92 }} onClick={() => setHeaderMode((prev) => prev === m.key ? "static" : m.key)}
                className={`px-3 py-1.5 rounded-lg text-[0.65rem] font-medium font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-700 ${headerMode === m.key ? "bg-white/[0.10] text-[var(--text-primary)] border border-white/[0.20] shadow-[0_0_12px_rgba(0,229,255,0.06)]" : "bg-white/[0.04] text-[var(--text-secondary)] border border-white/[0.08] hover:bg-white/[0.07] hover:text-[var(--text-primary)] hover:border-white/[0.14]"}`}>
                {m.label}
              </motion.button>
            ))}
            <AnimatePresence>
              {headerMode === "custom" && (
                <motion.div initial={{ opacity: 0, scale: 0.8, width: 0 }} animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.8, width: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
                  <div className="color-picker-btn" style={{ background: customColor }}>
                    <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} title="Pick header color" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-[family-name:var(--font-heading)] text-[clamp(1.8rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-[var(--text-muted)]">
            Engineer<span className="gradient-text"> · </span>Designer<span className="gradient-text"> · </span>Builder
          </motion.div>
        </div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-8 max-w-xl text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
          Full-stack architect building at the intersection of code, design, and intelligence systems. Crafting premium software, tools, and experiments.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }} className="mt-10 flex flex-wrap gap-4">
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 180, damping: 15 }}>
            <Link href="/tools" className="glow-btn glow-btn-filled">
              <span>Explore Tools</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 180, damping: 15 }}>
            <Link href="/terminal" className="glow-btn">
              <span>Open Terminal</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 17l6-5-6-5M12 19h8"/></svg>
            </Link>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 sm:bottom-12 left-4 sm:left-6 flex items-center gap-3">
          <motion.div animate={{ scaleY: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-px h-12 bg-gradient-to-b from-transparent via-[var(--accent-cyan)] to-transparent opacity-30" />
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-mono)]">Scroll</span>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── About Section ─────────────────────── */
function AboutSection() {
  return (
    <AnimatedSection className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-[1fr_2fr] gap-10 md:gap-16 items-start">
        <div>
          <span className="terminal-prompt font-[family-name:var(--font-mono)] text-sm">about</span>
          <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-4 h-px bg-gradient-to-r from-[var(--accent-cyan)] to-transparent opacity-40" />
        </div>
        <div className="space-y-6">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            Building bridges between <span className="gradient-text">code, design,</span> and <span className="gradient-text-warm">curiosity.</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed max-w-2xl">
            I&apos;m a full-stack architect and product designer crafting premium software experiences. From intelligence middleware and authentication systems to dark-luxury interfaces — I build things that feel as good as they work.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            When I&apos;m not shipping code, you&apos;ll find me deep in sim racing setups, tinkering with smart home automation, or extracting custom audio for game mods. This hub is my living interface — a place for tools, experiments, and everything in between.
          </p>
          <div className="pt-6 flex flex-wrap gap-6 sm:gap-8">
            {[{ value: "Full-Stack", label: "Architecture" }, { value: "React · Node", label: "Primary Stack" }, { value: "Dark Luxury", label: "Design Language" }].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }} whileHover={{ y: -3 }}>
                <div className="text-sm font-semibold text-[var(--text-primary)] font-[family-name:var(--font-mono)]">{stat.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ── Projects Section ──────────────────── */
const projects = [
  { title: "Developer Tools", description: "14 tools: JSON formatter, Regex tester, Base64/URL encoder, color palette, hash generator, word counter, lorem ipsum, and more.", href: "/tools", tags: ["Utilities", "Encode/Decode", "Validation"], icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>, accent: "cyan" },
  { title: "Live Terminal", description: "Interactive browser terminal with boot sequence, matrix rain, CRT effects, and a hacker-friendly aesthetic.", href: "/terminal", tags: ["Interactive", "CLI", "CRT Effects"], icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 17l6-5-6-5M12 19h8"/></svg>, accent: "purple" },
  { title: "Security Scanner", description: "Upload files or paste hashes for real-time VirusTotal analysis. Threat ring visualization and detailed breakdowns.", href: "/security", tags: ["VirusTotal", "Analysis", "Protection"], icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, accent: "gold" },
  { title: "AI Chat Assistant", description: "Context-aware chatbot with local knowledge base and optional OpenAI integration.", href: "/#chat", tags: ["AI", "NLP", "Knowledge Base"], icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, accent: "cyan" },
  { title: "Music Hub", description: "Curated chill and ambient royalty-free playlists. Perfect coding background vibes — no copyright issues.", href: "/#music", tags: ["Ambient", "Chill", "Royalty-Free"], icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>, accent: "purple" },
  { title: "Ouija Platform", description: "Full-stack SaaS with auth, payments, and premium dark-luxury UI. React + Node.js + Gleam monorepo.", href: "https://www.ouija.one", tags: ["SaaS", "Monorepo", "Premium"], icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>, accent: "gold" },
];

function ProjectCard({ project, index }: { project: (typeof projects)[0]; index: number }) {
  const accentColors: Record<string, string> = { cyan: "group-hover:border-[rgba(0,229,255,0.15)] group-hover:shadow-[0_0_40px_rgba(0,229,255,0.04)]", purple: "group-hover:border-[rgba(168,85,247,0.15)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.04)]", gold: "group-hover:border-[rgba(245,166,35,0.15)] group-hover:shadow-[0_0_40px_rgba(245,166,35,0.04)]" };
  const iconColors: Record<string, string> = { cyan: "text-[var(--accent-cyan)]", purple: "text-[var(--accent-purple)]", gold: "text-[var(--accent-gold)]" };
  const isExternal = project.href.startsWith("http");
  const Wrapper = isExternal ? "a" : Link;
  const extraProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <AnimatedSection delay={index * 0.08}>
      <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 180, damping: 18 }}>
        <Wrapper href={project.href} {...(extraProps as any)} className={`group block glass-card p-6 sm:p-7 h-full shimmer-sweep ${accentColors[project.accent] || ""}`}>
          <motion.div initial={{ scale: 0, rotate: -90 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 250 }}
            className={`mb-5 ${iconColors[project.accent] || ""} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}>
            {project.icon}
          </motion.div>
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold mb-2 group-hover:text-white transition-colors duration-400">{project.title}</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (<span key={tag} className="tech-tag text-[0.65rem]">{tag}</span>))}
          </div>
          <div className="mt-5 flex items-center gap-2 text-[0.75rem] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors font-[family-name:var(--font-mono)]">
            <span>{isExternal ? "Visit" : "Open"}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform duration-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </Wrapper>
      </motion.div>
    </AnimatedSection>
  );
}

function ProjectsSection() {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6">
      <AnimatedSection className="max-w-[1200px] mx-auto mb-12 sm:mb-16">
        <span className="terminal-prompt font-[family-name:var(--font-mono)] text-sm">projects</span>
        <h2 className="mt-4 font-[family-name:var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-bold">What I&apos;ve been <span className="gradient-text">building.</span></h2>
      </AnimatedSection>
      <div className="max-w-[1200px] mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {projects.map((project, i) => (<ProjectCard key={project.title} project={project} index={i} />))}
      </div>
    </section>
  );
}

/* ── Tech Stack Section ────────────────── */
const stack = ["TypeScript", "React", "Next.js", "Node.js", "Gleam", "Tailwind CSS", "Framer Motion", "PostgreSQL", "Docker", "Vercel", "Cloudflare", "Home Assistant", "Plex", "Tauri", "Python", "Git"];

function StackSection() {
  return (
    <AnimatedSection className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-[1fr_2fr] gap-10 md:gap-16 items-start">
        <div>
          <span className="terminal-prompt font-[family-name:var(--font-mono)] text-sm">stack</span>
          <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-4 h-px bg-gradient-to-r from-[var(--accent-purple)] to-transparent opacity-40" />
          <p className="mt-6 text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">Technologies and platforms I work with daily. Always evolving, always shipping.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {stack.map((tech, i) => (
            <motion.span key={tech} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ scale: 1.1, y: -3, boxShadow: "0 0 20px rgba(0,229,255,0.1)" }}
              className="tech-tag cursor-default">{tech}</motion.span>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ── Music Section — Royalty-Free Overhaul ─ */
const MUSIC_MODES = [
  { key: "chill" as const, label: "Chill Vibes", color: "var(--accent-cyan)" },
  { key: "lofi" as const, label: "Lo-Fi Focus", color: "var(--accent-purple)" },
  { key: "ambient" as const, label: "Ambient", color: "var(--accent-gold)" },
] as const;

function MusicSection() {
  const [mode, setMode] = useState<"chill" | "lofi" | "ambient">("chill");

  const embeds: Record<string, React.ReactNode> = {
    chill: (
      <iframe width="100%" height="352" style={{ borderRadius: 10 }}
        src="https://www.youtube.com/embed/videoseries?list=PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo&autoplay=0"
        title="Chill Vibes — Royalty Free" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" loading="lazy" />
    ),
    lofi: (
      <iframe width="100%" height="352" style={{ borderRadius: 10 }}
        src="https://www.youtube.com/embed/videoseries?list=PLofht4PTcKYnaH8w5olJCI-wUVxuoMHqM&autoplay=0"
        title="Lo-Fi Focus — Royalty Free" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" loading="lazy" />
    ),
    ambient: (
      <iframe width="100%" height="352" style={{ borderRadius: 10 }}
        src="https://www.youtube.com/embed/videoseries?list=PLYUnnBDDCkw0MO5GFkFEzf_KL4djFKueS&autoplay=0"
        title="Ambient Space — Royalty Free" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" loading="lazy" />
    ),
  };

  return (
    <AnimatedSection className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid md:grid-cols-[1fr_2fr] gap-10 md:gap-16 items-start">
          <div>
            <span className="terminal-prompt font-[family-name:var(--font-mono)] text-sm">now_playing</span>
            <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-4 h-px bg-gradient-to-r from-[var(--accent-purple)] to-transparent opacity-40" />
            <p className="mt-6 text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              Curated royalty-free playlists for the session. No copyright issues — just vibes.
            </p>
            <div className="mt-4 flex items-end gap-[3px] h-6">
              {[0,1,2,3,4,5,6,7].map((i) => (
                <motion.div key={i} animate={{ scaleY: [0.2, 0.6 + (i % 3) * 0.15, 0.2] }}
                  transition={{ duration: 1 + (i % 3) * 0.3, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 }}
                  className="w-[3px] h-full rounded-full origin-bottom" style={{ background: MUSIC_MODES.find(m => m.key === mode)?.color }} />
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-2">
              {MUSIC_MODES.map((m) => (
                <motion.button key={m.key} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
                  onClick={() => setMode(m.key)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-600 text-left ${
                    mode === m.key
                      ? "bg-white/[0.06] text-[var(--text-primary)] border border-white/[0.12] shadow-[0_0_20px_rgba(0,229,255,0.04)]"
                      : "bg-white/[0.02] text-[var(--text-muted)] border border-white/[0.04] hover:text-[var(--text-secondary)]"
                  }`}>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full transition-all duration-400" style={{ background: mode === m.key ? m.color : "rgba(255,255,255,0.15)" }} />
                    {m.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
          <div className="glass-card p-1 overflow-hidden music-player-container" id="music">
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
                {embeds[mode]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ── Contact CTA ───────────────────────── */
function ContactSection() {
  return (
    <AnimatedSection className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto text-center">
        <span className="terminal-prompt font-[family-name:var(--font-mono)] text-sm">contact</span>
        <h2 className="mt-8 font-[family-name:var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          Let&apos;s build something<br /><span className="gradient-text">extraordinary.</span>
        </h2>
        <p className="mt-6 text-[var(--text-secondary)] text-base sm:text-lg max-w-md mx-auto">Got a project in mind, want to collaborate, or just want to talk tech?</p>
        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 180, damping: 15 }}>
            <Link href="/contact" className="glow-btn glow-btn-filled">
              <span>Get in Touch</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 180, damping: 15 }}>
            <a href="https://github.com/iMaxwe11" target="_blank" rel="noopener noreferrer" className="glow-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span>GitHub</span>
            </a>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ── Footer ────────────────────────────── */
function Footer() {
  return (
    <footer className="relative py-10 sm:py-12 px-4 sm:px-6 border-t border-white/[0.04]">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">© {new Date().getFullYear()} Maxwell Nixon. Built with precision.</span>
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
          {[{ href: "/tools", label: "Tools" }, { href: "/terminal", label: "Terminal" }, { href: "/security", label: "Security" }, { href: "/contact", label: "Contact" }].map((link) => (
            <Link key={link.href} href={link.href} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-400 font-[family-name:var(--font-mono)] glow-underline">{link.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   PAGE: Home
   ═══════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      <SpotlightCursor />
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      <Navbar />
      <main>
        <HeroSection />
        <div className="section-divider" />
        <AboutSection />
        <div className="section-divider" />
        <ProjectsSection />
        <div className="section-divider" />
        <StackSection />
        <div className="section-divider" />
        <MusicSection />
        <div className="section-divider" />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
