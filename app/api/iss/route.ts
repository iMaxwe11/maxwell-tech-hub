import { NextResponse } from "next/server";

// Never prerender/cache this route; position changes every request.
export const dynamic = "force-dynamic";

// Last-good-value cache: wheretheiss.at rate-limits aggressively, so when a
// fetch fails we serve the previous position (stale) instead of erroring.
let lastGood: { data: Record<string, number>; at: number } | null = null;

function isValidIss(d: unknown): d is Record<string, number> {
  if (!d || typeof d !== "object") return false;
  const o = d as Record<string, unknown>;
  return (
    typeof o.latitude === "number" &&
    typeof o.longitude === "number" &&
    typeof o.velocity === "number" &&
    typeof o.altitude === "number"
  );
}

export async function GET() {
  try {
    // Manual timeout instead of AbortSignal.timeout(): the static helper
    // interacts badly with Next's patched fetch and has produced silent
    // infra-level 500s (no error logs, catch never entered). A plain
    // controller + clearTimeout is boring and reliable.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    let res: Response;
    try {
      res = await fetch("https://api.wheretheiss.at/v1/satellites/25544", {
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    if (!isValidIss(data)) throw new Error("upstream shape mismatch");

    lastGood = { data, at: Date.now() };
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
      },
    });
  } catch {
    // Serve stale position for up to 10 minutes before admitting defeat.
    if (lastGood && Date.now() - lastGood.at < 10 * 60 * 1000) {
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
