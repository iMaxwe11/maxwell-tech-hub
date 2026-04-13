"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SocialIcon } from "@/components/SocialIcon";
import { defaultNavLinks, siteConfig, socialLinks, type NavLink } from "@/lib/site-config";

interface NavbarProps {
  /** Optional breadcrumb trail, e.g. ["arcade", "snake"] */
  breadcrumb?: string[];
  /** Accent color for the breadcrumb, defaults to cyan */
  accent?: string;
  /** Optional nav links override, useful for home section anchors */
  links?: NavLink[];
}

function DesktopNavLink({ link, pathname }: { link: NavLink; pathname: string }) {
  const isHashLink = Boolean(link.hash);
  const isActive = !isHashLink && (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href));
  const className = `px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase font-mono rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
    isActive
      ? "text-white bg-white/[0.06]"
      : "text-white/50 hover:text-white hover:bg-white/[0.03]"
  }`;

  if (isHashLink) {
    return (
      <a href={link.href} className={className}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className} aria-current={isActive ? "page" : undefined}>
      {link.label}
    </Link>
  );
}

export function Navbar({ breadcrumb, accent = "#06b6d4", links = defaultNavLinks }: NavbarProps = {}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

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
              {siteConfig.domain.replace(".com", "")}
              <span style={{ color: accent }}>.</span>com
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
          {links.map((link) => (
            <DesktopNavLink key={link.href} link={link} pathname={pathname} />
          ))}
          <div className="ml-3 flex items-center gap-1 pl-3 border-l border-white/10">
            {socialLinks.map((social) => (
              <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-cyan-400 transition-colors p-1.5" aria-label={social.name}>
                <SocialIcon name={social.name} />
              </a>
            ))}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white/70 hover:text-white p-2"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
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
            {links.map((link) =>
              link.hash ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm font-medium tracking-wider uppercase font-mono border-b border-white/5 last:border-0 transition-colors text-white/60 hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 text-sm font-medium tracking-wider uppercase font-mono border-b border-white/5 last:border-0 transition-colors ${
                    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
                      ? "text-cyan-400"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="flex gap-4 pt-3">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer"
                  className="text-white/40 hover:text-cyan-400 transition-colors"
                  aria-label={social.name}
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
