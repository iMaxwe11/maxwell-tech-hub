import { NextResponse } from "next/server";

import type { LaunchResponse } from "@/lib/types";

type LaunchKind = "upcoming" | "previous";

const DEFAULT_LIMIT: Record<LaunchKind, number> = {
  upcoming: 12,
  previous: 8,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kindParam = searchParams.get("kind");
  const kind: LaunchKind = kindParam === "previous" ? "previous" : "upcoming";
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0
    ? Math.min(limitParam, 20)
    : DEFAULT_LIMIT[kind];

  try {
    const response = await fetch(
      `https://ll.thespacedevs.com/2.2.0/launch/${kind}/?limit=${limit}&mode=list`,
      {
        next: { revalidate: kind === "upcoming" ? 600 : 1800 },
        signal: AbortSignal.timeout(12_000),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Launch Library returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = (await response.json()) as LaunchResponse;

    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          kind === "upcoming"
            ? "public, s-maxage=600, stale-while-revalidate=1800"
            : "public, s-maxage=1800, stale-while-revalidate=7200",
      },
    });
  } catch {
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
