import { NextResponse } from "next/server";

import type { NewsItem } from "@/lib/types";

const cache: Record<string, { data: NewsItem[]; ts: number }> = {};
const CACHE_TTL = 15 * 60_000;

const FEEDS: Record<string, Array<{ url: string; source: string; format?: "rss" | "atom" }>> = {
  tech: [
    { url: "https://hnrss.org/frontpage?count=15", source: "Hacker News" },
    { url: "https://www.theverge.com/rss/index.xml", source: "The Verge", format: "atom" },
    { url: "https://feeds.arstechnica.com/arstechnica/index", source: "Ars Technica" },
  ],
  world: [
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times" },
    { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters" },
  ],
  gaming: [
    { url: "https://kotaku.com/rss", source: "Kotaku" },
    { url: "https://www.gamespot.com/feeds/mashup/", source: "GameSpot" },
    { url: "https://www.pcgamer.com/rss/", source: "PC Gamer" },
  ],
};

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

function safeIsoDate(value?: string) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function parseRSS(xml: string, source: string, category: string, limit = 12): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    try {
      const block = match[1];
      const titleMatch =
        block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
        block.match(/<title>(.*?)<\/title>/);
      const title = decodeHtml(titleMatch?.[1] || "");
      const link = block.match(/<link>(.*?)<\/link>/)?.[1]?.trim() || "";
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
      const media =
        block.match(/<media:content[^>]*url="([^"]*)"/)?.[1] ||
        block.match(/<enclosure[^>]*url="([^"]*)"/)?.[1];
      const image = media || block.match(/<img[^>]*src="([^"]*)"/)?.[1];

      if (!title || !link) {
        continue;
      }

      items.push({
        title,
        url: link,
        source,
        time: safeIsoDate(pubDate),
        category,
        image,
      });
    } catch {
      continue;
    }
  }

  return items;
}

function parseAtom(xml: string, source: string, category: string, limit = 12): NewsItem[] {
  const items: NewsItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null && items.length < limit) {
    try {
      const block = match[1];
      const title = decodeHtml(block.match(/<title[^>]*>(.*?)<\/title>/)?.[1] || "");
      const link = block.match(/<link[^>]*href="([^"]*)"/)?.[1]?.trim() || "";
      const updated =
        block.match(/<updated>(.*?)<\/updated>/)?.[1] ||
        block.match(/<published>(.*?)<\/published>/)?.[1];

      if (!title || !link) {
        continue;
      }

      items.push({
        title,
        url: link,
        source,
        time: safeIsoDate(updated),
        category,
      });
    } catch {
      continue;
    }
  }

  return items;
}

async function fetchFeed(
  url: string,
  source: string,
  category: string,
  format: "rss" | "atom" = "rss"
): Promise<NewsItem[]> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    return format === "atom" ? parseAtom(xml, source, category) : parseRSS(xml, source, category);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "tech";

  if (cache[category] && Date.now() - cache[category].ts < CACHE_TTL) {
    return NextResponse.json(cache[category].data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        "X-Cache": "HIT",
      },
    });
  }

  const feeds = FEEDS[category] || FEEDS.tech;
  const results = await Promise.all(
    feeds.map((feed) => fetchFeed(feed.url, feed.source, category, feed.format || "rss"))
  );

  const seen = new Set<string>();
  const all = results
    .flat()
    .filter((item) => {
      const key = `${item.source}:${item.title.toLowerCase().slice(0, 80)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 30);

  cache[category] = { data: all, ts: Date.now() };

  return NextResponse.json(all, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      "X-Cache": "MISS",
    },
  });
}
