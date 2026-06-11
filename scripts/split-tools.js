// One-off: split app/tools/ToolSuite.tsx (2,782 lines) into per-tool files + shared scaffolding.
// Strategy: segment the file at column-0 declarations, route each named segment to its
// destination file, and auto-generate imports by detecting identifier usage per file.
const fs = require("fs");

const SRC = "app/tools/ToolSuite.tsx";
const src = fs.readFileSync(SRC, "utf8");
const lines = src.split(/\r?\n/);

// ── 1. Find top-level declaration boundaries ──────────────────────────────
const declRe = /^(export\s+)?(default\s+)?(async\s+)?(function|const|let|interface|type)\s+([A-Za-z_$][\w$]*)/;
const boundaries = [];
lines.forEach((l, i) => {
  const m = l.match(declRe);
  if (m) boundaries.push({ name: m[5], line: i });
});

console.log("=== TOP-LEVEL DECLARATIONS FOUND ===");
console.log(boundaries.map((b) => `${b.line + 1}: ${b.name}`).join("\n"));

// ── 2. Extract segments (decl line → line before next decl) ───────────────
const segs = {};
boundaries.forEach((b, idx) => {
  const end = idx + 1 < boundaries.length ? boundaries[idx + 1].line : lines.length;
  let segLines = lines.slice(b.line, end);
  while (
    segLines.length &&
    (segLines[segLines.length - 1].trim() === "" ||
      /^\/\* ═+.*═+ \*\/$/.test(segLines[segLines.length - 1].trim()) ||
      /^\/\* ──.*── \*\/?$/.test(segLines[segLines.length - 1].trim()))
  ) {
    segLines.pop();
  }
  segs[b.name] = segLines.join("\n");
});

// ── 3. Destination plan ───────────────────────────────────────────────────
const SHARED = [
  "readHashPrefill", "prefillFor", "encodeShareValue", "buildShareUrl", "shareLink",
  "ShareButton", "Accent", "SectionProps", "getErrorMessage",
  "SpotlightCursor", "ToolsParticles", "AnimIn", "Section", "ToolCountBadge", "MatrixRain",
];

const TOOL_FILES = {
  Palette: { id: "palette", extra: [] },
  MarkdownPreview: { id: "markdown", extra: ["renderInlineMarkdown", "MDRender"] },
  Inspiration: { id: "inspo", extra: [] },
  JSONFormatter: { id: "json", extra: [] },
  RegexTester: { id: "regex", extra: [] },
  TimestampConverter: { id: "timestamp", extra: [] },
  ContrastChecker: { id: "contrast", extra: [] },
  GeneratorKit: { id: "generator", extra: [] },
  Base64Tool: { id: "base64", extra: [] },
  URLTool: { id: "url", extra: [] },
  LoremIpsum: { id: "lorem", extra: [] },
  HashGenerator: { id: "hash", extra: [] },
  WordCounter: { id: "wordcount", extra: [] },
  CSSUnitConverter: { id: "cssunit", extra: [] },
  SlugStudio: { id: "slug", extra: [] },
  TextCaseStudio: { id: "textcase", extra: [] },
  CSVJSONStudio: { id: "csvjson", extra: [] },
  HTTPStatusExplorer: { id: "httpstatus", extra: ["HTTP_STATUSES"] },
  CronBuilder: { id: "cron", extra: ["CRON_PRESETS"] },
  QRCodeGenerator: { id: "qrcode", extra: [] },
  JWTDecoder: { id: "jwt", extra: [] },
  PomodoroTimer: { id: "pomodoro", extra: [] },
  IPInfo: { id: "ipinfo", extra: ["IpLookup"] },
  DiffChecker: { id: "diff", extra: [] },
  BaseConverter: { id: "baseconv", extra: [] },
  GradientGenerator: { id: "gradient", extra: [] },
  PasswordTester: { id: "password", extra: ["PasswordTone", "PASSWORD_TONE_STYLES"] },
  Magic8Ball: { id: "eightball", extra: [] },
  CoinFlip: { id: "coinflip", extra: [] },
  DiceRoller: { id: "dice", extra: [] },
  ASCIIArtGenerator: { id: "ascii", extra: [] },
  ColorGuessingGame: { id: "colorgame", extra: [] },
  SQLFormatter: { id: "sql", extra: [] },
  EmojiPicker: { id: "emoji", extra: ["EMOJI_SET"] },
  ShadowGenerator: { id: "shadow", extra: ["ShadowLayer"] },
};

const DROP = ["ToolsPage", "TOOL_COUNT"];

const accounted = new Set([...SHARED, ...DROP]);
Object.entries(TOOL_FILES).forEach(([name, cfg]) => {
  accounted.add(name);
  cfg.extra.forEach((e) => accounted.add(e));
});
const unaccounted = boundaries.map((b) => b.name).filter((n) => !accounted.has(n));
if (unaccounted.length) {
  console.log("\n!!! UNACCOUNTED SEGMENTS (will be LOST):", unaccounted.join(", "));
}
const missing = [...accounted].filter((n) => !(n in segs));
if (missing.length) {
  console.log("!!! EXPECTED BUT NOT FOUND:", missing.join(", "));
}

// ── 4. Import detection ───────────────────────────────────────────────────
const REACT_HOOKS = ["useState", "useEffect", "useMemo", "useCallback", "useRef", "useDeferredValue"];
const FRAMER = ["AnimatePresence", "useInView", "useMotionValue", "useSpring"];
const TOAST = ["copyToClipboard", "toast"];
const LUCIDE = ["Share2", "Dice6", "Terminal", "CircleDot"];
const SHARED_EXPORTS = [
  "Section", "AnimIn", "ShareButton", "prefillFor", "shareLink", "getErrorMessage",
  "SpotlightCursor", "ToolsParticles", "ToolCountBadge", "MatrixRain", "readHashPrefill",
];
const CONFIG = ["NAV_IDS", "TOOL_META", "CATEGORIES", "CAT_COLORS", "ToolId"];

function uses(text, ident) {
  return new RegExp(`\\b${ident}\\b`).test(text);
}

function buildImports(text, opts) {
  const out = [];
  const hooks = REACT_HOOKS.filter((h) => uses(text, h));
  if (hooks.length) out.push(`import { ${hooks.join(", ")} } from "react";`);
  const framer = FRAMER.filter((f) => uses(text, f));
  if (/\bmotion\./.test(text) || /<motion\./.test(text)) framer.unshift("motion");
  if (framer.length) out.push(`import { ${framer.join(", ")} } from "framer-motion";`);
  if (/<Link[\s>]/.test(text)) out.push(`import Link from "next/link";`);
  const lucide = LUCIDE.filter((l) => new RegExp(`<${l}[\\s/>]`).test(text));
  if (lucide.length) out.push(`import { ${lucide.join(", ")} } from "lucide-react";`);
  const toastFns = TOAST.filter((t) => uses(text, t));
  if (toastFns.length) out.push(`import { ${toastFns.join(", ")} } from "@/lib/toast";`);
  if (opts.sharedPath) {
    const shared = SHARED_EXPORTS.filter((s) => uses(text, s));
    if (shared.length) out.push(`import { ${shared.join(", ")} } from "${opts.sharedPath}";`);
  }
  if (opts.configPath) {
    const cfgVals = CONFIG.filter((c) => c !== "ToolId" && uses(text, c));
    const needsToolId = uses(text, "ToolId");
    if (cfgVals.length || needsToolId) {
      const parts = [...cfgVals];
      if (needsToolId) parts.push("type ToolId");
      out.push(`import { ${parts.join(", ")} } from "${opts.configPath}";`);
    }
  }
  return out;
}

// ── 5. Emit shared.tsx ────────────────────────────────────────────────────
const sharedBody = boundaries
  .filter((b) => SHARED.includes(b.name))
  .map((b) => {
    let s = segs[b.name];
    if (SHARED_EXPORTS.includes(b.name)) {
      s = s.replace(/^(async )?function /, "export $1function ");
    }
    return s;
  })
  .join("\n\n");

const TOOL_SKELETON = `
/** Loading placeholder while a tool's chunk streams in. */
export function ToolSkeleton() {
  return (
    <div className="glass-card p-6 sm:p-8 animate-pulse">
      <div className="h-4 w-44 bg-white/10 rounded mb-3" />
      <div className="h-3 w-72 max-w-full bg-white/5 rounded mb-6" />
      <div className="h-40 rounded-xl bg-white/[0.03] border border-white/[0.05]" />
    </div>
  );
}`;

const sharedImports = buildImports(sharedBody + TOOL_SKELETON, { configPath: "./tool-config" });
fs.writeFileSync(
  "app/tools/shared.tsx",
  `"use client";\n// Shared scaffolding for the tools suite: section chrome, share links, ambient FX.\n// Extracted from the former ToolSuite.tsx monolith.\n\n${sharedImports.join("\n")}\n\n${sharedBody}\n${TOOL_SKELETON}\n`,
  "utf8"
);
console.log("\nWrote app/tools/shared.tsx");

// ── 6. Emit per-tool files ────────────────────────────────────────────────
fs.mkdirSync("app/tools/tools", { recursive: true });
const meta = {};
for (const [name, cfg] of Object.entries(TOOL_FILES)) {
  const parts = [...cfg.extra.map((e) => segs[e]), segs[name]];
  let body = parts.filter(Boolean).join("\n\n");
  body = body.replace(new RegExp(`^function ${name}\\(`, "m"), `export function ${name}(`);
  const imports = buildImports(body, { sharedPath: "../shared", configPath: "../tool-config" });
  fs.writeFileSync(
    `app/tools/tools/${name}.tsx`,
    `"use client";\n\n${imports.join("\n")}\n\n${body}\n`,
    "utf8"
  );
  const tm = body.match(/<Section[^>]*?title="([^"]+)"/s);
  const dm = body.match(/<Section[^>]*?desc="([^"]+)"/s);
  meta[cfg.id] = { component: name, title: tm ? tm[1] : name, desc: dm ? dm[1] : "" };
}
console.log(`Wrote ${Object.keys(TOOL_FILES).length} tool files to app/tools/tools/`);

// ── 7. Emit registry ──────────────────────────────────────────────────────
const registryEntries = Object.entries(TOOL_FILES)
  .map(
    ([name, cfg]) =>
      `  ${cfg.id}: dynamic(() => import("./${name}").then((m) => m.${name}), { ssr: false, loading: ToolSkeleton }),`
  )
  .join("\n");
fs.writeFileSync(
  "app/tools/tools/index.ts",
  `// Per-tool dynamic imports: each tool is its own chunk, loaded only when opened.\nimport dynamic from "next/dynamic";\nimport type { ComponentType } from "react";\nimport type { ToolId } from "../tool-config";\nimport { ToolSkeleton } from "../shared";\n\nexport const TOOL_COMPONENTS: Record<ToolId, ComponentType> = {\n${registryEntries}\n};\n`,
  "utf8"
);
console.log("Wrote app/tools/tools/index.ts");

// ── 8. Dump scraped card meta for the launcher config ─────────────────────
console.log("\n=== SCRAPED TOOL META (title/desc per id) ===");
console.log(JSON.stringify(meta, null, 2));
