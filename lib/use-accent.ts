"use client";

import { useCallback, useEffect, useState } from "react";

export type AccentMode = "off" | "sweep" | "pulse" | "pick";

const ACCENT_STORAGE_KEY = "hero-accent";
const ACCENT_EVENT = "hero-accent-changed";

interface AccentDetail {
  mode: AccentMode;
  color: string;
}

/**
 * Cross-component hook for the "name gradient" preference. Persists to
 * localStorage and broadcasts a custom event so every instance of the hook
 * (hero + navbar picker + anywhere else) stays in sync without a provider.
 */
export function useAccent() {
  const [mode, setMode] = useState<AccentMode>("off");
  const [color, setColor] = useState("#06b6d4");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ACCENT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccentDetail>;
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.color) setColor(parsed.color);
      }
    } catch {
      /* ignore corrupt storage */
    }

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<AccentDetail>).detail;
      if (!detail) return;
      if (detail.mode !== undefined) setMode(detail.mode);
      if (detail.color !== undefined) setColor(detail.color);
    };
    window.addEventListener(ACCENT_EVENT, onChange);
    return () => window.removeEventListener(ACCENT_EVENT, onChange);
  }, []);

  const broadcast = useCallback((nextMode: AccentMode, nextColor: string) => {
    try {
      window.localStorage.setItem(
        ACCENT_STORAGE_KEY,
        JSON.stringify({ mode: nextMode, color: nextColor }),
      );
      window.dispatchEvent(
        new CustomEvent<AccentDetail>(ACCENT_EVENT, {
          detail: { mode: nextMode, color: nextColor },
        }),
      );
    } catch {
      /* noop */
    }
  }, []);

  const updateMode = useCallback(
    (next: AccentMode) => {
      setMode(next);
      broadcast(next, color);
    },
    [color, broadcast],
  );

  const updateColor = useCallback(
    (next: string) => {
      setColor(next);
      broadcast("pick", next);
      setMode("pick");
    },
    [broadcast],
  );

  return { mode, color, setMode: updateMode, setColor: updateColor };
}
