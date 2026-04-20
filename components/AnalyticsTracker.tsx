"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "mnx-session-data";
const ACTIVE_KEY = "mnx-active-session";
const SESSION_GAP_MS = 30 * 60 * 1000; // 30 min considered a new session

interface SessionData {
  firstVisit: number;
  lastVisit: number;
  totalSessions: number;
  pageViews: Record<string, number>;
  dailyActivity: Record<string, number>;
  totalTimeMs: number;
}

function loadSessionData(): SessionData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    firstVisit: Date.now(),
    lastVisit: Date.now(),
    totalSessions: 0,
    pageViews: {},
    dailyActivity: {},
    totalTimeMs: 0,
  };
}

function saveSessionData(data: SessionData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function getDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Silent session tracker. Increments per-page view counts and session counts
 * in localStorage. No network requests, no cookies.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const now = Date.now();
      const data = loadSessionData();

      // Bootstrap firstVisit if missing
      if (!data.firstVisit || data.firstVisit <= 0) {
        data.firstVisit = now;
      }

      // Session logic: if gap since last visit > threshold, new session
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        const gap = now - (data.lastVisit || 0);
        if (!data.totalSessions || gap > SESSION_GAP_MS) {
          data.totalSessions = (data.totalSessions || 0) + 1;
        }
      }

      // Increment page view count
      const normalized = pathname || "/";
      data.pageViews[normalized] = (data.pageViews[normalized] || 0) + 1;

      // Daily activity bump
      const dayKey = getDayKey(new Date());
      data.dailyActivity[dayKey] = (data.dailyActivity[dayKey] || 0) + 1;

      data.lastVisit = now;
      saveSessionData(data);
      // Notify listeners (analytics page) that data was updated
      try {
        window.dispatchEvent(new CustomEvent("mnx-analytics-updated"));
      } catch {
        // ignore
      }
    } catch {
      // silently fail if storage unavailable
    }
  }, [pathname]);

  return null;
}
