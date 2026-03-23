"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { GrokStarfield } from "@/components/GrokStarfield";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { CryptoTicker } from "@/components/widgets/CryptoTicker";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.15] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <motion.div animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center">
              <span className="text-xs font-bold gradient-text">M</span>
            </div>
          </div>
          <span className="text-base font-semibold tracking-wide text-white/90 hover:text-white transition-colors hidden sm:inline">
            maxwellnixon<span className="text-cyan-400">.</span>com
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link href="/tools" className="px-4 py-2 text-sm font-medium tracking-wider uppercase text-white/70 hover:text-white transition-colors font-mono">
            Tools
          </Link>
          <Link href="/contact" className="px-4 py-2 text-sm font-medium tracking-wider uppercase text-white/70 hover:text-white transition-colors font-mono">
            Contact
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

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

function HeroSection() {
  const [time, setTime] = useState("");
  const [rgbMode, setRgbMode] = useState<"off" | "sweep" | "pulse" | "pick">("off");
  const [customColor, setCustomColor] = useState("#06b6d4");
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -60]);

  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "America/New_York"
    }).format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const getGradient = () => {
    if (rgbMode === "pick") {
      return `linear-gradient(135deg, ${customColor}, ${customColor}cc)`;
    } else if (rgbMode === "sweep") {
      return "linear-gradient(90deg, #ff0080 0%, #ff8c00 25%, #40e0d0 50%, #9370db 75%, #ff0080 100%)";
    } else if (rgbMode === "pulse") {
      return "linear-gradient(135deg, #ff0080, #40e0d0, #9370db)";
    }
    return "linear-gradient(135deg, #06b6d4, #8b5cf6)";
  };

  const getBackgroundSize = () => {
    if (rgbMode === "sweep") return "300% 100%";
    if (rgbMode === "pulse") return "200% 200%";
    return "100% 100%";
  };

  // Animation only when mode is active
  const getTextAnimation = () => {
    if (rgbMode === "sweep") {
      return { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] };
    } else if (rgbMode === "pulse") {
      return { backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] };
    }
    return {};
  };

  const getTextTransition = () => {
    if (rgbMode === "sweep") {
      return { duration: 3, repeat: Infinity, ease: "linear" };
    } else if (rgbMode === "pulse") {
      return { duration: 4, repeat: Infinity, ease: "easeInOut" };
    }
    return {};
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="mesh-gradient-hero" />
      
      <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }} className="mb-8">
          <WeatherWidget />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
          className="flex items-center gap-4 mb-8 sm:mb-10">
          <motion.span animate={{ boxShadow: ["0 0 8px var(--accent-cyan)", "0 0 20px var(--accent-cyan)", "0 0 8px var(--accent-cyan)"] }}
            transition={{ duration: 3, repeat: Infinity }} className="status-dot" />
          <span className="terminal-prompt font-mono text-xs sm:text-sm text-white/80">
            {time ? `EST ${time}` : "loading..."}<span className="text-white/40 mx-2">·</span>Southampton, NJ
          </span>
        </motion.div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ 
              opacity: 1, 
              y: 0,
              ...(rgbMode === "sweep" || rgbMode === "pulse" ? getTextAnimation() : {})
            }}
            transition={{ 
              opacity: { duration: 1.1, delay: 0.5 },
              y: { duration: 1.1, delay: 0.5 },
              ...(rgbMode === "sweep" || rgbMode === "pulse" ? { backgroundPosition: getTextTransition() } : {})
            }}
            className="font-bold text-[clamp(2.2rem,8vw,6rem)] leading-[0.95] tracking-tight w-fit"
            style={{
              backgroundImage: getGradient(),
              backgroundSize: getBackgroundSize(),
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              display: "inline-block",
              willChange: rgbMode === "sweep" || rgbMode === "pulse" ? "background-position" : "auto",
            }}>
            Maxwell Nixon
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => setRgbMode(rgbMode === "sweep" ? "off" : "sweep")}
              className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase border rounded-md transition-all ${
                rgbMode === "sweep" 
                  ? "bg-gradient-to-r from-red-500 to-blue-500 border-transparent text-white" 
                  : "bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/40 text-white/70 hover:text-white"
              }`}>
              SWEEP
            </button>
            <button 
              onClick={() => setRgbMode(rgbMode === "pulse" ? "off" : "pulse")}
              className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase border rounded-md transition-all ${
                rgbMode === "pulse" 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white" 
                  : "bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/40 text-white/70 hover:text-white"
              }`}>
              RGB
            </button>
            <div className="relative">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setRgbMode("pick");
                }}
                className="absolute opacity-0 w-full h-full cursor-pointer"
              />
              <button 
                className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase border rounded-md transition-all ${
                  rgbMode === "pick" 
                    ? "border-transparent text-white" 
                    : "bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/40 text-white/70 hover:text-white"
                }`}
                style={rgbMode === "pick" ? { background: customColor } : {}}>
                PICK
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.65 }}
            className="font-bold text-[clamp(1.8rem,6vw,4.5rem)] leading-[0.95] tracking-tight text-white/60">
            Engineer<span className="gradient-text"> · </span>Designer<span className="gradient-text"> · </span>Builder
          </motion.div>
        </div>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.85 }}
          className="mt-8 max-w-xl text-white/70 text-base sm:text-lg leading-relaxed">
          Full-stack architect building at the intersection of code, design, and intelligence systems. Crafting premium software, tools, and experiments.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.0 }} className="mt-10 flex flex-wrap gap-4">
          <Link href="/tools" className="glow-btn glow-btn-filled">
            <span>Explore Tools</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link href="/contact" className="glow-btn">
            <span>Get in Touch</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <path d="m22 6-10 7L2 6"/>
            </svg>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

function LiveDataSection() {
  return (
    <AnimatedSection className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16">
          <span className="terminal-prompt font-mono text-sm text-white/70">live_data</span>
          <h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">Real-Time Intelligence</h2>
          <p className="mt-4 text-white/60 max-w-2xl">Live weather forecast and cryptocurrency market data</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <WeatherWidget />
          <CryptoTicker />
        </div>
      </div>
    </AnimatedSection>
  );
}

function AboutSection() {
  return (
    <AnimatedSection className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-[1fr_2fr] gap-10 md:gap-16">
        <div>
          <span className="terminal-prompt font-mono text-sm text-white/70">about</span>
          <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 h-px bg-gradient-to-r from-cyan-400 to-transparent opacity-40" />
        </div>
        <div className="space-y-6">
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-white">
            Building bridges between <span className="gradient-text">code, design,</span> and <span className="gradient-text-warm">curiosity.</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed">
            I'm a full-stack architect and product designer crafting premium software experiences. From intelligence middleware to dark-luxury interfaces — I build things that feel as good as they work.
          </p>
          <p className="text-white/70 leading-relaxed">
            When I'm not shipping code, you'll find me deep in sim racing setups, tinkering with smart home automation, or extracting custom audio for game mods.
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}

function ProjectsSection() {
  const projects = [
    {
      title: "Developer Tools",
      description: "Full suite of utilities: JSON formatter, Base64 encoder, regex tester, and more.",
      href: "/tools",
      tags: ["Utilities", "Developer"],
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      title: "Contact Hub",
      description: "Get in touch via email, GitHub, or explore my socials.",
      href: "/contact",
      tags: ["Connect", "Social"],
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <AnimatedSection className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16">
          <span className="terminal-prompt font-mono text-sm text-white/70">projects</span>
          <h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">What I Build</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Link key={project.href} href={project.href}>
              <motion.div whileHover={{ y: -4 }} className="glass-card p-8 h-full cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.gradient} mb-6 flex items-center justify-center text-2xl`}>
                  {project.href === "/tools" ? "🛠️" : "📧"}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-white/60 leading-relaxed mb-4">{project.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/70 border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function StackSection() {
  const stack = [
    { name: "React & Next.js", icon: "⚛️" },
    { name: "TypeScript", icon: "📘" },
    { name: "Node.js", icon: "🟢" },
    { name: "Tailwind CSS", icon: "🎨" },
    { name: "Framer Motion", icon: "✨" },
    { name: "Python", icon: "🐍" },
  ];

  return (
    <AnimatedSection className="relative py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16">
          <span className="terminal-prompt font-mono text-sm text-white/70">stack</span>
          <h2 className="mt-4 font-bold text-3xl sm:text-4xl text-white">Tech I Use</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stack.map((tech, i) => (
            <motion.div key={tech.name} initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center">
              <div className="text-4xl mb-3">{tech.icon}</div>
              <div className="text-sm text-white/80 font-medium">{tech.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function Footer() {
  return (
    <footer className="relative py-16 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center">
          <p className="text-white/50 text-sm font-mono">
            © {new Date().getFullYear()} Maxwell Nixon · Built with Next.js & Framer Motion
          </p>
          <p className="text-white/30 text-xs mt-2 font-mono">
            Southampton, NJ · mnixon112@outlook.com
          </p>
        </div>
      </div>
    </footer>
  );
}

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
        <StackSection />
      </main>
      <Footer />
    </>
  );
}
