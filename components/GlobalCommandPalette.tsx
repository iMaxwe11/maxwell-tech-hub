"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { defaultNavLinks, footerNavLinks, homeNavLinks, siteConfig, socialLinks } from "@/lib/site-config";
import { THEMES } from "@/components/ThemeSwitcher";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  group?: string;
  href?: string;
  external?: boolean;
  action?: () => void;
}

const THEME_STORAGE_KEY = "mnx-theme";

function applyTheme(themeId: string) {
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty("--theme-primary", theme.primary);
  root.style.setProperty("--theme-secondary", theme.secondary);
  root.style.setProperty("--theme-primary-rgb", theme.primaryRgb);
  root.style.setProperty("--theme-secondary-rgb", theme.secondaryRgb);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: themeId }));
  } catch {
    /* ignore */
  }
}

export function GlobalCommandPalette() {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const commands = useMemo<CommandItem[]>(() => {
    // Dedupe by href — default + footer nav cover everything, but overlap.
    const allRoutes = new Map<string, { label: string; hint: string }>();
    for (const link of [...defaultNavLinks, ...footerNavLinks]) {
      if (!allRoutes.has(link.href)) {
        allRoutes.set(link.href, { label: link.label, hint: link.href });
      }
    }
    const routeCommands: CommandItem[] = Array.from(allRoutes.entries()).map(([href, v]) => ({
      id: `route-${href}`,
      label: v.label,
      hint: v.hint,
      group: "Navigate",
      href,
    }));

    const anchorCommands: CommandItem[] = homeNavLinks
      .filter((link) => link.hash)
      .map((link) => ({
        id: `anchor-${link.href}`,
        label: link.label,
        hint: "Jump to section (home page)",
        group: "Navigate",
        href: `/${link.href}`,
      }));

    const actionCommands: CommandItem[] = [
      {
        id: "resume",
        label: "Download Resume",
        hint: "Open the latest resume file",
        group: "Actions",
        href: siteConfig.resumePath,
        external: true,
      },
      {
        id: "email",
        label: "Email Maxwell",
        hint: siteConfig.email,
        group: "Actions",
        href: `mailto:${siteConfig.email}`,
        external: true,
      },
      ...socialLinks
        .filter((social) => social.name !== "Email")
        .map((social) => ({
          id: `social-${social.name.toLowerCase()}`,
          label: social.name,
          hint: social.label,
          group: "Actions",
          href: social.href,
          external: true,
        })),
      {
        id: "top",
        label: "Back to Top",
        hint: "Scroll to the top of the page",
        group: "Actions",
        action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      },
    ];

    const themeCommands: CommandItem[] = THEMES.map((t) => ({
      id: `theme-${t.id}`,
      label: `Switch theme → ${t.name}`,
      hint: t.label,
      group: "Theme",
      action: () => applyTheme(t.id),
    }));

    return [...routeCommands, ...anchorCommands, ...actionCommands, ...themeCommands];
  }, [pathname]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return commands;
    }

    return commands.filter((command) => {
      const haystack = `${command.label} ${command.hint}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [commands, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (pathname === "/tools") {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  const runCommand = (command: CommandItem) => {
    setOpen(false);

    if (command.action) {
      command.action();
      return;
    }

    if (!command.href) {
      return;
    }

    if (command.href.startsWith("mailto:")) {
      window.location.href = command.href;
      return;
    }

    if (command.external) {
      window.open(command.href, "_blank", "noopener,noreferrer");
      return;
    }

    if (command.href.startsWith("/#")) {
      window.location.href = command.href;
      return;
    }

    router.push(command.href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xl px-4 py-10"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto glass-card overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Global command palette"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 transition-colors focus-within:border-cyan-400/40 focus-within:bg-white/[0.03] focus-within:ring-2 focus-within:ring-cyan-400/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-300">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  name="global-command-search"
                  autoComplete="off"
                  spellCheck={false}
                  aria-autocomplete="list"
                  placeholder="Jump to a page or action…"
                  className="w-full bg-transparent text-white placeholder:text-white/30 text-sm font-mono focus:outline-none"
                />
                <span className="text-[10px] font-mono text-white/25 border border-white/10 rounded-md px-2 py-1">ESC</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {filteredCommands.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-white/60 text-sm">No commands match &quot;{query}&quot;.</p>
                </div>
              ) : (
                filteredCommands.slice(0, 15).map((command) => (
                  <button
                    key={command.id}
                    type="button"
                    onClick={() => runCommand(command)}
                    className="w-full rounded-xl border border-transparent hover:border-[rgba(var(--theme-primary-rgb),0.2)] hover:bg-white/[0.03] focus-visible:border-[rgba(var(--theme-primary-rgb),0.35)] focus-visible:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--theme-primary-rgb),0.25)] transition-colors transition-shadow px-3 py-3 text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {command.group && (
                            <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 shrink-0">
                              {command.group}
                            </span>
                          )}
                          <p className="text-sm text-white font-medium truncate">{command.label}</p>
                        </div>
                        <p className="text-[11px] font-mono text-white/35 mt-1 truncate">{command.hint}</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 shrink-0">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-white/[0.06] px-5 py-3 flex items-center justify-between text-[10px] font-mono text-white/25">
              <span>{pathname === "/tools" ? "Tools keeps Ctrl/Cmd+K for local search" : "Press Ctrl/Cmd+K to open from anywhere"}</span>
              <span>{siteConfig.domain}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
