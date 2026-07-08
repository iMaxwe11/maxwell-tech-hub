import { NextResponse } from "next/server";

// Never prerender/cache this route; position changes every request.
export const dynamic = "force-dynamic";

/**
 * ISS position with a two-source chain:
 *   1. wheretheiss.at  — full telemetry (lat/lon/velocity/altitude), but
 *      rate-limits Vercel's shared egress IPs aggressively.
 *   2. open-notify.org — position only (no velocity/altitude), historically
 *      tolerant of shared IPs. HTTP-only upstream, which is fine server-side.
 * Plus a per-instance last-good cache (30 min) bridging brief gaps in both.
 */
let lastGood: { data: Record<string, unknown>; at: number } | null = null;

function hasLatLon(d: unknown): d is { latitude: number; longitude: number } {
  if (!d || typeof d !== "object") return false;
  const o = d as Record<string, unknown>;
  return (
    typeof o.latitude === "number" &&
    Number.isFinite(o.latitude) &&
    typeof o.longitude === "number" &&
    Number.isFinite(o.longitude)
  );
}

/** Manual timeout instead of AbortSignal.timeout(): the static helper
 *  interacts badly with Next's patched fetch and has produced silent
 *  infra-level 500s. A plain controller + clearTimeout is boring and reliable. */
async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fromWhereTheIss(): Promise<Record<string, unknown>> {
  const data = await fetchJson(
    "https://api.wheretheiss.at/v1/satellites/25544",
    5000
  );
  if (
    !hasLatLon(data) ||
    typeof (data as Record<string, unknown>).velocity !== "number" ||
    typeof (data as Record<string, unknown>).altitude !== "number"
  ) {
    throw new Error("wheretheiss shape mismatch");
  }
  return data as Record<string, unknown>;
}

async function fromOpenNotify(): Promise<Record<string, unknown>> {
  const raw = (await fetchJson(
    "http://api.open-notify.org/iss-now.json",
    5000
  )) as {
    message?: string;
    timestamp?: number;
    iss_position?: { latitude?: string; longitude?: string };
  };
  const mapped = {
    latitude: Number(raw?.iss_position?.latitude),
    longitude: Number(raw?.iss_position?.longitude),
    timestamp: raw?.timestamp,
    source: "open-notify",
  };
  if (raw?.message !== "success" || !hasLatLon(mapped)) {
    throw new Error("open-notify shape mismatch");
  }
  return mapped;
}

export async function GET() {
  try {
    let data: Record<string, unknown>;
    try {
      data = await fromWhereTheIss();
    } catch {
      // Primary rate-limited or down — degrade to position-only fallback.
      data = await fromOpenNotify();
    }

    lastGood = { data, at: Date.now() };
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
      },
    });
  } catch {
    // Both upstreams failed: serve stale position for up to 30 minutes
    // before admitting defeat.
    if (lastGood && Date.now() - lastGood.at < 30 * 60 * 1000) {
      return NextResponse.json(
        { ...lastGood.data, stale: true },
        { headers: { "Cache-Control": "public, s-maxage=5" } }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch ISS data" },
      { status: 502 }
    );
  }
}
