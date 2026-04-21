"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SocialIcon } from "@/components/SocialIcon";
import { GrokStarfield } from "@/components/GrokStarfield";
import { Navbar } from "@/components/Navbar";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { CryptoTicker } from "@/components/widgets/CryptoTicker";
import { StockTicker } from "@/components/widgets/StockTicker";
import { GitHubActivity } from "@/components/widgets/GitHubActivity";
import { CopyButton } from "@/components/CopyButton";
import { footerNavLinks, homeNavLinks, siteConfig, socialLinks } from "@/lib/site-config";
import { useAccent } from "@/lib/use-accent";

/* ═══ SECTION WRAPPER ═══ */
function Sec({ children, className = "", delay = 0, id }: { children: React.ReactNode; className?: string; delay?: number; id?: string }) {
  const ref = useRef(null);
  const v = useInView(ref, { once: true, margin: "-80px" });
  return <motion.section ref={ref} id={id} initial={{ opacity: 0, y: 40 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>{children}</motion.section>;
}

/* ═══ PROJECT VISUAL — Live Demo Preview ═══ */
function ProjectVisual({ gradient, icon, pattern, liveUrl, title }: { gradient: string; icon: string; pattern: string; liveUrl?: string; title: string }) {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <div className="relative mb-5">
      <div className={`relative w-full rounded-xl overflow-hidden ${showDemo && liveUrl ? "" : `bg-gradient-to-br ${gradient}`}`}
        style={{ height: showDemo && liveUrl ? 280 : 160 }}>
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[9px] font-mono text-white/30 bg-white/5 px-3 py-0.5 rounded-full">
              {liveUrl ? liveUrl.replace("https://", "") : `${title.toLowerCase().replace(/\s+/g, "-")}.dev`}
            </span>
          </div>
          {liveUrl && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowDemo(!showDemo); }}
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                showDemo ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/30" : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
              }`}>
              {showDemo ? "Close" : "Live Demo"}
            </button>
          )}
        </div>
        {showDemo && liveUrl ? (
          <iframe src={liveUrl} className="w-full h-full border-none pt-8" title={`${title} Demo`} loading="lazy" sandbox="allow-scripts allow-same-origin" />
        ) : (
          <>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: pattern, backgroundSize: "30px 30px" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-4 text-3xl drop-shadow-lg">{icon}</div>
            {liveUrl && (
              <div className="absolute top-10 right-3 text-[9px] font-mono text-white/80 bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface ProjectCard {
  title: string;
  desc: string;
  tags: string[];
  gradient: string;
  icon: string;
  metrics: string;
  pattern: string;
  github?: string;
  link?: string;
  liveUrl?: string;
}

/* ═══ TYPEWRITER (role line) ═══ */
const TAGLINES = [
  "IT Systems · Cloud · DevOps",
  "Shipping · Automating · Scaling",
  "Infrastructure · Tools · Pipelines",
  "Privacy · Reliability · Speed",
];

function useTypewriter(lines: string[], typeMs = 60, eraseMs = 30, holdMs = 2400) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(lines[0] ?? "");
  const [phase, setPhase] = useState<"typing" | "hold" | "erasing">("hold");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const current = lines[idx] ?? "";

    if (phase === "hold") {
      timer = setTimeout(() => setPhase("erasing"), holdMs);
    } else if (phase === "erasing") {
      if (text.length === 0) {
        const nextIdx = (idx + 1) % lines.length;
        setIdx(nextIdx);
        setPhase("typing");
      } else {
        timer = setTimeout(() => setText(text.slice(0, -1)), eraseMs);
      }
    } else if (phase === "typing") {
      if (text.length < current.length) {
        timer = setTimeout(() => setText(current.slice(0, text.length + 1)), typeMs);
      } else {
        setPhase("hold");
      }
    }
    return () => clearTimeout(timer);
  }, [idx, phase, text, lines, typeMs, eraseMs, holdMs]);

  return text;
}

/* ═══ HERO ═══ */
function HeroSection() {
  const [time, setTime] = useState("");
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -60]);

  const { mode, color } = useAccent();
  const typed = useTypewriter(TAGLINES);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "America/New_York",
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Subtle mouse-tracked parallax on the mesh gradient behind the hero.
  // Disabled when the user prefers reduced motion or on touch-only devices.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const noHover = window.matchMedia("(hover: none)");
    if (mq.matches || noHover.matches) return;

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        setParallax({ x: nx, y: ny });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Compute name gradient from the selected accent mode
  const gradient =
    mode === "pick"
      ? `linear-gradient(135deg, ${color}, ${color}cc)`
      : mode === "sweep"
        ? "linear-gradient(90deg,#ff0080 0%,#ff8c00 25%,#40e0d0 50%,#9370db 75%,#ff0080 100%)"
        : mode === "pulse"
          ? "linear-gradient(135deg,#ff0080,#40e0d0,#9370db)"
          : "linear-gradient(135deg,#06b6d4,#8b5cf6)";
  const bgSize =
    mode === "sweep" ? "300% 100%" : mode === "pulse" ? "200% 200%" : "100% 100%";
  const bgAnim =
    mode === "sweep"
      ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
      : mode === "pulse"
        ? { backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }
        : undefined;
  const bgAnimTrans =
    mode === "sweep"
      ? { duration: 3, repeat: Infinity, ease: "linear" as const }
      : mode === "pulse"
        ? { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
        : undefined;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="mesh-gradient-hero"
        style={{
          transform: `translate3d(${parallax.x * 14}px, ${parallax.y * 14}px, 0) scale(1.05)`,
          transition: "transform 250ms cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      />
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 w-full"
      >
        {/* Location + time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex items-center gap-4 mb-10"
        >
          <motion.span
            animate={{ boxShadow: ["0 0 8px var(--accent-cyan)", "0 0 20px var(--accent-cyan)", "0 0 8px var(--accent-cyan)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="status-dot"
          />
          <span className="terminal-prompt font-mono text-xs sm:text-sm text-white/80">
            {time ? `EST ${time}` : "loading..."}
            <span className="text-white/40 mx-2">·</span>
            {siteConfig.location}
          </span>
        </motion.div>

        {/* Name (customize the gradient from the theme circle in the navbar) */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: 1,
            y: 0,
            ...(bgAnim ? bgAnim : {}),
          }}
          transition={{
            opacity: { duration: 1.1, delay: 0.4 },
            y: { duration: 1.1, delay: 0.4 },
            ...(bgAnimTrans ? { backgroundPosition: bgAnimTrans } : {}),
          }}
          className="font-bold text-[clamp(2.2rem,8vw,6rem)] leading-[0.95] tracking-tight inline-block"
          style={{
            backgroundImage: gradient,
            backgroundSize: bgSize,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            willChange: mode !== "off" ? "background-position" : "auto",
          }}
        >
          Maxwell Nixon
        </motion.h1>

        {/* Role line with typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.55 }}
          className="mt-4 font-bold text-[clamp(1.6rem,5vw,3.5rem)] leading-[0.95] tracking-tight text-white/60 min-h-[1.2em]"
          aria-live="polite"
        >
          <span>{typed}</span>
          <motion.span
            aria-hidden
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block w-[0.08em] h-[0.85em] ml-1 -mb-1 align-bottom bg-cyan-400/80 rounded-sm"
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75 }}
          className="mt-8 max-w-xl text-white/70 text-base sm:text-lg leading-relaxed"
        >
          Cloud-savvy IT technician building full-stack automation tools, managing infrastructure, and
          engineering premium software experiences. Passionate about reliability, privacy, and self-hosted
          development.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <a href="#projects" className="glow-btn glow-btn-filled">
            <span>View Projects</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a href={siteConfig.resumePath} download="Maxwell_Nixon_Resume.docx" className="glow-btn">
            <span>Download Resume</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </a>
        </motion.div>

        {/* Hint for shortcuts */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mt-8 text-[11px] font-mono text-white/25"
        >
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/50">?</kbd>{" "}
          for keyboard shortcuts · <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/50">⌘K</kbd> for command palette
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ═══ LIVE DATA — Compact 3-widget strip ═══ */
function LiveDataSection() {
  return (
    <Sec className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="terminal-prompt font-mono text-sm text-white/70">live_data</span>
            <h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">Real-Time Intelligence</h2>
            <p className="mt-3 text-white/60 max-w-2xl">
              Live weather, cryptocurrency, and stock market data — all self-hosted, updated automatically.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-xs font-mono text-white/50 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <span>See more live data</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <WeatherWidget />
          <CryptoTicker />
          <StockTicker />
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

          {/* Live "what I'm currently doing" pill — links to /now */}
          <Link
            href="/now"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                       bg-[rgba(var(--theme-primary-rgb),0.06)]
                       border border-[rgba(var(--theme-primary-rgb),0.2)]
                       text-xs font-mono text-[color:var(--theme-primary)]
                       hover:bg-[rgba(var(--theme-primary-rgb),0.12)]
                       hover:border-[rgba(var(--theme-primary-rgb),0.35)]
                       transition-colors w-fit"
          >
            <motion.span
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[color:var(--theme-primary)]"
            />
            <span>Currently working on — see /now</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <div className="flex flex-wrap gap-2 pt-2">{["AWS","Azure","Docker","Python","FastAPI","Kubernetes","Active Directory","GitHub Actions","Next.js","TypeScript"].map(s => <motion.span key={s} whileHover={{ scale: 1.08, y: -2 }} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/70 font-mono cursor-default">{s}</motion.span>)}</div>
        </div>
      </div>
    </Sec>
  );
}

/* ═══ PROJECTS — 6 Featured + See All ═══ */
function ProjectsSection() {
  const projects: ProjectCard[] = [
    {
      title: "Developer Tools Hub",
      desc: "35 client-side developer utilities — JSON formatter, regex tester, hash generator, QR code, JWT decoder, SQL formatter, and more. Zero tracking, fully private.",
      tags: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
      gradient: "from-purple-500 to-pink-500",
      icon: "🛠️",
      link: "/tools",
      liveUrl: "https://maxwellnixon.com/tools",
      metrics: "35 tools · 100% client-side · Zero tracking",
      pattern:
        "linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%)",
    },
    {
      title: "Space & Launch Tracker",
      desc: "Real-time space dashboard with ISS tracking, NASA imagery, launch schedules from all providers, Mars rover photos, asteroid monitoring, and solar weather.",
      tags: ["Next.js", "NASA API", "Real-time", "Space Devs API"],
      gradient: "from-indigo-500 to-purple-600",
      icon: "🚀",
      link: "/space",
      liveUrl: "https://maxwellnixon.com/space",
      metrics: "Live launches · ISS tracking · Mars photos · NEO monitoring",
      pattern: "radial-gradient(circle, rgba(255,255,255,0.06) 2px, transparent 2px)",
    },
    {
      title: "Smart Data Pipeline",
      desc: "Cloud-style data pipeline with FastAPI API layer, Python ETL processor, and Streamlit dashboard. Fully containerized with Docker and CI/CD via GitHub Actions.",
      tags: ["FastAPI", "Python", "Docker", "Streamlit", "CI/CD"],
      gradient: "from-cyan-500 to-blue-600",
      icon: "🔄",
      github: "https://github.com/iMaxwe11/smart-data-pipeline",
      metrics: "End-to-end ETL · Docker Compose · CI/CD pipeline",
      pattern: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
    },
    {
      title: "Neon Arcade",
      desc: "5 browser-based games — Snake, Pong vs AI, Memory Matrix, Reaction Timer, and Type Racer. Canvas rendering, retro CRT effects, and an animated arcade cabinet hub.",
      tags: ["Canvas", "Game Dev", "CSS Art", "Framer Motion"],
      gradient: "from-fuchsia-500 to-pink-600",
      icon: "🕹️",
      link: "/play",
      liveUrl: "https://maxwellnixon.com/play",
      metrics: "5 games · Zero installs · Retro arcade experience",
      pattern:
        "linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%)",
    },
    {
      title: "Home Lab & AI Automation",
      desc: "Self-hosted containerized LLaMA and Mistral LLMs with GPU acceleration. Prompt tuning, offline inference, and scripting pipelines with a privacy-first mindset.",
      tags: ["LLaMA", "Mistral", "Docker", "GPU", "Python"],
      gradient: "from-orange-500 to-red-500",
      icon: "🧠",
      github: "https://github.com/iMaxwe11",
      metrics: "Self-hosted LLMs · GPU accelerated · Privacy-first",
      pattern:
        "linear-gradient(135deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.04) 75%, transparent 75%)",
    },
    {
      title: "IT Infrastructure @ PCS",
      desc: "Enterprise IT support for law firms and businesses across NJ, PA, and DE. Windows Server deployment, Active Directory, VLANs, PXE imaging, VPN, and ConnectWise ticketing.",
      tags: ["Windows Server", "AD", "VLANs", "PXE", "ConnectWise"],
      gradient: "from-blue-500 to-indigo-600",
      icon: "🏢",
      metrics: "Multi-site enterprise · 50+ endpoints managed · 99.9% uptime target",
      pattern: "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
    },
  ];

  return (
    <Sec id="projects" className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="terminal-prompt font-mono text-sm text-white/70">featured_projects</span>
            <h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">What I Build</h2>
            <p className="mt-4 text-white/60 max-w-2xl">
              A curated snapshot — the full archive of experiences, repos, and infrastructure work
              lives on the <Link href="/projects" className="text-cyan-400 hover:text-cyan-300 transition-colors">projects page</Link>.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="glass-card p-6 h-full group relative overflow-hidden cursor-default"
            >
              <ProjectVisual gradient={p.gradient} icon={p.icon} pattern={p.pattern} liveUrl={p.liveUrl} title={p.title} />
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{p.title}</h3>
              <p className="text-white/55 leading-relaxed mb-3 text-sm">{p.desc}</p>
              <p className="text-[11px] font-mono text-cyan-400/70 mb-4 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                {p.metrics}
              </p>
              <div className="flex gap-1.5 flex-wrap mb-4">
                {p.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-[0.6rem] text-white/50 border border-white/[0.06] font-mono">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-white/40 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                )}
                {p.link && (
                  <Link href={p.link} className="text-xs font-mono text-white/40 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                    Live Demo
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* See all */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 text-center"
        >
          <Link href="/projects" className="glow-btn glow-btn-filled">
            <span>See all projects</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-4 text-xs font-mono text-white/30">
            Live experiences · Open source · Professional work
          </p>
        </motion.div>
      </div>
    </Sec>
  );
}

/* ═══ GITHUB ═══ */
function GitHubSection() {
  return (
    <Sec className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
        <div className="space-y-5">
          <span className="terminal-prompt font-mono text-sm text-white/70">github_activity</span>
          <h2 className="font-bold text-3xl sm:text-4xl text-white">
            Shipping in Public with <span className="gradient-text">Live GitHub Signal</span>
          </h2>
          <p className="text-white/60 leading-relaxed">
            Static project cards are useful, but live repo activity gives a better sense of how I actually
            work day to day. Recent pushes, pull requests, and repo changes update here through a cached
            server-side GitHub feed.
          </p>
          <a
            href={`https://github.com/${siteConfig.githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glow-btn w-fit"
          >
            <span>Open GitHub Profile</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        </div>
        <GitHubActivity />
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
          <a href={siteConfig.resumePath} download="Maxwell_Nixon_Resume.docx" className="glow-btn text-sm shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg><span>Download Resume</span></a>
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
    { name: "React & Next.js", icon: "⚛️", years: 4, kind: "Framework" },
    { name: "TypeScript", icon: "📘", years: 3, kind: "Language" },
    { name: "Python", icon: "🐍", years: 5, kind: "Language" },
    { name: "Docker", icon: "🐳", years: 3, kind: "DevOps" },
    { name: "AWS / Azure", icon: "☁️", years: 3, kind: "Cloud" },
    { name: "Tailwind CSS", icon: "🎨", years: 3, kind: "Styling" },
    { name: "FastAPI", icon: "⚡", years: 2, kind: "Backend" },
    { name: "GitHub Actions", icon: "🔄", years: 3, kind: "CI/CD" },
    { name: "Windows Server", icon: "🖥️", years: 6, kind: "Systems" },
    { name: "Active Directory", icon: "🔐", years: 4, kind: "Systems" },
    { name: "Bash / PowerShell", icon: "💻", years: 6, kind: "Scripting" },
    { name: "Kubernetes", icon: "☸️", years: 1, kind: "DevOps" },
  ];
  return (
    <Sec className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16">
          <span className="terminal-prompt font-mono text-sm text-white/70">stack</span>
          <h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">Tech I Use</h2>
          <p className="mt-3 text-white/60 max-w-2xl">
            Years of real production use — numbers reflect time shipping with the tool, not
            time spent reading about it.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stack.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ y: -6, scale: 1.05 }}
              className="glass-card p-4 text-center cursor-default relative overflow-hidden group"
            >
              {/* Kind label top-right */}
              <span className="absolute top-2 right-2 text-[8px] font-mono uppercase tracking-wider text-white/25 group-hover:text-white/45 transition-colors">
                {t.kind}
              </span>
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="text-xs text-white/85 font-semibold leading-tight">{t.name}</div>
              <div className="mt-1.5 text-[10px] font-mono text-cyan-400/70">
                {t.years}+ {t.years === 1 ? "year" : "years"}
              </div>
            </motion.div>
          ))}
        </div>
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
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
    setSent(true); setTimeout(() => setSent(false), 4000);
  };
  return (
    <Sec id="contact" className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16"><span className="terminal-prompt font-mono text-sm text-white/70">contact</span><h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">Get In Touch</h2><p className="mt-4 text-white/60 max-w-2xl">Have a project in mind, a question, or just want to connect? Reach out.</p></div>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-10">
          <div className="space-y-6">
            <div className="glass-card p-7 space-y-5">
              <div className="flex items-center gap-3">
                <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-4 group rounded-xl flex-1 min-w-0 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"><div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400/20 transition-colors shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg></div><div className="min-w-0"><p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Email</p><p className="text-white/90 group-hover:text-cyan-400 transition-colors text-sm truncate">{siteConfig.email}</p></div></a>
                <CopyButton value={siteConfig.email} label="Copy email address" size="md" />
              </div>
              <div className="flex items-center gap-3">
                <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-4 group rounded-xl flex-1 min-w-0 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"><div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400/20 transition-colors shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></div><div className="min-w-0"><p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Phone</p><p className="text-white/90 group-hover:text-cyan-400 transition-colors text-sm">(609) 923-9437</p></div></a>
                <CopyButton value="+1-609-923-9437" label="Copy phone number" size="md" />
              </div>
              <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div><div><p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Location</p><p className="text-white/90 text-sm">{siteConfig.location}</p></div></div>
            </div>
            <div className="flex gap-3">{socialLinks.map((social) => <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="glass-card p-3.5 text-white/40 hover:text-cyan-400 hover:border-cyan-400/30 transition-[color,border-color,background-color,transform] flex items-center gap-2 rounded-xl touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]" aria-label={social.name}><SocialIcon name={social.name} className="w-[18px] h-[18px]" /><span className="text-xs font-mono hidden sm:inline">{social.name}</span></a>)}</div>
          </div>
          <div className="glass-card p-7">
            <h3 className="text-white/80 font-semibold mb-5 text-sm">Send a Message</h3>
            <div className="space-y-4">
              <div><label htmlFor="contact-name" className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1.5 block">Name</label><input id="contact-name" name="name" type="text" autoComplete="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="tool-input neon-input" placeholder="Your name…" /></div>
              <div><label htmlFor="contact-email" className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1.5 block">Email</label><input id="contact-email" name="email" type="email" autoComplete="email" spellCheck={false} value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="tool-input neon-input" placeholder="your@email.com…" /></div>
              <div><label htmlFor="contact-message" className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1.5 block">Message</label><textarea id="contact-message" name="message" autoComplete="off" value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="tool-input neon-input min-h-[130px] resize-none" placeholder="What’s on your mind?" /></div>
              <span className="sr-only" aria-live="polite">{sent ? "Opening your email client with a pre-filled message." : ""}</span>
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={submit}
                disabled={!form.name || !form.email || !form.message}
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, var(--theme-primary), var(--theme-secondary))",
                }}
                className="w-full py-3 rounded-xl font-mono text-sm font-bold uppercase tracking-wider
                           transition-[box-shadow,transform,filter,opacity] text-white
                           disabled:opacity-30 disabled:cursor-not-allowed
                           hover:shadow-[0_0_30px_rgba(var(--theme-primary-rgb),0.35)]
                           touch-manipulation focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-[rgba(var(--theme-primary-rgb),0.4)]
                           focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"
              >
                {sent ? "✓ Opening Email Client…" : "Send Message"}
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
          className="fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white/60 hover:text-cyan-400 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-[color,border-color,box-shadow,transform] flex items-center justify-center touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"
          aria-label="Back to top">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ═══ FOOTER ═══ */
function Footer() {
  const techStack = [
    { name: "Next.js", icon: "▲" },
    { name: "TypeScript", icon: "TS" },
    { name: "Tailwind", icon: "∼" },
    { name: "Framer Motion", icon: "⚡" },
    { name: "Vercel", icon: "▲" },
  ];

  return (
    <footer className="relative py-16 px-4 sm:px-6">
      <div className="section-divider mb-16" />
      <div className="max-w-[1200px] mx-auto">
        <div className="grid sm:grid-cols-3 gap-10 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="relative w-8 h-8">
                <div
                  className="absolute inset-0 rounded-lg opacity-30"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
                  }}
                />
                <div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center">
                  <span className="text-xs font-bold gradient-text">M</span>
                </div>
              </div>
              <span className="text-base font-semibold tracking-wide text-white/80">
                {siteConfig.domain.replace(".com", "")}
                <span style={{ color: "var(--theme-primary)" }}>.</span>com
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-4">{siteConfig.shortDescription}</p>

            {/* Live status pill — real data lives on /status */}
            <Link
              href="/status"
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full
                         bg-green-400/[0.08] border border-green-400/25
                         text-[10px] font-mono text-green-400
                         hover:bg-green-400/[0.14] transition-colors"
            >
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-green-400"
              />
              All systems operational
            </Link>
          </div>
          <div>
            <h4 className="text-white/60 text-xs font-mono uppercase tracking-wider mb-4">Explore</h4>
            <div className="grid grid-cols-2 gap-2">
              {footerNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/35 hover:text-cyan-400 transition-colors rounded-md touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white/60 text-xs font-mono uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex flex-col gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/35 hover:text-cyan-400 transition-colors flex items-center gap-2 rounded-md touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"
                >
                  <SocialIcon name={social.name} />
                  <span>{social.name}</span>
                </a>
              ))}
            </div>

            {/* Keyboard hint */}
            <p className="mt-5 text-[10px] font-mono text-white/25 leading-relaxed">
              Press <kbd className="px-1 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/50">?</kbd>{" "}
              anywhere for shortcuts
            </p>
          </div>
        </div>

        {/* Tech stack badges row */}
        <div className="pt-8 border-t border-white/5 flex flex-wrap items-center gap-2 justify-center mb-6">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/30 mr-1">
            Built with
          </span>
          {techStack.map((t) => (
            <span
              key={t.name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md
                         bg-white/[0.03] border border-white/[0.07]
                         text-[10px] font-mono text-white/55
                         hover:text-white/90 hover:border-white/15
                         transition-colors cursor-default"
            >
              <span className="text-[9px] opacity-70">{t.icon}</span>
              {t.name}
            </span>
          ))}
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs font-mono">
            &copy; {new Date().getFullYear()} Maxwell Nixon. All rights reserved.
          </p>
          <p className="text-white/20 text-xs font-mono">
            Hosted on Vercel · Updated continuously
          </p>
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
      <Navbar links={homeNavLinks} />
      <main>
        <HeroSection />
        <div className="section-divider" />
        <LiveDataSection />
        <div className="section-divider" />
        <AboutSection />
        <div className="section-divider" />
        <ProjectsSection />
        <div className="section-divider" />
        <GitHubSection />
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
