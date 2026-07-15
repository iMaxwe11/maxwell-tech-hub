// localStorage-backed launcher preferences: recents, pins, usage counts.
// All reads are SSR-safe (callers invoke from effects) and failure-tolerant —
// private browsing or blocked storage just degrades to defaults.
import type { ToolId } from "./tool-config";

const RECENT_KEY = "tools-recent";
const PIN_KEY = "tools-pinned";
const USAGE_KEY = "tools-usage";
const MAX_RECENTS = 6;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function readRecents(): ToolId[] {
  return read<ToolId[]>(RECENT_KEY, []);
}

export function readPinned(): ToolId[] {
  return read<ToolId[]>(PIN_KEY, []);
}

export function readUsage(): Partial<Record<ToolId, number>> {
  return read<Partial<Record<ToolId, number>>>(USAGE_KEY, {});
}

export function recordToolUse(id: ToolId): {
  recents: ToolId[];
  usage: Partial<Record<ToolId, number>>;
} {
  const recents = [id, ...readRecents().filter((r) => r !== id)].slice(0, MAX_RECENTS);
  write(RECENT_KEY, recents);
  const usage = readUsage();
  usage[id] = (usage[id] ?? 0) + 1;
  write(USAGE_KEY, usage);
  return { recents, usage };
}

export function togglePinned(id: ToolId): ToolId[] {
  const current = readPinned();
  const next = current.includes(id) ? current.filter((p) => p !== id) : [...current, id];
  write(PIN_KEY, next);
  return next;
}
