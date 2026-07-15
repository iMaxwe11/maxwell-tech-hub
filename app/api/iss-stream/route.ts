import { NextResponse } from "next/server";

/* Resolves NASA's current ISS live-stream video ID.
   YouTube retired the `embed/live_stream?channel=` endpoint, so embedding the
   channel's live broadcast now requires the concrete video ID — which changes
   whenever NASA restarts the stream. This route scrapes the canonical watch
   URL from the channel's /live page server-side and caches it, so the client
   always embeds a working `embed/{videoId}` URL. */

const CHANNEL_ID = "UCLA_DiR1FfKNvjuUpBHmylQ"; // NASA official
// Last verified live 2026-07-14. Served only if resolution fails with a cold cache.
const LAST_KNOWN_VIDEO_ID = "awQzjn72bI0";

interface StreamPayload {
  videoId: string;
  embedUrl: string;
  isLive: boolean;
  source: "youtube" | "cache" | "fallback";
  updatedAt: string;
}

let cache: { videoId: string; isLive: boolean; ts: number } | null = null;
const TTL = 3_600_000; // 1h — stream IDs persist for days between restarts

function respond(payload: Omit<StreamPayload, "embedUrl">, cacheState: "HIT" | "MISS" | "STALE" | "FALLBACK") {
  const body: StreamPayload = {
    ...payload,
    embedUrl: `https://www.youtube.com/embed/${payload.videoId}?autoplay=1&mute=1`,
  };
  return NextResponse.json(body, {
    headers: {
      "Cache-Control":
        cacheState === "FALLBACK"
          ? "public, s-maxage=300, stale-while-revalidate=3600, stale-if-error=86400"
          : "public, s-maxage=3600, stale-while-revalidate=21600, stale-if-error=86400",
      "X-Cache": cacheState,
    },
  });
}

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return respond(
      { videoId: cache.videoId, isLive: cache.isLive, source: "cache", updatedAt: new Date(cache.ts).toISOString() },
      "HIT"
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(`https://www.youtube.com/channel/${CHANNEL_ID}/live`, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        // Desktop UA + English keeps the markup shape predictable
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`YouTube /live returned ${response.status}`);
    }

    const html = await response.text();
    const canonical = html.match(
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/
    );
    const jsonId = html.match(/"videoId":"([\w-]{11})"/);
    const videoId = canonical?.[1] ?? jsonId?.[1];
    const isLive = /"isLive"\s*:\s*true|"isLiveNow"\s*:\s*true/.test(html);

    if (!videoId) {
      throw new Error("No video ID found on channel /live page");
    }

    cache = { videoId, isLive, ts: Date.now() };
    return respond(
      { videoId, isLive, source: "youtube", updatedAt: new Date().toISOString() },
      "MISS"
    );
  } catch (error) {
    console.error("[iss-stream]", error instanceof Error ? error.message : error);
    if (cache) {
      return respond(
        { videoId: cache.videoId, isLive: cache.isLive, source: "cache", updatedAt: new Date(cache.ts).toISOString() },
        "STALE"
      );
    }
    return respond(
      { videoId: LAST_KNOWN_VIDEO_ID, isLive: false, source: "fallback", updatedAt: new Date().toISOString() },
      "FALLBACK"
    );
  } finally {
    clearTimeout(timer);
  }
}
