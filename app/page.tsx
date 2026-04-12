"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { CryptoTicker } from "@/components/widgets/CryptoTicker";
import { StockTicker } from "@/components/widgets/StockTicker";
import { WeatherRadar } from "@/components/widgets/WeatherRadar";
import { ISSTracker } from "@/components/widgets/ISSTracker";
import { NASAAPODCard } from "@/components/widgets/NASAAPODCard";

const SOCIALS = [
  { name: "GitHub", href: "https://github.com/iMaxwe11", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
  { name: "LinkedIn", href: "https://linkedin.com/in/maxwell-nixon-90351627a", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { name: "Email", href: "mailto:mnixon112@outlook.com", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg> },
];

/* ═══ NAVBAR ═══ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  const links = [{ href: "#projects", label: "Projects" }, { href: "#experience", label: "Experience" }, { href: "/tools", label: "Tools" }, { href: "/space", label: "Space" }, { href: "/play", label: "Arcade" }, { href: "#contact", label: "Contact" }];
  return (
    <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.15] shadow-[0_4px_20px_rgba(0,0,0,0.5)]" : "bg-transparent"}`}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8"><motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 opacity-30 group-hover:opacity-50 transition-opacity" /><div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center"><span className="text-xs font-bold gradient-text">M</span></div></div>
          <span className="text-base font-semibold tracking-wide text-white/90 hover:text-white transition-colors hidden sm:inline">maxwellnixon<span className="text-cyan-400">.</span>com</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => <a key={l.href} href={l.href} className="px-4 py-2 text-sm font-medium tracking-wider uppercase text-white/70 hover:text-white transition-colors font-mono">{l.label}</a>)}
          <div className="ml-4 flex items-center gap-2 pl-4 border-l border-white/10">
            {SOCIALS.map(s => <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-cyan-400 transition-colors p-1.5" aria-label={s.name}>{s.icon}</a>)}
          </div>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white/70 hover:text-white p-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}</svg></button>
      </div>
      <AnimatePresence>{mobileOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-4 pb-4 overflow-hidden">
          {links.map(l => <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-medium tracking-wider uppercase text-white/70 hover:text-white transition-colors font-mono border-b border-white/5 last:border-0">{l.label}</a>)}
          <div className="flex gap-4 pt-3">{SOCIALS.map(s => <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-cyan-400 transition-colors">{s.icon}</a>)}</div>
        </motion.div>
      )}</AnimatePresence>
    </motion.nav>
  );
}

/* ═══ SECTION WRAPPER ═══ */
function Sec({ children, className = "", delay = 0, id }: { children: React.ReactNode; className?: string; delay?: number; id?: string }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: "-80px" });
  return <motion.section ref={ref} id={id} initial={{ opacity: 0, y: 40 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>{children}</motion.section>;
}

/* ═══ PROJECT VISUAL CARD ═══ */
function ProjectVisual({ gradient, icon, pattern }: { gradient: string; icon: string; pattern: string }) {
  return (
    <div className={`relative w-full h-40 rounded-xl overflow-hidden bg-gradient-to-br ${gradient} mb-5 group-hover:scale-[1.02] transition-transform duration-500`}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: pattern, backgroundSize: "30px 30px" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-3 left-4 text-3xl drop-shadow-lg">{icon}</div>
      <div className="absolute top-3 right-3 text-[10px] font-mono text-white/60 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">Preview</div>
    </div>
  );
}

/* ═══ HERO ═══ */
function HeroSection() {
  const [time, setTime] = useState("");
  const [rgbMode, setRgbMode] = useState<"off"|"sweep"|"pulse"|"pick">("off");
  const [customColor, setCustomColor] = useState("#06b6d4");
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -60]);
  useEffect(() => { const tick = () => setTime(new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "America/New_York" }).format(new Date())); tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);
  const grad = () => rgbMode === "pick" ? `linear-gradient(135deg,${customColor},${customColor}cc)` : rgbMode === "sweep" ? "linear-gradient(90deg,#ff0080 0%,#ff8c00 25%,#40e0d0 50%,#9370db 75%,#ff0080 100%)" : rgbMode === "pulse" ? "linear-gradient(135deg,#ff0080,#40e0d0,#9370db)" : "linear-gradient(135deg,#06b6d4,#8b5cf6)";
  const bgSize = () => rgbMode === "sweep" ? "300% 100%" : rgbMode === "pulse" ? "200% 200%" : "100% 100%";
  const anim = () => rgbMode === "sweep" ? { backgroundPosition: ["0% 50%","100% 50%","0% 50%"] } : rgbMode === "pulse" ? { backgroundPosition: ["0% 0%","100% 100%","0% 0%"] } : {};
  const trans = () => rgbMode === "sweep" ? { duration: 3, repeat: Infinity, ease: "linear" as const } : rgbMode === "pulse" ? { duration: 4, repeat: Infinity, ease: "easeInOut" as const } : {};
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="mesh-gradient-hero" />
      <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8"><WeatherWidget /></motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="flex items-center gap-4 mb-8 sm:mb-10">
          <motion.span animate={{ boxShadow: ["0 0 8px var(--accent-cyan)","0 0 20px var(--accent-cyan)","0 0 8px var(--accent-cyan)"] }} transition={{ duration: 3, repeat: Infinity }} className="status-dot" />
          <span className="terminal-prompt font-mono text-xs sm:text-sm text-white/80">{time ? `EST ${time}` : "loading..."}<span className="text-white/40 mx-2">·</span>Southampton, NJ</span>
        </motion.div>
        <div className="space-y-4">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, ...(rgbMode !== "off" ? anim() : {}) }} transition={{ opacity: { duration: 1.1, delay: 0.5 }, y: { duration: 1.1, delay: 0.5 }, ...(rgbMode !== "off" ? { backgroundPosition: trans() } : {}) }}
            className="font-bold text-[clamp(2.2rem,8vw,6rem)] leading-[0.95] tracking-tight w-fit"
            style={{ backgroundImage: grad(), backgroundSize: bgSize(), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "inline-block", willChange: rgbMode !== "off" ? "background-position" : "auto" }}>
            Maxwell Nixon
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex items-center gap-2 flex-wrap">
            {(["sweep","pulse","pick"] as const).map(m => (
              <button key={m} onClick={() => setRgbMode(rgbMode === m ? "off" : m)}
                className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase border rounded-md transition-all ${rgbMode === m ? (m === "sweep" ? "bg-gradient-to-r from-red-500 to-blue-500 border-transparent text-white" : m === "pulse" ? "bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white" : "border-transparent text-white") : "bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/40 text-white/70 hover:text-white"}`}
                style={rgbMode === "pick" && m === "pick" ? { background: customColor } : {}}>
                {m === "pick" ? <span className="relative">PICK<input type="color" value={customColor} onChange={e => { setCustomColor(e.target.value); setRgbMode("pick"); }} className="absolute inset-0 opacity-0 cursor-pointer" /></span> : m.toUpperCase()}
              </button>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.65 }}
            className="font-bold text-[clamp(1.8rem,6vw,4.5rem)] leading-[0.95] tracking-tight text-white/60">
            IT Systems<span className="gradient-text"> · </span>Cloud<span className="gradient-text"> · </span>DevOps
          </motion.div>
        </div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.85 }} className="mt-8 max-w-xl text-white/70 text-base sm:text-lg leading-relaxed">
          Cloud-savvy IT technician building full-stack automation tools, managing infrastructure, and engineering premium software experiences. Passionate about reliability, privacy, and self-hosted development.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.0 }} className="mt-10 flex flex-wrap gap-4">
          <a href="#projects" className="glow-btn glow-btn-filled"><span>View Projects</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
          <a href="/Maxwell_Nixon_Resume.docx" download="Maxwell_Nixon_Resume.docx" className="glow-btn"><span>Download Resume</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></a>
          <a href="#contact" className="glow-btn"><span>Get in Touch</span></a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══ LIVE DATA — Weather + Crypto + Stocks ═══ */
function LiveDataSection() {
  return (
    <Sec className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16">
          <span className="terminal-prompt font-mono text-sm text-white/70">live_data</span>
          <h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">Real-Time Intelligence</h2>
          <p className="mt-4 text-white/60 max-w-2xl">Live weather, cryptocurrency, and stock market data — updated automatically.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <WeatherWidget />
          <CryptoTicker />
          <StockTicker />
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <ISSTracker />
          <NASAAPODCard />
        </div>
        <div className="mt-6">
          <WeatherRadar />
        </div>
      </div>
    </Sec>
  );
}

/* ═══ ABOUT ═══ */
function AboutSection() {
  return (
    <Sec className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-[1fr_2fr] gap-10 md:gap-16">
        <div>
          <span className="terminal-prompt font-mono text-sm text-white/70">about</span>
          <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="mt-4 h-px bg-gradient-to-r from-cyan-400 to-transparent opacity-40" />
        </div>
        <div className="space-y-6">
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-white">Building bridges between <span className="gradient-text">infrastructure, automation,</span> and <span className="gradient-text-warm">innovation.</span></h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed">I&apos;m an IT systems technician and DevOps enthusiast managing real-world infrastructure for businesses — from law firms to landscaping operations. I deploy Windows workstations, configure Active Directory, troubleshoot networking, and maintain servers. But I also build full-stack tools, data pipelines, and self-hosted AI experiments.</p>
          <p className="text-white/70 leading-relaxed">When I&apos;m not shipping code or resolving support tickets, you&apos;ll find me deep in sim racing setups, tinkering with smart home automation, modding FiveM game servers, or tuning custom PC hardware for peak performance.</p>
          <div className="flex flex-wrap gap-2 pt-2">{["AWS","Azure","Docker","Python","FastAPI","Kubernetes","Active Directory","GitHub Actions","Next.js","TypeScript"].map(s => <motion.span key={s} whileHover={{ scale: 1.08, y: -2 }} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/70 font-mono cursor-default">{s}</motion.span>)}</div>
        </div>
      </div>
    </Sec>
  );
}

/* ═══ PROJECTS ═══ */
function ProjectsSection() {
  const projects = [
    { title: "Smart Data Pipeline", desc: "Cloud-style data pipeline with FastAPI API layer, Python ETL processor, and Streamlit dashboard. Fully containerized with Docker and CI/CD via GitHub Actions.", tags: ["FastAPI","Python","Docker","Streamlit","CI/CD"], gradient: "from-cyan-500 to-blue-600", icon: "🔄", github: "https://github.com/iMaxwe11/smart-data-pipeline", metrics: "End-to-end ETL · Docker Compose · CI/CD pipeline", pattern: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)" },
    { title: "Developer Tools Hub", desc: "22 client-side developer utilities — JSON formatter, regex tester, hash generator, color palette, contrast checker, diff checker, JWT decoder, and more. Zero tracking, fully private.", tags: ["Next.js","TypeScript","Tailwind","Framer Motion"], gradient: "from-purple-500 to-pink-500", icon: "🛠️", link: "/tools", metrics: "22 tools · 100% client-side · Zero tracking", pattern: "linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%)" },
    { title: "FiveM Game Server", desc: "Launched and managed a public FiveM multiplayer server with custom vehicles, physics mods, real-time logging, and automated mod loaders. Managed remote servers and multiplayer user systems.", tags: ["Lua","Server Admin","Modding","Multiplayer"], gradient: "from-green-500 to-emerald-600", icon: "🎮", github: "https://github.com/iMaxwe11", metrics: "Custom assets · Live multiplayer · Automated mod management", pattern: "radial-gradient(circle, rgba(255,255,255,0.06) 2px, transparent 2px)" },
    { title: "Home Lab & AI Automation", desc: "Self-hosted containerized LLaMA and Mistral LLMs with GPU acceleration. Prompt tuning, offline inference, and scripting pipelines with a privacy-first mindset.", tags: ["LLaMA","Mistral","Docker","GPU","Python"], gradient: "from-orange-500 to-red-500", icon: "🧠", github: "https://github.com/iMaxwe11", metrics: "Self-hosted LLMs · GPU accelerated · Privacy-first", pattern: "linear-gradient(135deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.04) 75%, transparent 75%)" },
    { title: "Media Server Stack", desc: "Optimized Plex-based home server with remote access, hardware transcoding, metadata scripting, and automated library management across devices.", tags: ["Plex","Linux","Networking","Automation"], gradient: "from-yellow-500 to-orange-500", icon: "📺", github: "https://github.com/iMaxwe11", metrics: "Hardware transcoding · Remote access · Multi-device streaming", pattern: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)" },
    { title: "IT Infrastructure @ PCS", desc: "Enterprise IT support for law firms and businesses across NJ, PA, and DE. Windows Server deployment, Active Directory, VLANs, PXE imaging, VPN, and ConnectWise ticketing.", tags: ["Windows Server","AD","VLANs","PXE","ConnectWise"], gradient: "from-blue-500 to-indigo-600", icon: "🏢", metrics: "Multi-site enterprise · 50+ endpoints managed · 99.9% uptime target", pattern: "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)" },
  ];
  return (
    <Sec id="projects" className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16">
          <span className="terminal-prompt font-mono text-sm text-white/70">projects</span>
          <h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">What I Build</h2>
          <p className="mt-4 text-white/60 max-w-2xl">From data pipelines and dev tools to game servers and AI labs — real projects with real impact.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }} whileHover={{ y: -6 }} className="glass-card p-6 h-full group relative overflow-hidden cursor-default">
              <ProjectVisual gradient={p.gradient} icon={p.icon} pattern={p.pattern} />
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{p.title}</h3>
              <p className="text-white/55 leading-relaxed mb-3 text-sm">{p.desc}</p>
              <p className="text-[11px] font-mono text-cyan-400/70 mb-4 flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>{p.metrics}</p>
              <div className="flex gap-1.5 flex-wrap mb-4">{p.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-[0.6rem] text-white/50 border border-white/[0.06] font-mono">{t}</span>)}</div>
              <div className="flex gap-3">{p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-white/40 hover:text-cyan-400 transition-colors flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>GitHub</a>}{p.link && <Link href={p.link} className="text-xs font-mono text-white/40 hover:text-cyan-400 transition-colors flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>Live Demo</Link>}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Sec>
  );
}

/* ═══ EXPERIENCE ═══ */
function ExperienceSection() {
  const exp = [
    { title: "Client Services Technician", co: "PCS", loc: "Cherry Hill, NJ", period: "2023 – Present", color: "var(--accent-cyan)", bullets: ["Deliver technical support for business clients including law firms and infrastructure environments.","Deploy and maintain Windows workstations, printers, networking, and AD policies.","Lead onsite visits and courtroom setups; resolve tickets independently via ConnectWise.","Ensure uptime, troubleshoot across environments, and contribute to client tech planning."] },
    { title: "IT Systems Manager", co: "AZ Lawn Care & Tree Service", loc: "NJ", period: "2023 – Present", color: "var(--accent-purple)", bullets: ["Own and maintain company IT infrastructure — QuickBooks server, workstations, file sharing.","Configure secure local backups, VPN access, and remote support tools.","Proactively identify bottlenecks and resolve day-to-day tech issues."] },
    { title: "Help Desk / Field Technician", co: "PCS", loc: "Cherry Hill, NJ", period: "Early 2023", color: "var(--accent-gold)", bullets: ["Onsite IT support for multiple clients across NJ, PA, DE, and Shore region.","Daily tech for RHD — incident response and proactive health checks.","Handled networking, device setups, credential lockouts, VPN, and software updates."] },
    { title: "Office Assistant / IT Admin", co: "AZ Lawn Care", loc: "NJ", period: "2018 – 2023", color: "#64748b", bullets: ["Transitioned from labor support to technical admin, managing QuickBooks and customer database.","Enabled reliable digital operations during staffing gaps."] },
  ];
  const certs = ["Liongard Administrator","Introduction to Liongard","Intro to Managed Service Providers","Troubleshoot Customer Issues Faster"];
  return (
    <Sec id="experience" className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div><span className="terminal-prompt font-mono text-sm text-white/70">experience</span><h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">Where I&apos;ve Worked</h2><p className="mt-4 text-white/60 max-w-xl">From hands-on field tech to systems management — building expertise across IT infrastructure.</p></div>
          <a href="/Maxwell_Nixon_Resume.docx" download="Maxwell_Nixon_Resume.docx" className="glow-btn text-sm shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg><span>Download Resume</span></a>
        </div>
        <div className="relative">
          <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-400/30 via-purple-400/20 to-transparent" />
          <div className="space-y-8">{exp.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6 }} className="relative pl-12 sm:pl-20">
              <div className="absolute left-2.5 sm:left-6.5 top-1 w-3 h-3 rounded-full border-2" style={{ borderColor: e.color, background: `${e.color}33` }} />
              <div className="glass-card p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div><h3 className="text-lg font-bold text-white">{e.title}</h3><p className="text-sm text-white/50">{e.co} · {e.loc}</p></div>
                  <span className="text-xs font-mono px-3 py-1 rounded-md border border-white/10 text-white/40 whitespace-nowrap w-fit" style={{ borderColor: `${e.color}30` }}>{e.period}</span>
                </div>
                <ul className="space-y-1.5">{e.bullets.map((b, j) => <li key={j} className="text-sm text-white/55 leading-relaxed flex gap-2"><span className="text-white/20 mt-0.5 shrink-0">▸</span>{b}</li>)}</ul>
              </div>
            </motion.div>
          ))}</div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-14 glass-card p-7">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><span className="text-xl">🛡️</span>Certifications</h3>
          <div className="grid sm:grid-cols-2 gap-2">{certs.map(c => <div key={c} className="flex items-center gap-3 py-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0" /><span className="text-sm text-white/65">{c}</span></div>)}</div>
        </motion.div>
      </div>
    </Sec>
  );
}

/* ═══ TECH STACK ═══ */
function StackSection() {
  const stack = [
    { name: "React & Next.js", icon: "⚛️" },{ name: "TypeScript", icon: "📘" },{ name: "Python", icon: "🐍" },{ name: "Docker", icon: "🐳" },{ name: "AWS / Azure", icon: "☁️" },{ name: "Tailwind CSS", icon: "🎨" },{ name: "FastAPI", icon: "⚡" },{ name: "GitHub Actions", icon: "🔄" },{ name: "Windows Server", icon: "🖥️" },{ name: "Active Directory", icon: "🔐" },{ name: "Bash / CLI", icon: "💻" },{ name: "Kubernetes", icon: "☸️" },
  ];
  return (
    <Sec className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16"><span className="terminal-prompt font-mono text-sm text-white/70">stack</span><h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">Tech I Use</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{stack.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }} whileHover={{ y: -6, scale: 1.08 }} className="glass-card p-5 text-center cursor-default">
            <div className="text-3xl mb-2">{t.icon}</div><div className="text-xs text-white/80 font-medium">{t.name}</div>
          </motion.div>
        ))}</div>
      </div>
    </Sec>
  );
}

/* ═══ CONTACT ═══ */
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const submit = () => {
    const subject = encodeURIComponent(`Portfolio Contact from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:mnixon112@outlook.com?subject=${subject}&body=${body}`;
    setSent(true); setTimeout(() => setSent(false), 4000);
  };
  return (
    <Sec id="contact" className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16"><span className="terminal-prompt font-mono text-sm text-white/70">contact</span><h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">Get In Touch</h2><p className="mt-4 text-white/60 max-w-2xl">Have a project in mind, a question, or just want to connect? Reach out.</p></div>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-10">
          <div className="space-y-6">
            <div className="glass-card p-7 space-y-5">
              <a href="mailto:mnixon112@outlook.com" className="flex items-center gap-4 group"><div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400/20 transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg></div><div><p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Email</p><p className="text-white/90 hover:text-cyan-400 transition-colors text-sm">mnixon112@outlook.com</p></div></a>
              <a href="tel:609-923-9437" className="flex items-center gap-4 group"><div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400/20 transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></div><div><p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Phone</p><p className="text-white/90 hover:text-cyan-400 transition-colors text-sm">(609) 923-9437</p></div></a>
              <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div><div><p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Location</p><p className="text-white/90 text-sm">Southampton, NJ</p></div></div>
            </div>
            <div className="flex gap-3">{SOCIALS.map(s => <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="glass-card p-3.5 text-white/40 hover:text-cyan-400 hover:border-cyan-400/30 transition-all flex items-center gap-2">{s.icon}<span className="text-xs font-mono hidden sm:inline">{s.name}</span></a>)}</div>
          </div>
          <div className="glass-card p-7">
            <h3 className="text-white/80 font-semibold mb-5 text-sm">Send a Message</h3>
            <div className="space-y-4">
              <div><label className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1.5 block">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="tool-input neon-input" placeholder="Your name" /></div>
              <div><label className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1.5 block">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="tool-input neon-input" placeholder="your@email.com" /></div>
              <div><label className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1.5 block">Message</label><textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="tool-input neon-input min-h-[130px] resize-none" placeholder="What's on your mind?" /></div>
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={submit} disabled={!form.name || !form.email || !form.message}
                className="w-full py-3 rounded-xl font-mono text-sm font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-cyan-500 to-purple-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                {sent ? "✓ Opening Email Client..." : "Send Message"}
              </motion.button>
              <p className="text-[10px] text-white/25 text-center font-mono">Opens your default email client with pre-filled message</p>
            </div>
          </div>
        </div>
      </div>
    </Sec>
  );
}

/* ═══ BACK TO TOP ═══ */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => { const fn = () => setShow(window.scrollY > 600); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white/60 hover:text-cyan-400 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all flex items-center justify-center"
          aria-label="Back to top">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ═══ FOOTER ═══ */
function Footer() {
  const footerLinks = [
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "Tools", href: "/tools" },
    { label: "Space", href: "/space" },
    { label: "Arcade", href: "/play" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <footer className="relative py-16 px-4 sm:px-6">
      <div className="section-divider mb-16" />
      <div className="max-w-[1200px] mx-auto">
        <div className="grid sm:grid-cols-3 gap-10 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="relative w-8 h-8"><div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 opacity-30" /><div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center"><span className="text-xs font-bold gradient-text">M</span></div></div>
              <span className="text-base font-semibold tracking-wide text-white/80">maxwellnixon<span className="text-cyan-400">.</span>com</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">Cloud-savvy IT technician and full-stack developer building premium software experiences.</p>
          </div>
          <div>
            <h4 className="text-white/60 text-xs font-mono uppercase tracking-wider mb-4">Navigation</h4>
            <div className="grid grid-cols-2 gap-2">
              {footerLinks.map(l => <a key={l.label} href={l.href} className="text-sm text-white/35 hover:text-cyan-400 transition-colors">{l.label}</a>)}
            </div>
          </div>
          <div>
            <h4 className="text-white/60 text-xs font-mono uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex flex-col gap-2">
              {SOCIALS.map(s => <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/35 hover:text-cyan-400 transition-colors flex items-center gap-2">{s.icon}<span>{s.name}</span></a>)}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs font-mono">&copy; {new Date().getFullYear()} Maxwell Nixon. All rights reserved.</p>
          <p className="text-white/20 text-xs font-mono">Built with Next.js, TypeScript &amp; Framer Motion</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══ PAGE ═══ */
export default function Home() {
  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      <Navbar />
      <main>
        <HeroSection />
        <div className="section-divider" />
        <LiveDataSection />
        <div className="section-divider" />
        <AboutSection />
        <div className="section-divider" />
        <ProjectsSection />
        <div className="section-divider" />
        <ExperienceSection />
        <div className="section-divider" />
        <StackSection />
        <div className="section-divider" />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
