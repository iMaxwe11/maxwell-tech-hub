"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════
   GROK-STYLE STARFIELD — Replaces all particle effects
   ═══════════════════════════════════════════ */
function GrokStarfield() {
  const [stars, setStars] = useState<Array<{x:number;y:number;size:number;opacity:number;speed:number}>>([]);
  
  useEffect(() => {
    // Generate stars with varying sizes and speeds for depth effect
    const newStars = Array.from({ length: 150 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5, // 0.5px to 2.5px
      opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
      speed: Math.random() * 20 + 15, // 15s to 35s animation
    }));
    setStars(newStars);
  }, []);

  if (stars.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: star.speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Weather Widget ──────────────────── */
function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Using Open-Meteo - completely free, no API key, very accurate
    // Location: Sicklerville, NJ (39.7526, -74.9749)
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=39.7526&longitude=-74.9749&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/New_York'
        );
        const data = await res.json();
        setWeather(data);
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 min
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "🌨️";
    if (code <= 82) return "🌧️";
    if (code <= 86) return "🌨️";
    return "⛈️";
  };

  if (loading || error || !weather) return null;

  const temp = Math.round(weather.current.temperature_2m);
  const feelsLike = Math.round(weather.current.apparent_temperature);
  const humidity = weather.current.relative_humidity_2m;
  const windSpeed = Math.round(weather.current.wind_speed_10m);
  const icon = getWeatherIcon(weather.current.weather_code);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      className="glass-card p-4 flex items-center gap-4"
    >
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <div className="text-2xl font-bold font-[family-name:var(--font-heading)] text-white">
          {temp}°F
        </div>
        <div className="text-xs text-white/60 font-[family-name:var(--font-mono)]">
          Feels like {feelsLike}° · {humidity}% humidity
        </div>
      </div>
      <div className="text-right text-xs text-white/50 font-[family-name:var(--font-mono)]">
        <div>{windSpeed} mph</div>
        <div className="text-[0.65rem] mt-0.5">Sicklerville, NJ</div>
      </div>
    </motion.div>
  );
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.15] shadow-[0_4px_20px_rgba(0,0,0,0.5)]" : "bg-transparent"}`}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center">
              <span className="text-xs font-bold font-[family-name:var(--font-heading)] gradient-text">M</span>
            </div>
          </div>
          <span className="text-base font-medium tracking-wide text-white/90 group-hover:text-white transition-colors duration-500 hidden sm:inline font-semibold">
            maxwellnixon<span className="text-[var(--accent-cyan)]">.</span>com
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}
              className="px-4 py-2 text-sm font-medium tracking-wider uppercase text-white/70 hover:text-white transition-colors duration-400 font-[family-name:var(--font-mono)]">
              {link.label}
            </Link>
          ))}
          <div className="ml-3 h-4 w-px bg-white/[0.15]" />
          <a href="https://github.com/iMaxwe11" target="_blank" rel="noopener noreferrer"
            className="ml-3 px-4 py-2 text-sm text-white/70 hover:text-[var(--accent-cyan)] transition-colors duration-400" aria-label="GitHub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white/70" aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.15]">
            <div className="px-6 py-4 flex flex-col gap-2">
              {links.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}>
                  <Link href={link.href} onClick={() => setMobileOpen(false)}
                    className="py-3 text-sm text-white/70 hover:text-white transition-colors font-[family-name:var(--font-mono)] block">
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
        {/* Weather Widget - Top Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mb-8"
        >
          <WeatherWidget />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="flex items-center gap-4 mb-8 sm:mb-10">
          <motion.span animate={{ boxShadow: ["0 0 8px var(--accent-cyan)", "0 0 20px var(--accent-cyan)", "0 0 8px var(--accent-cyan)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] }} className="status-dot" />
          <span className="terminal-prompt font-[family-name:var(--font-mono)] text-xs sm:text-sm text-white/80">
            {time ? `EST ${time}` : "loading..."}<span className="text-white/40 mx-2">·</span>Southampton, NJ
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
                className={`px-3 py-1.5 rounded-lg text-[0.65rem] font-medium font-[family-name:var(--font-mono)] uppercase tracking-wider transition-all duration-700 ${headerMode === m.key ? "bg-white/[0.10] text-white border border-white/[0.25] shadow-[0_0_12px_rgba(0,229,255,0.08)]" : "bg-white/[0.04] text-white/60 border border-white/[0.10] hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.15]"}`}>
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
            className="font-[family-name:var(--font-heading)] text-[clamp(1.8rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-white/60">
            Engineer<span className="gradient-text"> · </span>Designer<span className="gradient-text"> · </span>Builder
          </motion.div>
        </div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-8 max-w-xl text-white/70 text-base sm:text-lg leading-relaxed">
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
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40 font-[family-name:var(--font-mono)]">Scroll</span>
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
          <span className="terminal-prompt font-[family-name:var(--font-mono)] text-sm text-white/70">about</span>
          <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-4 h-px bg-gradient-to-r from-[var(--accent-cyan)] to-transparent opacity-40" />
        </div>
        <div className="space-y-6">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-white">
            Building bridges between <span className="gradient-text">code, design,</span> and <span className="gradient-text-warm">curiosity.</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl">
            I&apos;m a full-stack architect and product designer crafting premium software experiences. From intelligence middleware and authentication systems to dark-luxury interfaces — I build things that feel as good as they work.
          </p>
          <p className="text-white/70 leading-relaxed max-w-2xl">
            When I&apos;m not shipping code, you&apos;ll find me deep in sim racing setups, tinkering with smart home automation, or extracting custom audio for game mods. This hub is my living interface — a place for tools, experiments, and everything in between.
          </p>
          <div className="pt-6 flex flex-wrap gap-6 sm:gap-8">
            {[{ value: "Full-Stack", label: "Architecture" }, { value: "React · Node", label: "Primary Stack" }, { value: "Dark Luxury", label: "Design Language" }].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }} whileHover={{ y: -3 }}>
                <div className="text-sm font-semibold text-white font-[family-name:var(--font-mono)]">{stat.value}</div>
                <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

// ... Continue with remaining sections (Projects, Stack, Music, Contact, Footer)
// Due to length, I'll create a separate file with the complete code

export default function Home() {
  return (
    <>
      <GrokStarfield />
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      <Navbar />
      <main>
        <HeroSection />
        <div className="section-divider" />
        <AboutSection />
        {/* Additional sections will be added */}
      </main>
    </>
  );
}
