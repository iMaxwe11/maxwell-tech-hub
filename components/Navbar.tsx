"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SocialIcon } from "@/components/SocialIcon";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { defaultNavLinks, siteConfig, socialLinks, type NavLink } from "@/lib/site-config";

interface NavbarProps {
  /** Optional breadcrumb trail, e.g. ["arcade", "snake"] */
  breadcrumb?: string[];
  /** Accent color override for the breadcrumb/dot. Defaults to the live theme primary. */
  accent?: string;
  /** Optional nav links override, useful for home section anchors */
  links?: NavLink[];
}

// Shared focus ring — uses theme-primary-rgb so it follows the active theme.
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--theme-primary-rgb),0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]";

// Secondary routes for the Explore dropdown — pages that are real, but sit
// below the primary nav. Icons are inline SVG for zero-flicker server render.
const EXPLORE_ITEMS: { href: string; label: string; desc: string; icon: string }[] = [
  { href: "/projects", label: "Projects", desc: "Live, open-source, and pro work", icon: "🗂️" },
  { href: "/now", label: "Now", desc: "What I’m working on this week", icon: "⏱️" },
  { href: "/space", label: "Space", desc: "ISS, launches, Mars photos", icon: "🚀" },
  { href: "/weather", label: "Weather", desc: "Local forecast & radar", icon: "🌦️" },
  { href: "/news", label: "News", desc: "Tech + world headlines", icon: "📰" },
  { href: "/blog", label: "Blog", desc: "Notes, ideas, writeups", icon: "✍️" },
  { href: "/status", label: "Status", desc: "Live uptime dashboard", icon: "📡" },
  { href: "/analytics", label: "Analytics", desc: "Site traffic & stats", icon: "📊" },
];

/**
 * Desktop “Explore” dropdown. Surfaces the secondary routes that are not in
 * the primary nav so people don’t have to dig through the footer to find them.
 */
function ExploreDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on route change, outside click, or Escape
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onMouse);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onMouse);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Active if the current route matches any secondary route
  const isActive = EXPLORE_ITEMS.some((item) => pathname.startsWith(item.href));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase font-mono rounded-md
                    inline-flex items-center gap-1.5 transition-colors transition-shadow touch-manipulation
                    ${FOCUS_RING}
                    ${
                      isActive || open
                        ? "text-white bg-white/[0.06]"
                        : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                    }`}
      >
        Explore
        <motion.svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="opacity-70"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            role="menu"
            aria-label="Explore the rest of the site"
            className="absolute right-0 mt-3 w-80 rounded-xl overflow-hidden z-[100]
                       bg-[#0a0a0a]/98 backdrop-blur-2xl border border-white/10
                       shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-2"
          >
            <p className="px-2.5 py-1.5 mb-1 border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-white/40">
              Everything else
            </p>
            <div className="grid grid-cols-2 gap-1">
              {EXPLORE_ITEMS.map((item) => {
                const itemActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className={`group flex items-start gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left ${FOCUS_RING} ${
                      itemActive
                        ? "bg-[rgba(var(--theme-primary-rgb),0.08)] text-[color:var(--theme-primary)]"
                        : "hover:bg-white/[0.04] text-white/70 hover:text-white"
                    }`}
                  >
                    <span className="text-base leading-none mt-0.5 shrink-0" aria-hidden>
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-tight">{item.label}</p>
                      <p className="text-[10px] font-mono text-white/35 mt-0.5 leading-tight truncate">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-white/5 mt-1 pt-1.5 px-2.5">
              <p className="text-[9px] font-mono text-white/25">
                Or press{" "}
                <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white/55">
                  ⌘K
                </kbd>{" "}
                to search everything
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesktopNavLink({ link, pathname }: { link: NavLink; pathname: string }) {
  const isHashLink = Boolean(link.hash);
  const isActive = !isHashLink && (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href));
  const className = `px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase font-mono rounded-md transition-colors transition-shadow touch-manipulation ${FOCUS_RING} ${
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

export function Navbar({ breadcrumb, accent, links = defaultNavLinks }: NavbarProps = {}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Resolve accent to the live theme primary unless explicitly overridden.
  const accentColor = accent ?? "var(--theme-primary)";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Auto-close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
        <Link
          href="/"
          className={`flex items-center gap-3 group rounded-lg touch-manipulation ${FOCUS_RING}`}
        >
          <div className="relative w-8 h-8">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-lg opacity-30 group-hover:opacity-60 transition-opacity"
              style={{
                background: "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
              }}
            />
            <div className="absolute inset-[2px] rounded-[6px] bg-[#050505] flex items-center justify-center">
              <span className="text-xs font-bold gradient-text">M</span>
            </div>
          </div>
          <div className="flex items-center gap-0 text-sm font-mono">
            <span className="text-white/90 hidden sm:inline font-semibold tracking-wide">
              {siteConfig.domain.replace(".com", "")}
              <span style={{ color: accentColor }}>.</span>com
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
          <ExploreDropdown />
          <div className="ml-3 flex items-center gap-2 pl-3 border-l border-white/10">
            <ThemeSwitcher />
            <div className="flex items-center gap-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-white/30 hover:text-[color:var(--theme-primary)] transition-colors p-1.5 rounded-md touch-manipulation ${FOCUS_RING}`}
                  aria-label={social.name}
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile hamburger + theme switcher */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`text-white/70 hover:text-white p-2 rounded-md touch-manipulation transition-colors ${FOCUS_RING}`}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer (slides in from the right, full-height, polished) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="md:hidden fixed inset-0 top-16 z-[55] bg-black/60 backdrop-blur-sm cursor-default"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:hidden fixed top-16 right-0 bottom-0 z-[60] w-[88vw] max-w-[360px]
                         bg-[#0a0a0a]/98 backdrop-blur-2xl border-l border-white/10
                         shadow-[-20px_0_60px_rgba(0,0,0,0.5)]
                         flex flex-col overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Links */}
              <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/35 mb-3 px-1">
                  Navigate
                </p>
                {links.map((link, i) => {
                  const isHash = Boolean(link.hash);
                  const isActive =
                    !isHash && (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href));
                  const baseCls = `flex items-center justify-between py-3.5 px-3 rounded-lg text-base font-medium
                                   transition-colors touch-manipulation ${FOCUS_RING} ${
                                     isActive
                                       ? "bg-[rgba(var(--theme-primary-rgb),0.08)] text-[color:var(--theme-primary)] border border-[rgba(var(--theme-primary-rgb),0.22)]"
                                       : "text-white/70 hover:text-white hover:bg-white/[0.04] border border-transparent"
                                   }`;
                  const inner = (
                    <>
                      <span>{link.label}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={isActive ? "opacity-70" : "opacity-30"}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </>
                  );
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i + 0.08, duration: 0.3 }}
                    >
                      {isHash ? (
                        <a href={link.href} className={baseCls} onClick={() => setMobileOpen(false)}>
                          {inner}
                        </a>
                      ) : (
                        <Link href={link.href} className={baseCls} onClick={() => setMobileOpen(false)}>
                          {inner}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}

                {/* Secondary — discovery routes that aren't in primary nav */}
                <div className="pt-5 mt-5 border-t border-white/5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-white/35 mb-3 px-1">
                    Also explore
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { href: "/projects", label: "Projects" },
                      { href: "/now", label: "Now" },
                      { href: "/space", label: "Space" },
                      { href: "/weather", label: "Weather" },
                      { href: "/news", label: "News" },
                      { href: "/blog", label: "Blog" },
                      { href: "/status", label: "Status" },
                      { href: "/analytics", label: "Analytics" },
                    ].map((r) => (
                      <Link
                        key={r.href}
                        href={r.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-3 py-2 rounded-md text-xs font-mono text-white/50 hover:text-white
                                    bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06]
                                    transition-colors ${FOCUS_RING}`}
                      >
                        {r.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>

              {/* Footer: socials + hint */}
              <div className="border-t border-white/10 px-5 py-4 bg-black/30">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/35 mb-3">
                  Connect
                </p>
                <div className="flex gap-3 mb-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08]
                                  text-white/60 hover:text-[color:var(--theme-primary)]
                                  hover:border-[rgba(var(--theme-primary-rgb),0.3)]
                                  flex items-center justify-center transition-colors ${FOCUS_RING}`}
                      aria-label={social.name}
                    >
                      <SocialIcon name={social.name} />
                    </a>
                  ))}
                </div>
                <p className="text-[10px] font-mono text-white/30">
                  Tap outside or swipe to close
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
