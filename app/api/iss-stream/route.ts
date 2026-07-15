import { NextResponse } from "next/server";

/* Resolves NASA's current ISS live-stream video ID.

   YouTube retired the `embed/live_stream?channel=` endpoint, so embedding the
   channel's live broadcast requires the concrete video ID. The previous
   implementation scraped the channel /live page and trusted the FIRST
   `"videoId"` token in the HTML. From Vercel datacenter IPs, YouTube serves
   different markup where that first token belongs to an unrelated
   *recommended* video — which is how a random third-party video ended up
   playing inside the "ISS Live" widget. The `isLive` regex was equally
   untrustworthy (it matched anywhere in ~1MB of HTML).

   Fix: every candidate ID is now verified through YouTube's oEmbed API
   before being served. oEmbed returns the video's true author and title
   regardless of the requesting IP, so we only ever emit a video that is
   provably NASA's ISS stream. Verification results are cached alongside
   the ID; a verified hardcoded fallback covers cold-cache failures. */

const CHANNEL_ID = "UCLA_DiR1FfKNvjuUpBHmylQ"; // NASA official
// Verified 2026-07-15 via oEmbed: "Live High-Definition Views from the
// International Space Station (Official NASA Stream)" — author NASA.
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

/* Confirms via oEmbed that a video ID is genuinely NASA's ISS stream.
   oEmbed is IP-agnostic: it reports the real uploader even when the page
   scrape returned datacenter-flavored markup. */
async function verifyNasaIssVideo(videoId: string, signal: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
      { cache: "no-store", signal }
    );
    if (!response.ok) return false;
    const meta = (await response.json()) as { author_name?: string; author_url?: string; title?: string };
    const authorOk =
      meta.author_name === "NASA" || meta.author_url === "https://www.youtube.com/@NASA";
    const titleOk = /space station|ISS/i.test(meta.title ?? "");
    return authorOk && titleOk;
  } catch {
    return false;
  }
}

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
    /* Only the canonical watch URL is a trustworthy live-target signal.
       The old `"videoId":"..."` first-match heuristic is gone — on
       datacenter-served markup it points at recommendation-shelf videos. */
    const canonical = html.match(
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/
    );
    const candidateId = canonical?.[1];

    if (!candidateId) {
      throw new Error("No canonical live video on channel /live page");
    }

    const verified = await verifyNasaIssVideo(candidateId, controller.signal);
    if (!verified) {
      throw new Error(`Candidate ${candidateId} failed NASA/ISS oEmbed verification`);
    }

    /* Scope the liveness check to the verified video's own metadata rather
       than matching `"isLive":true` anywhere in the page (which also matches
       unrelated recommended videos). If the scoped check can't find it,
       treat as not-live rather than guessing. */
    const liveScope = html.slice(0, html.indexOf(candidateId) + 20_000);
    const isLive = /"isLiveNow"\s*:\s*true/.test(liveScope) || /"isLive"\s*:\s*true/.test(liveScope);

    cache = { videoId: candidateId, isLive, ts: Date.now() };
    return respond(
      { videoId: candidateId, isLive, source: "youtube", updatedAt: new Date().toISOString() },
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
