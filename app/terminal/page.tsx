"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════
   VIRTUAL FILE SYSTEM
   ═══════════════════════════════════════════ */
type Node = { type: "dir" | "file"; content?: string; children?: Record<string, Node> };

const FS: Record<string, Node> = {
  home: {
    type: "dir",
    children: {
      "readme.txt": { type: "file", content: "Welcome to Maxwell's terminal. Try 'help' to see commands. Explore ~/projects and ~/contact." },
      projects: {
        type: "dir",
        children: {
          "hub.md": { type: "file", content: "# Interactive Hub v5\nNext.js 15.0.8 + Tailwind + Framer Motion\nObsidian Luxe Edition — Supercharged." },
          "obsidian.txt": { type: "file", content: "Obsidian Echoes — a terminal mystery concept.\nBuilt with love and way too much caffeine." },
          "ouija.txt": { type: "file", content: "Ouija Platform — Full-stack SaaS\nAuth · Payments · Dark-luxury UI\nReact + Node.js + Gleam monorepo" },
        },
      },
      contact: {
        type: "dir",
        children: {
          "email.txt": { type: "file", content: "mnixon112@outlook.com" },
          "github.txt": { type: "file", content: "https://github.com/iMaxwe11" },
          "location.txt": { type: "file", content: "Southampton, NJ" },
        },
      },
      ".secret": { type: "file", content: "🎮 Achievement Unlocked: You found the hidden file!\n> \"The best code is the code you never have to debug.\"" },
    },
  },
};

const COMMANDS = ["help","ls","cd","pwd","cat","echo","clear","open","theme","whoami","date","history","sys","matrix","hack","uptime","fortune"];

function pathJoin(base: string[], p: string) {
  if (!p) return base;
  if (p.startsWith("/")) return p.split("/").filter(Boolean);
  const out = base.slice();
  for (const seg of p.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return out;
}
function getNode(path: string[]): Node | null {
  let cur: any = { type: "dir", children: FS };
  for (const seg of path) { if (!cur.children || !cur.children[seg]) return null; cur = cur.children[seg]; }
  return cur as Node;
}
function list(path: string[]): string[] {
  const n = getNode(path);
  if (!n || n.type !== "dir" || !n.children) return [];
  return Object.keys(n.children);
}
function isDir(path: string[]) { return getNode(path)?.type === "dir"; }
function isFile(path: string[]) { return getNode(path)?.type === "file"; }

function banner() {
  return [
    "",
    " ███╗   ███╗ █████╗ ██╗  ██╗██╗    ██╗███████╗██╗     ██╗     ",
    " ████╗ ████║██╔══██╗╚██╗██╔╝██║    ██║██╔════╝██║     ██║     ",
    " ██╔████╔██║███████║ ╚███╔╝ ██║ █╗ ██║█████╗  ██║     ██║     ",
    " ██║╚██╔╝██║██╔══██║ ██╔██╗ ██║███╗██║██╔══╝  ██║     ██║     ",
    " ██║ ╚═╝ ██║██║  ██║██╔╝ ██╗╚███╔███╔╝███████╗███████╗███████╗",
    " ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚══════╝╚══════╝╚══════╝",
    "",
    "  Console v5 — Obsidian Luxe Edition",
    "  Type 'help' for commands  ·  'sys' for system info  ·  'matrix' for fun",
    "",
  ].join("\n");
}

function neofetch(): string {
  return [
    "",
    "  ┌─────────────────────────────────────┐",
    "  │  Maxwell OS  ·  Obsidian Luxe v5     │",
    "  ├─────────────────────────────────────┤",
    "  │  Kernel    Next.js 15.0.8 + React 18 │",
    "  │  Shell     Maxwell Console v5         │",
    "  │  CPU       JavaScript V8 Engine       │",
    "  │  GPU       Framer Motion + CSS Anims  │",
    "  │  Memory    Plenty                     │",
    "  │  Disk      Virtual FS ~/              │",
    "  │  Theme     CRT Phosphor Green         │",
    "  │  Location  Southampton, NJ            │",
    "  │  Uptime    Always on                  │",
    "  └─────────────────────────────────────┘",
    "",
  ].join("\n");
}

const FORTUNES = [
  "The code you write today will confuse you in 6 months.",
  "There are only two hard things: cache invalidation and naming things.",
  "It works on my machine. ¯\\_(ツ)_/¯",
  "Debugging is like being the detective in a crime movie where you are also the murderer.",
  "A good programmer looks both ways before crossing a one-way street.",
  "The best error message is the one that never shows up.",
  "First, solve the problem. Then, write the code.",
  "Talk is cheap. Show me the code. — Linus Torvalds",
];

const BOOT_LINES = [
  "BIOS v5.0 — Maxwell Systems Inc.",
  "Initializing hardware... OK",
  "CPU: JavaScript V8 Engine @ ∞ GHz",
  "GPU: Framer Motion Accelerated",
  "RAM: 16 exabytes available",
  "Loading kernel: next.js-15.0.8-obsidian",
  "Mounting virtual filesystem... /home",
  "Starting CRT phosphor subsystem... OK",
  "Applying theme: Obsidian Luxe v5",
  "Network: connected via Vercel Edge",
  "Location: Southampton, NJ",
  "─────────────────────────────────────",
  "System ready. Launching terminal...",
];

/* ═══════════════════════════════════════════
   MATRIX RAIN — Mounted client-side only to
   avoid hydration mismatch from Math.random()
   ═══════════════════════════════════════════ */
function MatrixRain({ active }: { active: boolean }) {
  const [cols, setCols] = useState<Array<{ left: string; dur: string; delay: string; size: string; ch: string }>>([]);

  useEffect(() => {
    if (!active) { setCols([]); return; }
    const chars = "01アイウエオカキクケコサシスセソタチツテトMXWL<>/{}()=+*";
    setCols(
      Array.from({ length: 40 }, () => ({
        left: `${Math.random() * 100}%`,
        dur: `${3 + Math.random() * 5}s`,
        delay: `${Math.random() * 3}s`,
        size: `${10 + Math.random() * 4}px`,
        ch: chars[Math.floor(Math.random() * chars.length)],
      }))
    );
  }, [active]);

  if (!active || cols.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {cols.map((c, i) => (
        <div key={i} className="matrix-char"
          style={{ left: c.left, animationDuration: c.dur, animationDelay: c.delay, fontSize: c.size }}>
          {c.ch}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   BOOT SEQUENCE — Fixed useEffect deps
   ═══════════════════════════════════════════ */
function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => onCompleteRef.current(), 400);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 font-[family-name:var(--font-mono)] text-sm">
      {lines.map((line, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className={`${line.includes("OK") || line.includes("ready") ? "text-[var(--accent-cyan)]" : line.startsWith("──") ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>
          <span className="text-[var(--accent-gold)] mr-2">[{String(i).padStart(2, "0")}]</span>
          {line}
          {i === lines.length - 1 && (
            <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
              className="text-[var(--accent-cyan)] ml-1">▊</motion.span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ── Sound Wave Visualizer ───────────── */
function SoundWave() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="sound-bar" style={{ height: '100%', animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN TERMINAL PAGE
   ═══════════════════════════════════════════ */
export default function TerminalPage() {
  const [booted, setBooted] = useState(false);
  const [cwd, setCwd] = useState<string[]>(["home"]);
  const [lines, setLines] = useState<string[]>([banner()]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState<number>(-1);
  const [matrixActive, setMatrixActive] = useState(false);
  const [cmdCount, setCmdCount] = useState(0);
  const [screenFlash, setScreenFlash] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const smoothX = useSpring(spotlightX, { stiffness: 80, damping: 25 });
  const smoothY = useSpring(spotlightY, { stiffness: 80, damping: 25 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    spotlightX.set(e.clientX);
    spotlightY.set(e.clientY);
  }, [spotlightX, spotlightY]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);
  useEffect(() => { if (booted) inputRef.current?.focus(); }, [booted]);

  const prompt = useMemo(() => {
    const path = cwd.length === 1 ? "~" : "~/" + cwd.slice(1).join("/");
    return `visitor@maxwell:${path}$`;
  }, [cwd]);

  function flashScreen() {
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 100);
  }

  function run(raw: string): { output: string; clear?: boolean } {
    const cmd = raw.trim();
    if (!cmd) return { output: "" };
    const [base, ...rest] = cmd.split(" ");
    const arg = rest.join(" ").trim();
    setCmdCount((c) => c + 1);

    switch (base) {
      case "help":
        return { output: [
          "┌─── Built-in Commands ───────────────────────┐",
          "│  help              Show this help             │",
          "│  ls [path]         List directory              │",
          "│  cd [path]         Change directory             │",
          "│  pwd               Print working directory      │",
          "│  cat <file>        Print file contents          │",
          "│  echo [text]       Echo text                    │",
          "│  open <route>      Open a site route            │",
          "│  theme <n>         studio|obsidian|aurora       │",
          "│  whoami            Display user                 │",
          "│  date              Show current date/time       │",
          "│  history           Show command history         │",
          "│  sys               System info (neofetch)       │",
          "│  uptime            Session uptime               │",
          "│  fortune           Random dev wisdom            │",
          "│  matrix            Toggle matrix rain           │",
          "│  hack              Fake hacking animation       │",
          "│  clear             Clear screen                 │",
          "└──────────────────────────────────────────────┘",
        ].join("\n") };
      case "ls": {
        const p = pathJoin(cwd, arg);
        if (!isDir(p)) return { output: `ls: not a directory: ${arg || "."}` };
        const entries = list(p);
        return { output: entries.map((n) => {
          const node = getNode([...p, n])!;
          return node.type === "dir" ? `📁 ${n}/` : `📄 ${n}`;
        }).join("  ") };
      }
      case "cd": {
        const p = arg ? pathJoin(cwd, arg) : ["home"];
        if (!isDir(p)) return { output: `cd: no such directory: ${arg}` };
        setCwd(p);
        return { output: "" };
      }
      case "pwd": return { output: "/" + cwd.join("/") };
      case "cat": {
        if (!arg) return { output: "usage: cat <file>" };
        const p = pathJoin(cwd, arg);
        if (!isFile(p)) return { output: `cat: ${arg}: No such file` };
        return { output: getNode(p)!.content || "" };
      }
      case "echo": return { output: arg };
      case "open":
        if (!arg) return { output: "usage: open </|/tools|/terminal|/security|/contact>" };
        try { window.location.href = arg; } catch {}
        return { output: `opening ${arg} ...` };
      case "theme": {
        const name = String(arg || "").toLowerCase();
        const validThemes = ["studio","default","obsidian","aurora"];
        if (validThemes.includes(name)) {
          document.documentElement.setAttribute("data-theme", name === "studio" ? "" : name);
          return { output: `✓ theme applied: ${name === "studio" ? "default" : name}` };
        }
        return { output: "usage: theme <studio|obsidian|aurora>" };
      }
      case "whoami": return { output: "visitor — welcome to the matrix 🐇" };
      case "date": return { output: new Date().toString() };
      case "history": return { output: history.slice(-20).map((c, i) => `  ${i + 1}  ${c}`).join("\n") || "(empty)" };
      case "sys": return { output: neofetch() };
      case "uptime": return { output: `Session: ${cmdCount} commands executed · System: Always on` };
      case "fortune": return { output: `💡 ${FORTUNES[Math.floor(Math.random() * FORTUNES.length)]}` };
      case "matrix":
        setMatrixActive((m) => !m);
        return { output: matrixActive ? "Matrix rain: OFF" : "Matrix rain: ON — welcome to the rabbit hole 🐇" };
      case "hack":
        flashScreen();
        return { output: [
          "▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░ Bypassing firewall...",
          "▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░ Injecting payload...",
          "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░ Accessing mainframe...",
          "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Access granted ✓",
          "", "Just kidding. This is a portfolio terminal. 😄",
          "But hey, you looked cool doing it.",
        ].join("\n") };
      case "clear": return { output: "", clear: true };
      default: return { output: `command not found: ${base}  — type 'help' for available commands` };
    }
  }

  function handleSubmit() {
    const value = input.trim();
    if (!value) return;
    flashScreen();
    setHistory((h) => [...h, value]);
    setHIndex(-1);
    const result = run(value);
    if (result.clear) {
      setLines([]);
    } else {
      setLines((prev) => [...prev, `${prompt} ${value}`, ...(result.output ? [result.output] : [])]);
    }
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      setHIndex((i) => {
        const ni = i <= 0 ? history.length - 1 : i - 1;
        setInput(history[ni] || "");
        return ni;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      setHIndex((i) => {
        const ni = i + 1;
        if (ni >= history.length) { setInput(""); return -1; }
        setInput(history[ni] || "");
        return ni;
      });
    } else if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.trim().split(" ");
      const [b, ...rest] = parts;
      const partial = rest.join(" ").trim();
      if (!partial && b) {
        const match = COMMANDS.find((c) => c.startsWith(b));
        if (match) setInput(match + " ");
      } else if (partial) {
        const names = list(cwd);
        const m = names.find((n) => n.startsWith(partial));
        if (m) setInput(`${b} ${m}${isDir([...cwd, m]) ? "/" : ""}`);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#020204] flex flex-col relative" onMouseMove={handleMouseMove}>
      <div className="aurora-bg"><div className="aurora-band" /><div className="aurora-band" /></div>
      <motion.div className="spotlight-cursor" style={{ left: smoothX, top: smoothY }} />

      {/* Nav - IMPROVED VISIBILITY */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.15] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors group">
            <motion.div whileHover={{ x: -3 }} className="text-sm font-bold">←</motion.div>
            <span className="text-base font-[family-name:var(--font-mono)] font-semibold">
              <span className="text-[var(--accent-cyan)]">MN</span>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/90">terminal</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <SoundWave />
            <span className="text-xs text-white/70 font-[family-name:var(--font-mono)] font-medium hidden sm:inline">
              {cmdCount} cmd{cmdCount !== 1 ? "s" : ""}
            </span>
            <div className="hidden sm:flex gap-5">
              {[{ href: "/tools", label: "Tools" }, { href: "/security", label: "Security" }, { href: "/contact", label: "Contact" }].map((l) => (
                <Link key={l.href} href={l.href}
                  className="text-sm text-white/70 hover:text-[var(--accent-cyan)] transition-colors font-[family-name:var(--font-mono)] uppercase tracking-wider font-medium">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Terminal Container */}
      <main className="flex-1 pt-24 sm:pt-28 pb-6 sm:pb-10 px-3 sm:px-4 md:px-8 flex items-start justify-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl">
          <div ref={containerRef}
            className={`terminal-window crt-screen relative ${screenFlash ? 'brightness-150' : ''} transition-[filter] duration-100`}
            onClick={() => inputRef.current?.focus()}>
            {/* Title bar */}
            <div className="terminal-titlebar">
              <div className="flex gap-2">
                {["bg-red-500/60 hover:bg-red-500", "bg-yellow-500/60 hover:bg-yellow-500", "bg-green-500/60 hover:bg-green-500"].map((c, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.3 }} className={`terminal-dot ${c} transition-colors cursor-pointer`} />
                ))}
              </div>
              <div className="flex-1 text-center">
                <span className="text-[0.7rem] text-[var(--text-muted)] font-[family-name:var(--font-mono)] hidden sm:inline">
                  maxwell@console — bash — 80×24
                </span>
              </div>
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
            </div>

            {/* Terminal body */}
            <div className="relative min-h-[400px] sm:min-h-[500px] max-h-[70vh] overflow-y-auto p-4 sm:p-6 font-[family-name:var(--font-mono)] text-xs sm:text-sm leading-relaxed">
              <MatrixRain active={matrixActive} />
              <AnimatePresence mode="wait">
                {!booted ? (
                  <motion.div key="boot" exit={{ opacity: 0 }}>
                    <BootSequence onComplete={() => setBooted(true)} />
                  </motion.div>
                ) : (
                  <motion.div key="terminal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                    {lines.map((line, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }} className="whitespace-pre-wrap break-all mb-0.5">
                        {line.startsWith("visitor@") ? (
                          <><span className="text-[var(--accent-purple)]">{line.split("$")[0]}$</span><span className="text-[var(--text-primary)]">{line.split("$").slice(1).join("$")}</span></>
                        ) : line.includes("┌") || line.includes("│") || line.includes("└") || line.includes("├") ? (
                          <span className="text-[var(--text-muted)]">{line}</span>
                        ) : line.includes("✓") ? (
                          <span className="text-[var(--accent-cyan)]">{line}</span>
                        ) : line.includes("Error") || line.includes("not found") ? (
                          <span className="text-red-400">{line}</span>
                        ) : line.includes("💡") ? (
                          <span className="text-[var(--accent-gold)]">{line}</span>
                        ) : (
                          <span className="text-[var(--text-secondary)]">{line}</span>
                        )}
                      </motion.div>
                    ))}
                    {/* Input line */}
                    <div className="flex items-center gap-0 mt-1">
                      <span className="text-[var(--accent-purple)] shrink-0 text-xs sm:text-sm">{prompt}&nbsp;</span>
                      <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown} spellCheck={false} autoComplete="off"
                        className="flex-1 bg-transparent outline-none text-[var(--text-primary)] caret-[var(--accent-cyan)] min-w-0" />
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }}
                        className="text-[var(--accent-cyan)] text-lg leading-none">▊</motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endRef} />
            </div>

            {/* Scan beam effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <motion.div animate={{ top: ["0%", "100%"] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-10" />
            </div>
          </div>

          {/* Bottom status bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-3 sm:mt-4 flex items-center justify-between text-[0.6rem] sm:text-[0.65rem] text-white/60 font-[family-name:var(--font-mono)] px-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />CONNECTED
              </span>
              <span>·</span><span>Southampton, NJ</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline">Tab: autocomplete</span>
              <span className="hidden sm:inline">↑↓: history</span>
              <span className="text-[var(--accent-cyan)]">v5.0</span>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
