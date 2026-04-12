"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home", hash: false },
  { href: "/#projects", label: "Projects", hash: true },
  { href: "/tools", label: "Tools", hash: false },
  { href: "/space", label: "Space", hash: false },
  { href: "/weather", label: "Weather", hash: false },
  { href: "/news", label: "News", hash: false },
  { href: "/play", label: "Arcade", hash: false },
  { href: "/contact", label: "Contact", hash: false },
];

const SOCIALS = [
  { name: "GitHub", href: "https://github.com/iMaxwe11", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
  { name: "LinkedIn", href: "https://linkedin.com/in/maxwell-nixon-90351627a", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { name: "Email", href: "mailto:mnixon112@outlook.com", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg> },
];

interface NavbarProps {
  /** Optional breadcrumb trail, e.g. ["arcade", "snake"] */
  breadcrumb?: string[];
  /** Accent color for the breadcrumb, defaults to cyan */
  accent?: string;
}

export function Navbar({ breadcrumb, accent = "#06b6d4" }: NavbarProps = {}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("#")[0]);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          : "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.04]"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo + breadcrumb */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 opacity-30 group-hover:opacity-50 transition-opacity"
            />
            <div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center">
              <span className="text-xs font-bold gradient-text">M</span>
            </div>
          </div>
          <div className="flex items-center gap-0 text-sm font-mono">
            <span className="text-white/90 hidden sm:inline font-semibold tracking-wide">
              maxwellnixon<span style={{ color: accent }}>.</span>com
            </span>
            {breadcrumb && breadcrumb.length > 0 && (
              <span className="hidden sm:inline text-white/30">
                {breadcrumb.map((crumb, i) => (
                  <span key={i}>
                    <span className="mx-1.5">/</span>
                    <span className="text-white/50">{crumb}</span>
                  </span>
                ))}
              </span>
            )}
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.filter(l => !l.hash).map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase font-mono rounded-md transition-all ${
                isActive(l.href)
                  ? "text-white bg-white/[0.06]"
                  : "text-white/50 hover:text-white hover:bg-white/[0.03]"
              }`}>
              {l.label}
            </Link>
          ))}
          <div className="ml-3 flex items-center gap-1 pl-3 border-l border-white/10">
            {SOCIALS.map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-cyan-400 transition-colors p-1.5" aria-label={s.name}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white/70 hover:text-white p-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a]/98 backdrop-blur-xl border-b border-white/10 px-4 pb-4 overflow-hidden"
          >
            {NAV_LINKS.filter(l => !l.hash).map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className={`block py-3 text-sm font-medium tracking-wider uppercase font-mono border-b border-white/5 last:border-0 transition-colors ${
                  isActive(l.href) ? "text-cyan-400" : "text-white/60 hover:text-white"
                }`}>
                {l.label}
              </Link>
            ))}
            <div className="flex gap-4 pt-3">
              {SOCIALS.map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="text-white/40 hover:text-cyan-400 transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
