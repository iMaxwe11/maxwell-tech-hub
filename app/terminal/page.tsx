"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Node = { type: "dir"|"file"; content?: string; children?: Record<string, Node> };

const FS: Record<string, Node> = {
  home: {
    type: "dir",
    children: {
      "readme.txt": { type: "file", content: "Welcome to Maxwell's terminal. Try 'help' to see commands. Explore ~/projects and ~/contact." },
      "projects": {
        type: "dir",
        children: {
          "hub.md": { type: "file", content: "# Interactive Hub v2\nSleek Next.js + Tailwind + playful UI." },
          "obsidian.txt": { type: "file", content: "Obsidian Echoes — a terminal mystery concept." },
        }
      },
      "contact": {
        type: "dir",
        children: {
          "email.txt": { type: "file", content: "mnixon112@outlook.com" },
          "github.txt": { type: "file", content: "https://github.com/iMaxwe11" }
        }
      }
    }
  }
};

const COMMANDS = ["help","ls","cd","pwd","cat","echo","clear","open","theme","whoami","date","history","sys"];

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
  for (const seg of path) {
    if (!cur.children || !cur.children[seg]) return null;
    cur = cur.children[seg];
  }
  return cur as Node;
}
function list(path: string[]): string[] {
  const n = getNode(path);
  if (!n || n.type !== "dir" || !n.children) return [];
  return Object.keys(n.children);
}
function isDir(path: string[]) { return getNode(path)?.type === "dir"; }
function isFile(path: string[]) { return getNode(path)?.type === "file"; }
"use client";
// ...your imports...

// Add this helper:
function neofetch(): string {
  return [
    "Maxwell OS  • Theme: Studio/Obsidian/Aurora",
    "Kernel     • Next.js 15 + React 18",
    "CPU        • JavaScript Engine",
    "GPU        • CSS / Canvas",
    "Memory     • Plenty",
    "Disk       • Virtual FS (~/projects, ~/contact)",
  ].join("\n");
}

// (rest of the file, including export default TerminalPage...)

export default function TerminalPage() {
  const [cwd, setCwd] = useState<string[]>(["home"]);
  const [lines, setLines] = useState<string[]>([banner()]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState<number>(-1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const prompt = useMemo(() => {
    const path = cwd.length === 1 ? "~" : "~/" + cwd.slice(1).join("/");
    return `visitor@maxwell:${path}$`;
  }, [cwd]);

  function run(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;
    const [base, ...rest] = cmd.split(" ");
    const arg = rest.join(" ").trim();
    switch (base) {
      case "help":
        return [
          "Built-ins:",
          "  help                Show this help",
          "  ls [path]          List directory",
          "  cd [path]          Change directory",
          "  pwd                Print working directory",
          "  cat <file>         Print file contents",
          "  echo [text]        Echo text",
          "  open <route>       Open a site route (/, /tools, /terminal, /security, /contact)",
          "  theme <name>       Theme: studio | obsidian | aurora",
          "  whoami             Display user",
          "  date               Show current date/time",
          "  history            Show command history",
          "  sys                System info",
          "  clear              Clear screen"
        ].join("\n");
      case "ls": {
        const p = pathJoin(cwd, arg);
        if (!isDir(p)) return `ls: not a directory: ${arg || "."}`;
        const entries = list(p);
        return entries.map(n => {
          const node = getNode([...p, n])!;
          return node.type === "dir" ? n + "/" : n;
        }).join("  ");
      }
      case "cd": {
        const p = arg ? pathJoin(cwd, arg) : ["home"];
        if (!isDir(p)) return `cd: no such directory: ${arg}`;
        setCwd(p);
        return "";
      }
      case "pwd":
        return "/" + cwd.join("/");
      case "cat": {
        if (!arg) return "usage: cat <file>";
        const p = pathJoin(cwd, arg);
        if (!isFile(p)) return `cat: ${arg}: No such file`;
        const n = getNode(p)!;
        return n.content || "";
      }
      case "echo": return arg;
      case "open":
        if (!arg) return "usage: open </|/tools|/terminal|/security|/contact>";
        try { window.location.href = arg; } catch {}
        return `opening ${arg} ...`;
      case "theme": {
        const name = (arg || "").toLowerCase();
        if (["studio","default","obsidian","aurora"].includes(name)) {
          document.documentElement.setAttribute("data-theme", name==="studio"?"":name);
          return `theme set: ${name==="studio"?"default":name}`;
        }
        return "usage: theme <studio|obsidian|aurora>";
      }
      case "whoami": return "visitor";
      case "date": return new Date().toString();
      case "history": return history.slice(-20).map((c,i)=> `${i+1}  ${c}`).join("\n") || "(empty)";
      case "sys": return neofetch();
      case "clear": setLines([]); return "";
      default: return `command not found: ${base}`;
    }
  }

  function onSubmit(e:any) {
    e.preventDefault();
    const value = input;
    if (!value.trim()) return;
    setHistory(h => [...h, value]);
    setHIndex(-1);
    const out = run(value);
    setLines(prev => [...prev, `${prompt} ${value}`, ...(out ? [out] : [])]);
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHIndex(i => {
        const ni = Math.min((i === -1 ? history.length : i), Math.max(0, history.length-1));
        const val = history[ni-1] ?? history[0];
        if (val) setInput(val);
        return ni-1 < 0 ? 0 : ni-1;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHIndex(i => {
        const ni = i + 1;
        if (ni >= history.length) { setInput(""); return history.length; }
        setInput(history[ni] || "");
        return ni;
      });
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [b, ...rest] = input.trim().split(" ");
      const partial = rest.join(" ").trim();
      if (!partial) {
        // autocomplete command
        const match = COMMANDS.find(c => c.startsWith(b));
        if (match) setInput(match + " ");
      } else {
        // autocomplete path in current dir
        const names = list(cwd);
        const m = names.find(n => n.startsWith(partial));
        if (m) setInput(`${b} ${m}${isDir([...cwd, m])?"/":""}`);
      }
    }
  }

  return (
    <main className="card min-h-[70vh] font-mono text-[13px]">
      <div className="text-accent mb-3">Maxwell Shell — type <span className="underline">help</span> to begin.</div>
      <div className="whitespace-pre-wrap leading-7">
        {lines.map((l,i)=>(<div key={i}>{l}</div>))}
        <div>
          <span className="text-green-300">{prompt}</span>&nbsp;
          <form onSubmit={onSubmit} className="inline">
            <input
              ref={inputRef}
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="bg-transparent outline-none"
              autoFocus
              aria-label="terminal input"
            />
          </form>
        </div>
        <div ref={endRef} />
      </div>
    </main>
  );
}

function banner() {
  return String.raw`
  __  __                       __           __  __      __
 / / / /___  ____ __________ _/ /_____ _   / / / /___ _/ /_____ 
/ / / / __ \/ __ \`/ ___/ __ \`/ __/ __ \`/  / /_/ / __ \`/ __/ __ \
/ /_/ / /_/ / /_/ / /  / /_/ / /_/ /_/ /  / __  / /_/ / /_/ /_/ /
\____/ .___/\__,_/_/   \__,_/\__/\__,_/  /_/ /_/\__,_/\__/\____/ 
    /_/    Maxwell Console v2 — 'help' for commands`;
}
