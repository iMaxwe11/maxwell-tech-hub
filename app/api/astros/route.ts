import { NextResponse } from "next/server";

import type { PeopleInSpaceResponse } from "@/lib/types";

let cache: { data: PeopleInSpaceResponse; ts: number } | null = null;
const TTL = 300_000;

const FALLBACK_RESPONSE: PeopleInSpaceResponse = {
  message: "success",
  number: 0,
  people: [],
};

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json(cache.data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const response = await fetch("http://api.open-notify.org/astros.json", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      throw new Error(`Open Notify returned ${response.status}`);
    }

    const data = (await response.json()) as PeopleInSpaceResponse;
    cache = { data, ts: Date.now() };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        "X-Cache": "MISS",
      },
    });
  } catch {
    return NextResponse.json(cache?.data || FALLBACK_RESPONSE, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Cache": cache ? "STALE" : "FALLBACK",
      },
    });
  }
}
