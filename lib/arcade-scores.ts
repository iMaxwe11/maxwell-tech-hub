// Unified persistent high-score store for the arcade.
// Each game records its best through here; the /play hub reads them all
// to show per-cabinet bests and the Hall of Fame strip.

export type ScoreDirection = "higher" | "lower";

export interface BestScore {
  value: number;
  at: number; // epoch ms when the best was set
}

const KEY = "arcade:best-v1";

export type ArcadeGameId = "snake" | "pong" | "memory" | "reaction" | "typing" | "breakout";

function readAll(): Partial<Record<ArcadeGameId, BestScore>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<ArcadeGameId, BestScore>>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Partial<Record<ArcadeGameId, BestScore>>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable — degrade to in-session behavior */
  }
}

export function readBest(gameId: ArcadeGameId): BestScore | null {
  return readAll()[gameId] ?? null;
}

export function readAllBests(): Partial<Record<ArcadeGameId, BestScore>> {
  return readAll();
}

/**
 * Record a finished run. Persists only if it beats the stored best
 * (or no best exists). Returns the resulting best and whether it's new.
 */
export function recordScore(
  gameId: ArcadeGameId,
  value: number,
  direction: ScoreDirection = "higher"
): { best: number; isNewBest: boolean } {
  if (!Number.isFinite(value)) return { best: value, isNewBest: false };
  const all = readAll();
  const prev = all[gameId];
  const beats =
    !prev || (direction === "higher" ? value > prev.value : value < prev.value);
  if (beats) {
    all[gameId] = { value, at: Date.now() };
    writeAll(all);
    return { best: value, isNewBest: true };
  }
  return { best: prev.value, isNewBest: false };
}

/** Clear all stored bests (used by the hub's reset control). */
export function clearBests() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
