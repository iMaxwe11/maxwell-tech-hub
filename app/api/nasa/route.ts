import { NextResponse } from "next/server";

export const runtime = "edge";

type Endpoint = "apod" | "neo" | "donki" | "mars-latest";
type DonkiType = "FLR" | "GST";

const DONKI_TYPES = new Set<DonkiType>(["FLR", "GST"]);

function getTodayIso() {
  return new Date().toISOString().split("T")[0];
}

function isEndpoint(value: string): value is Endpoint {
  return value === "apod" || value === "neo" || value === "donki" || value === "mars-latest";
}

function buildUrl(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpointParam = searchParams.get("endpoint") || "apod";

  if (!isEndpoint(endpointParam)) {
    return { error: "Unsupported NASA endpoint", status: 400 as const };
  }

  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
  const endpoint = endpointParam;

  if (endpoint === "apod") {
    return {
      endpoint,
      url: `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true`,
      revalidate: 3600,
    };
  }

  if (endpoint === "neo") {
    const today = getTodayIso();
    return {
      endpoint,
      url: `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&api_key=${apiKey}`,
      revalidate: 3600,
    };
  }

  if (endpoint === "mars-latest") {
    const rover = searchParams.get("rover") || "curiosity";
    return {
      endpoint,
      url: `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${apiKey}`,
      revalidate: 1800,
    };
  }

  const donkiType = (searchParams.get("type") || "FLR").toUpperCase() as DonkiType;
  if (!DONKI_TYPES.has(donkiType)) {
    return { error: "Unsupported DONKI type", status: 400 as const };
  }

  const endDate = searchParams.get("endDate") || getTodayIso();
  const defaultStartDate = new Date(Date.now() - 7 * 86_400_000).toISOString().split("T")[0];
  const startDate = searchParams.get("startDate") || defaultStartDate;

  return {
    endpoint,
    url: `https://api.nasa.gov/DONKI/${donkiType}?startDate=${startDate}&endDate=${endDate}&api_key=${apiKey}`,
    revalidate: 1800,
  };
}

export async function GET(request: Request) {
  const built = buildUrl(request);
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: built.status });
  }

  try {
    const response = await fetch(built.url, {
      next: { revalidate: built.revalidate },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        {
          error: `NASA request failed with ${response.status}`,
          details: body.slice(0, 300),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          built.endpoint === "apod"
            ? "public, s-maxage=3600, stale-while-revalidate=86400"
            : "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch NASA data" }, { status: 500 });
  }
}
