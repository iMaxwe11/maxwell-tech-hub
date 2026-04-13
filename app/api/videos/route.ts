import { NextResponse } from "next/server";
import type { VideoFeedItem } from "@/lib/types";

const CACHE_TTL = 15 * 60 * 1000;

const CHANNELS = [
  { id: "UCBJycsmduvYEL83R_U4JriQ", name: "MKBHD", topic: "Tech reviews" },
  { id: "UCXuqSBlHAE6Xw-yeJA0Tunw", name: "Linus Tech Tips", topic: "PC hardware" },
  { id: "UCddiUEpeqJcYeBxX1IVBKvQ", name: "The Verge", topic: "Industry news" },
  { id: "UC0ArlFuFYMpEewyRBzdLHiw", name: "GameSpot", topic: "Gaming coverage" },
] as const;

let cache: { data: VideoFeedItem[]; ts: number } | null = null;

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseTag(block: string, pattern: RegExp) {
  return block.match(pattern)?.[1]?.trim();
}

function parseFeed(xml: string, channel: (typeof CHANNELS)[number]) {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  return entries.slice(0, 2).flatMap((entry) => {
    const videoId = parseTag(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    const title = parseTag(entry, /<title>([^<]+)<\/title>/);
    const publishedAt = parseTag(entry, /<published>([^<]+)<\/published>/);

    if (!videoId || !title || !publishedAt) {
      return [];
    }

    return [
      {
        id: videoId,
        channel: channel.name,
        title: decodeXml(title),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt,
        topic: channel.topic,
      },
    ];
  });
}

async function fetchChannelFeed(channel: (typeof CHANNELS)[number]) {
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`, {
    headers: {
      "User-Agent": "maxwell-tech-hub/1.0",
    },
    next: { revalidate: 900 },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`YouTube feed request failed with ${response.status}`);
  }

  return parseFeed(await response.text(), channel);
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        "X-Cache": "HIT",
      },
    });
  }

  const results = await Promise.allSettled(CHANNELS.map((channel) => fetchChannelFeed(channel)));
  const videos = results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 8);

  if (videos.length === 0) {
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
          "X-Cache": "STALE",
        },
      });
    }

    return NextResponse.json({ error: "Unable to load video feeds right now." }, { status: 502 });
  }

  cache = { data: videos, ts: Date.now() };

  return NextResponse.json(videos, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      "X-Cache": "MISS",
    },
  });
}
