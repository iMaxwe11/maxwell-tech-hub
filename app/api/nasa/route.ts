import { NextResponse } from "next/server";

// mars.nasa.gov's raw-image feed consistently takes ~14s to respond, which
// exceeds Vercel's default function duration. CDN caching (s-maxage=1800 +
// SWR) means only the first request per half-hour pays this latency.
export const maxDuration = 30;

type Endpoint = "apod" | "neo" | "donki" | "mars-latest";
type DonkiType = "FLR" | "GST";

const DONKI_TYPES = new Set<DonkiType>(["FLR", "GST"]);

function getTodayIso() {
  return new Date().toISOString().split("T")[0];
}

function isEndpoint(value: string): value is Endpoint {
  return value === "apod" || value === "neo" || value === "donki" || value === "mars-latest";
}

type RawMarsImage = {
  image_files?: { medium?: string; large?: string; small?: string; full_res?: string };
  camera?: { instrument?: string };
  date_taken_mars?: string;
  date_taken_utc?: string;
  sample_type?: string;
};

function prettyInstrument(id: string): string {
  return id
    .split("_")
    .map((w) => (w.length <= 3 ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(" ");
}

/** Transform the mars.nasa.gov raw feed into the retired mars-photos
 *  latest_photos shape that app/space/page.tsx renders. */
function toLatestPhotos(data: unknown) {
  const images = ((data as { images?: RawMarsImage[] })?.images ?? [])
    .filter((img) => img.sample_type === "Full")
    .slice(0, 12)
    .map((img, i) => {
      const solMatch = /Sol-(\d+)/.exec(img.date_taken_mars ?? "");
      const instrument = img.camera?.instrument ?? "UNKNOWN";
      return {
        // The retired API had numeric photo ids; the raw feed's imageid is a
        // string, so synthesize a stable numeric id for React keys.
        id: i + 1,
        img_src:
          img.image_files?.medium ??
          img.image_files?.large ??
          img.image_files?.small ??
          "",
        sol: solMatch ? parseInt(solMatch[1], 10) : 0,
        earth_date: (img.date_taken_utc ?? "").split("T")[0],
        camera: { name: instrument, full_name: prettyInstrument(instrument) },
        rover: { name: "Perseverance" },
      };
    })
    .filter((p) => p.img_src !== "");
  return { latest_photos: images };
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
    // NASA retired api.nasa.gov/mars-photos (404s on every route as of 2026-07).
    // Proxy the official mars.nasa.gov raw-image feed instead and transform to
    // the old latest_photos shape so the /space client stays unchanged.
    // MSL (Curiosity) feed returns zero images, so Perseverance is the only
    // living source regardless of the rover query param.
    return {
      endpoint,
      url: "https://mars.nasa.gov/rss/api/?feed=raw_images&category=mars2020&feedtype=json&num=30&order=sol+desc",
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
    // Manual timeout: AbortSignal.timeout() + Next's patched fetch has produced
    // silent infra-level 500s (see /api/iss). Controller + clearTimeout instead.
    // mars.nasa.gov needs a ~25s budget (measured ~14s typical response time);
    // api.nasa.gov endpoints stay on a tight 12s.
    const controller = new AbortController();
    const timeoutMs = built.endpoint === "mars-latest" ? 25_000 : 12_000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      // mars.nasa.gov responses fail silently inside Next's fetch cache
      // (identical code path works for api.nasa.gov), so bypass the data
      // cache for mars-latest; the route's s-maxage handles CDN caching.
      response = await fetch(
        built.url,
        built.endpoint === "mars-latest"
          ? { cache: "no-store", signal: controller.signal }
          : { next: { revalidate: built.revalidate }, signal: controller.signal }
      );
    } finally {
      clearTimeout(timer);
    }

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

    const payload = built.endpoint === "mars-latest" ? toLatestPhotos(data) : data;

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control":
          built.endpoint === "apod"
            ? "public, s-maxage=3600, stale-while-revalidate=86400"
            : "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    // Log the real failure; Vercel error-level logs are the only visibility
    // into route-internal fetch failures.
    console.error("[api/nasa]", built.endpoint, err);
    return NextResponse.json({ error: "Failed to fetch NASA data" }, { status: 500 });
  }
}
