import { NextResponse } from "next/server";

import type { LaunchItem, LaunchResponse } from "@/lib/types";

type LaunchKind = "upcoming" | "previous";

interface RocketLaunchLiveLaunch {
  id?: number;
  name?: string;
  t0?: string | null;
  result?: number | null;
  provider?: { name?: string | null };
  vehicle?: { name?: string | null };
  pad?: {
    name?: string | null;
    location?: { name?: string | null; country?: string | null };
  };
  missions?: Array<{ name?: string | null; description?: string | null }>;
  mission_description?: string | null;
  launch_description?: string | null;
  media?: Array<{ url?: string | null; source_url?: string | null }>;
}

interface RocketLaunchLiveResponse {
  result?: RocketLaunchLiveLaunch[];
}

interface SpaceXLaunch {
  id?: string;
  name?: string;
  date_utc?: string;
  success?: boolean | null;
  details?: string | null;
  links?: {
    webcast?: string | null;
    article?: string | null;
  };
  flight_number?: number;
}

interface SpaceXQueryResponse {
  docs?: SpaceXLaunch[];
}

const DEFAULT_LIMIT: Record<LaunchKind, number> = {
  upcoming: 12,
  previous: 8,
};

function cacheControlFor(kind: LaunchKind) {
  return kind === "upcoming"
    ? "public, s-maxage=600, stale-while-revalidate=1800"
    : "public, s-maxage=1800, stale-while-revalidate=7200";
}

function cleanText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function mapRocketLaunchLiveStatus(launch: RocketLaunchLiveLaunch) {
  if (launch.result === 1) return "Success";
  if (launch.result === 0) return "Failure";
  return launch.t0 ? "Go" : "TBD";
}

function mapRocketLaunchLiveItem(launch: RocketLaunchLiveLaunch): LaunchItem {
  const missionName = cleanText(launch.missions?.[0]?.name);
  const location = [cleanText(launch.pad?.name), cleanText(launch.pad?.location?.name)]
    .filter(Boolean)
    .join(", ");
  const videoUrl = cleanText(launch.media?.[0]?.source_url) ?? cleanText(launch.media?.[0]?.url);

  return {
    id: `rocketlaunchlive-${launch.id ?? missionName ?? "launch"}`,
    name: cleanText(launch.name) ?? missionName ?? "TBD",
    net: cleanText(launch.t0 ?? undefined),
    status: { abbrev: mapRocketLaunchLiveStatus(launch) },
    launch_service_provider: { name: cleanText(launch.provider?.name) },
    rocket: { configuration: { name: cleanText(launch.vehicle?.name) } },
    pad: { location: { name: location || cleanText(launch.pad?.location?.country) } },
    mission: {
      description:
        cleanText(launch.mission_description) ??
        cleanText(launch.missions?.[0]?.description) ??
        cleanText(launch.launch_description),
    },
    webcast_live: Boolean(videoUrl),
    vidURLs: videoUrl ? [{ url: videoUrl }] : [],
  };
}

function mapSpaceXItem(launch: SpaceXLaunch): LaunchItem {
  const articleUrl = cleanText(launch.links?.webcast) ?? cleanText(launch.links?.article);

  return {
    id: launch.id ?? `spacex-${launch.flight_number ?? launch.name ?? "launch"}`,
    name: cleanText(launch.name) ?? "SpaceX Launch",
    net: cleanText(launch.date_utc),
    status: {
      abbrev:
        launch.success === true
          ? "Success"
          : launch.success === false
          ? "Failure"
          : "TBD",
    },
    launch_service_provider: { name: "SpaceX" },
    rocket: {
      configuration: {
        name:
          typeof launch.flight_number === "number"
            ? `Flight ${launch.flight_number}`
            : "Recent mission",
      },
    },
    mission: { description: cleanText(launch.details) },
    webcast_live: Boolean(cleanText(launch.links?.webcast)),
    vidURLs: articleUrl ? [{ url: articleUrl }] : [],
  };
}

async function fetchLaunchLibrary(
  kind: LaunchKind,
  limit: number,
): Promise<LaunchResponse | null> {
  const response = await fetch(
    `https://ll.thespacedevs.com/2.2.0/launch/${kind}/?limit=${limit}&mode=list`,
    {
      next: { revalidate: kind === "upcoming" ? 600 : 1800 },
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Launch Library returned ${response.status}`);
  }

  const data = (await response.json()) as LaunchResponse;
  const results = Array.isArray(data.results) ? data.results : [];

  if (results.length === 0) {
    return null;
  }

  return {
    results,
    source: "Launch Library 2",
    updatedAt: new Date().toISOString(),
  };
}

async function fetchRocketLaunchLive(limit: number): Promise<LaunchResponse | null> {
  const response = await fetch(
    `https://fdo.rocketlaunch.live/json/launches/next/${limit}`,
    {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (!response.ok) {
    throw new Error(`RocketLaunch.Live returned ${response.status}`);
  }

  const data = (await response.json()) as RocketLaunchLiveResponse;
  const results = Array.isArray(data.result)
    ? data.result.map(mapRocketLaunchLiveItem).filter((launch) => launch.name)
    : [];

  if (results.length === 0) {
    return null;
  }

  return {
    results,
    source: "RocketLaunch.Live",
    isFallback: true,
    fallbackReason: "Launch Library 2 is temporarily unavailable.",
    updatedAt: new Date().toISOString(),
  };
}

async function fetchSpaceXRecent(limit: number): Promise<LaunchResponse | null> {
  const response = await fetch("https://api.spacexdata.com/v5/launches/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: { upcoming: false },
      options: {
        limit,
        sort: { date_utc: "desc" },
        pagination: false,
      },
    }),
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`SpaceX returned ${response.status}`);
  }

  const data = (await response.json()) as SpaceXQueryResponse;
  const results = Array.isArray(data.docs)
    ? data.docs.map(mapSpaceXItem).filter((launch) => launch.name)
    : [];

  if (results.length === 0) {
    return null;
  }

  return {
    results,
    source: "SpaceX API",
    isFallback: true,
    fallbackReason:
      "Showing recent SpaceX missions while the full launch archive feed is offline.",
    updatedAt: new Date().toISOString(),
  };
}

async function fetchFallback(kind: LaunchKind, limit: number) {
  return kind === "upcoming"
    ? fetchRocketLaunchLive(limit)
    : fetchSpaceXRecent(limit);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kindParam = searchParams.get("kind");
  const kind: LaunchKind = kindParam === "previous" ? "previous" : "upcoming";
  const limitParam = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, 20)
      : DEFAULT_LIMIT[kind];

  try {
    const primary = await fetchLaunchLibrary(kind, limit);
    if (primary) {
      return NextResponse.json(primary, {
        headers: {
          "Cache-Control": cacheControlFor(kind),
        },
      });
    }
  } catch (error) {
    // Fallback below keeps the launch schedule online even when the primary feed is down.
  }

  try {
    const fallback = await fetchFallback(kind, limit);
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: {
          "Cache-Control": cacheControlFor(kind),
        },
      });
    }
  } catch (error) {
    // Fall through to empty state below.
  }

  return NextResponse.json(
    {
      results: [],
      source: "Unavailable",
      isFallback: true,
      fallbackReason:
        "Primary and backup launch feeds are both temporarily unavailable.",
      updatedAt: new Date().toISOString(),
    } satisfies LaunchResponse,
    {
      status: 200,
      headers: {
        "Cache-Control": cacheControlFor(kind),
      },
    },
  );
}
