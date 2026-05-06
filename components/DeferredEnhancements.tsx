"use client";

/**
 * Code-split, client-only mounts for sitewide interaction enhancements.
 *
 * These components are pure browser features (keyboard shortcuts, easter eggs,
 * cursor effects, toast helpers) — they have no SSR value and don't need to
 * exist until after first paint. Splitting them out of the main layout chunk
 * trims First Load JS on every page.
 *
 * Kept eagerly imported in layout.tsx (NOT deferred here):
 *   - GrokStarfield   — visible backdrop, must render immediately
 *   - AnalyticsTracker — needs to record the initial pageview
 *   - ScrollProgress  — top bar, would pop in on first scroll if deferred
 *   - Toast           — fires from other components on mount; can't be lazy
 *   - PageTransition  — wraps children
 */

import dynamic from "next/dynamic";

const GlobalCommandPalette = dynamic(
  () => import("@/components/GlobalCommandPalette").then((m) => m.GlobalCommandPalette),
  { ssr: false },
);

const KonamiCode = dynamic(
  () => import("@/components/KonamiCode").then((m) => m.KonamiCode),
  { ssr: false },
);

const AchievementSystem = dynamic(
  () => import("@/components/AchievementSystem").then((m) => m.AchievementSystem),
  { ssr: false },
);

const ConsoleGreeting = dynamic(
  () => import("@/components/ConsoleGreeting").then((m) => m.ConsoleGreeting),
  { ssr: false },
);

const CursorSparkle = dynamic(
  () => import("@/components/CursorSparkle").then((m) => m.CursorSparkle),
  { ssr: false },
);

const KeyboardShortcuts = dynamic(
  () => import("@/components/KeyboardShortcuts").then((m) => m.KeyboardShortcuts),
  { ssr: false },
);

export function DeferredEnhancements() {
  return (
    <>
      <GlobalCommandPalette />
      <KonamiCode />
      <AchievementSystem />
      <ConsoleGreeting />
      <CursorSparkle />
      <KeyboardShortcuts />
    </>
  );
}
