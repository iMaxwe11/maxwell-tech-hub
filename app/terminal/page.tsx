"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Globe, Mail, Phone } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { GrokStarfield } from "@/components/GrokStarfield";
import { siteConfig, socialLinks } from "@/lib/site-config";

type HistoryEntry =
  | { kind: "input"; text: string; cwd: string }
  | { kind: "output"; lines: ReactNode[] }
  | { kind: "error"; text: string };

const ASCII_BANNER = `
███╗   ███╗███╗   ██╗██╗  ██╗
████╗ ████║████╗  ██║╚██╗██╔╝
██╔████╔██║██╔██╗ ██║ ╚███╔╝
██║╚██╔╝██║██║╚██╗██║ ██╔██╗
██║ ╚═╝ ██║██║ ╚████║██╔╝ ██╗
╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
`.trim();

export default function TerminalPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [booted, setBooted] = useState(false);

  const cwd = "~";
  const prompt = `${siteConfig.githubUsername.toLowerCase()}@nixon:${cwd}$`;

  // Boot sequence (guarded against React StrictMode double-invocation)
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    const sequence: HistoryEntry[] = [
      { kind: "output", lines: [ASCII_BANNER] },
      {
        kind: "output",
        lines: [
          <span key="welcome" className="text-white/80">
            Welcome to maxwellnixon.com · Terminal v1.0.0
          </span>,
          <span key="date" className="text-white/40">
            Booted: {new Date().toLocaleString()}
          </span>,
          <span key="help" className="text-white/60">
            Type <span className="text-[color:var(--theme-primary)]">help</span>{" "}
            to see available commands, or click any link to navigate.
          </span>,
        ],
      },
    ];

    // Stagger boot lines and track timers for cleanup
    const timers: ReturnType<typeof setTimeout>[] = [];
    sequence.forEach((entry, i) => {
      const t = setTimeout(() => {
        setHistory((prev) => [...prev, entry]);
        if (i === sequence.length - 1) {
          timers.push(setTimeout(() => setBooted(true), 200));
        }
      }, i * 300);
      timers.push(t);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // Auto-scroll & focus
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (booted) inputRef.current?.focus();
  }, [booted]);

  const appendOutput = useCallback((lines: ReactNode[]) => {
    setHistory((prev) => [...prev, { kind: "output", lines }]);
  }, []);

  const appendError = useCallback((text: string) => {
    setHistory((prev) => [...prev, { kind: "error", text }]);
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      setHistory((prev) => [...prev, { kind: "input", text: trimmed, cwd }]);
      setCommandHistory((prev) => [trimmed, ...prev].slice(0, 50));
      setHistoryIdx(-1);

      const [cmd, ...args] = trimmed.split(/\s+/);
      const command = cmd.toLowerCase();

      switch (command) {
        case "help":
          appendOutput([
            <div key="help" className="space-y-1">
              <p className="text-white/80 mb-2">Available commands:</p>
              {[
                ["help", "show this help message"],
                ["whoami", "display user info"],
                ["about", "learn more about Maxwell"],
                ["projects", "list recent projects"],
                ["skills", "display tech stack"],
                ["contact", "show contact info"],
                ["social", "list social links"],
                ["cd <page>", "navigate to a page (projects, tools, blog, etc.)"],
                ["ls", "list pages on the site"],
                ["date", "print current date/time"],
                ["echo <text>", "echo text back"],
                ["banner", "show the ASCII banner"],
                ["matrix", "enter the matrix"],
                ["history", "show command history"],
                ["clear", "clear the terminal"],
                ["exit", "return home"],
              ].map(([c, d]) => (
                <div key={c} className="flex gap-4 text-sm">
                  <span className="text-[color:var(--theme-primary)] font-mono w-28 shrink-0">
                    {c}
                  </span>
                  <span className="text-white/60">{d}</span>
                </div>
              ))}
            </div>,
          ]);
          break;

        case "whoami":
          appendOutput([
            <span key="w" className="text-white/80">
              {siteConfig.name} — IT Systems Technician & Full-Stack Developer
            </span>,
            <span key="l" className="text-white/50 inline-flex items-center gap-2 flex-wrap">
              <MapPin size={12} strokeWidth={1.8} aria-hidden className="inline text-[color:var(--theme-primary)]" />
              {siteConfig.location}
              <span className="text-white/25">·</span>
              <Globe size={12} strokeWidth={1.8} aria-hidden className="inline text-[color:var(--theme-primary)]" />
              {siteConfig.domain}
            </span>,
          ]);
          break;

        case "about":
          appendOutput([
            <div key="about" className="max-w-2xl space-y-2 text-white/70 leading-relaxed">
              <p>
                Cloud-savvy IT technician and full-stack developer. I manage
                real-world infrastructure for businesses — from law firms to
                landscaping operations — and build automation tools, data
                pipelines, and self-hosted AI experiments in parallel.
              </p>
              <p className="text-white/50">
                When I&apos;m not shipping code, you&apos;ll find me deep in sim
                racing setups, smart home automation, or tuning custom PC
                hardware.
              </p>
            </div>,
          ]);
          break;

        case "projects":
          appendOutput([
            <div key="proj" className="space-y-1.5">
              {[
                ["Smart Data Pipeline", "FastAPI + Python + Docker ETL"],
                ["Developer Tools Hub", "35 client-side utilities"],
                ["Space & Launch Tracker", "NASA + SpaceDevs API dashboard"],
                ["News Feed Hub", "RSS-aggregated tech news"],
                ["Weather Dashboard", "Open-Meteo + Windy radar"],
                ["Neon Arcade", "5 canvas-based browser games"],
                ["Home Lab & AI", "Self-hosted LLaMA / Mistral on GPU"],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3 text-sm">
                  <span className="text-[color:var(--theme-primary)]">▸</span>
                  <div>
                    <span className="text-white font-medium">{title}</span>
                    <span className="text-white/40 ml-2">— {desc}</span>
                  </div>
                </div>
              ))}
              <p className="text-white/40 text-xs mt-2">
                Run <span className="text-[color:var(--theme-primary)]">cd projects</span> to see them on the home page.
              </p>
            </div>,
          ]);
          break;

        case "skills":
          appendOutput([
            <div key="s" className="max-w-xl">
              <div className="flex flex-wrap gap-2">
                {[
                  "Next.js", "TypeScript", "Python", "FastAPI", "Docker",
                  "Kubernetes", "AWS", "Azure", "Tailwind", "Active Directory",
                  "Windows Server", "GitHub Actions", "Bash", "PowerShell",
                ].map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded border border-white/10 bg-white/[0.03] text-[11px] font-mono text-white/60"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>,
          ]);
          break;

        case "contact":
          appendOutput([
            <div key="c" className="space-y-1 text-sm">
              <p className="text-white/70 inline-flex items-center gap-2">
                <Mail size={13} strokeWidth={1.8} aria-hidden className="text-[color:var(--theme-primary)]" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-[color:var(--theme-primary)] hover:underline"
                >
                  {siteConfig.email}
                </a>
              </p>
              <p className="text-white/70 inline-flex items-center gap-2">
                <Phone size={13} strokeWidth={1.8} aria-hidden className="text-[color:var(--theme-primary)]" />
                {siteConfig.phone}
              </p>
              <p className="text-white/70 inline-flex items-center gap-2">
                <MapPin size={13} strokeWidth={1.8} aria-hidden className="text-[color:var(--theme-primary)]" />
                {siteConfig.location}
              </p>
            </div>,
          ]);
          break;

        case "social":
          appendOutput([
            <div key="social" className="space-y-0.5 text-sm">
              {socialLinks.map((s) => (
                <p key={s.name} className="text-white/70">
                  {s.name}:{" "}
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--theme-primary)] hover:underline"
                  >
                    {s.handle}
                  </a>
                </p>
              ))}
            </div>,
          ]);
          break;

        case "ls":
          appendOutput([
            <div key="ls" className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm font-mono max-w-lg">
              {["home/", "projects/", "tools/", "space/", "weather/", "news/", "blog/", "status/", "play/", "terminal/", "now/", "analytics/", "contact/"].map((p) => (
                <span key={p} className="text-[color:var(--theme-primary)]">
                  {p}
                </span>
              ))}
            </div>,
          ]);
          break;

        case "cd": {
          const target = (args[0] || "").toLowerCase().replace(/\/$/, "");
          const routes: Record<string, string> = {
            home: "/",
            "~": "/",
            projects: "/projects",
            tools: "/tools",
            space: "/space",
            weather: "/weather",
            news: "/news",
            blog: "/blog",
            status: "/status",
            play: "/play",
            arcade: "/play",
            contact: "/contact",
            experience: "/#experience",
            analytics: "/analytics",
            terminal: "/terminal",
            now: "/now",
          };
          if (!target) {
            appendError("cd: missing operand. Try 'cd tools' or 'ls'.");
          } else if (routes[target]) {
            const dest = routes[target];
            appendOutput([
              <span key="cd" className="text-white/60">
                Navigating to {dest}…
              </span>,
            ]);
            setTimeout(() => {
              // App Router's router.push does NOT scroll to hash anchors, so
              // fall back to a native href assignment for "/#section" targets
              // and only use the router for real route pushes.
              if (dest.includes("#")) {
                window.location.href = dest;
              } else {
                router.push(dest);
              }
            }, 500);
          } else {
            appendError(`cd: no such page: ${target}`);
          }
          break;
        }

        case "date":
          appendOutput([
            <span key="d" className="text-white/70">
              {new Date().toString()}
            </span>,
          ]);
          break;

        case "echo":
          appendOutput([
            <span key="e" className="text-white/70">
              {args.join(" ")}
            </span>,
          ]);
          break;

        case "banner":
          appendOutput([ASCII_BANNER]);
          break;

        case "matrix":
          appendOutput([
            <span key="m" className="text-green-400">
              The Matrix has you… try the Konami code to enter.
            </span>,
          ]);
          break;

        case "history":
          appendOutput([
            <div key="h" className="space-y-0.5 text-sm font-mono">
              {commandHistory
                .slice()
                .reverse()
                .map((c, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-white/30">
                      {String(i + 1).padStart(3, " ")}
                    </span>
                    <span className="text-white/60">{c}</span>
                  </div>
                ))}
            </div>,
          ]);
          break;

        case "clear":
        case "cls":
          setHistory([]);
          break;

        case "exit":
        case "logout":
          appendOutput([
            <span key="e" className="text-white/60">
              Logging out… returning to home.
            </span>,
          ]);
          setTimeout(() => router.push("/"), 800);
          break;

        case "sudo":
          appendError(
            "Permission denied. You're not in the sudoers file. This incident will be reported. 😉"
          );
          break;

        case "rm":
          appendError(
            "rm: refusing to remove everything. Nice try. 😏"
          );
          break;

        default:
          appendError(
            `${command}: command not found. Type 'help' for a list of commands.`
          );
      }
    },
    [appendError, appendOutput, cwd, router, commandHistory]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, commandHistory.length - 1);
      if (next >= 0 && commandHistory[next]) {
        setInput(commandHistory[next]);
        setHistoryIdx(next);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIdx - 1;
      if (next < 0) {
        setInput("");
        setHistoryIdx(-1);
      } else {
        setInput(commandHistory[next]);
        setHistoryIdx(next);
      }
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setHistory([]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const commands = [
        "help", "whoami", "about", "projects", "skills", "contact",
        "social", "cd", "ls", "date", "echo", "banner", "matrix",
        "history", "clear", "exit",
      ];
      const match = commands.find((c) => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  return (
    <>
      <GrokStarfield />
      <Navbar breadcrumb={["terminal"]} />
      <main className="min-h-screen pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 space-y-1">
            <span className="terminal-prompt font-mono text-sm text-white/70">
              / terminal
            </span>
            <h1 className="font-bold text-3xl sm:text-4xl text-white">
              Interactive <span className="theme-accent-gradient">Shell</span>
            </h1>
            <p className="text-white/50 text-sm max-w-2xl">
              Navigate the site command-line style. Type{" "}
              <span className="text-[color:var(--theme-primary)] font-mono">
                help
              </span>{" "}
              to get started. Arrow keys for history, Tab for completion.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-black/60 border-b border-white/5 backdrop-blur-sm">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <span className="text-[11px] font-mono text-white/40 mx-auto">
                {prompt} — term://maxwellnixon.com
              </span>
              <Link
                href="/"
                className="text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors"
              >
                exit
              </Link>
            </div>

            {/* Terminal body */}
            <div className="relative bg-[#0a0a0f] text-white font-mono text-sm">
              <div className="crt-scanlines" />
              <div className="crt-vignette" />
              <div
                ref={scrollRef}
                className="relative z-[3] min-h-[60vh] max-h-[72vh] overflow-y-auto p-5 space-y-2"
              >
                {history.map((entry, i) => {
                  if (entry.kind === "input") {
                    return (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-[color:var(--theme-primary)] whitespace-nowrap select-none">
                          {prompt}
                        </span>
                        <span className="text-white/90 break-all">
                          {entry.text}
                        </span>
                      </div>
                    );
                  }
                  if (entry.kind === "error") {
                    return (
                      <div key={i} className="text-red-400 text-sm pl-0.5">
                        {entry.text}
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="pl-0.5">
                      {entry.lines.map((line, j) => (
                        <div key={j} className="whitespace-pre-wrap break-words">
                          {line}
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Active prompt */}
                {booted && (
                  <div className="flex gap-2 items-start">
                    <span className="text-[color:var(--theme-primary)] whitespace-nowrap select-none">
                      {prompt}
                    </span>
                    <div className="flex-1 relative flex items-center">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className="flex-1 bg-transparent text-white/90 outline-none border-none font-mono text-sm caret-transparent"
                        aria-label="Terminal command input"
                      />
                      {/* Blinking cursor positioned after text */}
                      <span
                        className="terminal-cursor absolute pointer-events-none"
                        style={{
                          left: `${input.length * 0.55}em`,
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Helper hints */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3 text-xs">
            <div className="glass-card p-3">
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                Shortcuts
              </p>
              <p className="text-white/70">
                <span className="text-[color:var(--theme-primary)] font-mono">↑</span>{" "}
                <span className="text-[color:var(--theme-primary)] font-mono">↓</span>{" "}
                history ·{" "}
                <span className="text-[color:var(--theme-primary)] font-mono">Tab</span>{" "}
                complete ·{" "}
                <span className="text-[color:var(--theme-primary)] font-mono">
                  Ctrl+L
                </span>{" "}
                clear
              </p>
            </div>
            <div className="glass-card p-3">
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                Navigate
              </p>
              <p className="text-white/70">
                <span className="font-mono text-[color:var(--theme-primary)]">
                  cd tools
                </span>
                ,{" "}
                <span className="font-mono text-[color:var(--theme-primary)]">
                  cd projects
                </span>
                ,{" "}
                <span className="font-mono text-[color:var(--theme-primary)]">
                  cd blog
                </span>
              </p>
            </div>
            <div className="glass-card p-3">
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                Try these
              </p>
              <p className="text-white/70 font-mono">
                help · whoami · projects · matrix
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
