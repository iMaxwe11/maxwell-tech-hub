import { NextResponse } from "next/server";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  time: string;
  category: string;
  image?: string;
}

// In-memory cache per category
const cache: Record<string, { data: NewsItem[]; ts: number }> = {};
const CACHE_TTL = 15 * 60_000; // 15 min cache

// Parse RSS XML simply (no external deps)
function parseRSS(xml: string, source: string, category: string, limit = 12): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
    const media = block.match(/<media:content[^>]*url="([^"]*)"/) || block.match(/<enclosure[^>]*url="([^"]*)"/);
    const imgTag = block.match(/<img[^>]*src="([^"]*)"/);
    const image = media?.[1] || imgTag?.[1] || undefined;

    if (title && link) {
      items.push({
        title: title.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim(),
        url: link.trim(),
        source,
        time: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        category,
        image,
      });
    }
  }
  return items;
}

// Parse Atom feeds
function parseAtom(xml: string, source: string, category: string, limit = 12): NewsItem[] {
  const items: NewsItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[1];
    const title = block.match(/<title[^>]*>(.*?)<\/title>/)?.[1] || "";
    const link = block.match(/<link[^>]*href="([^"]*)"/)?.[1] || "";
    const updated = block.match(/<updated>(.*?)<\/updated>|<published>(.*?)<\/published>/)?.[1] || "";

    if (title && link) {
      items.push({
        title: title.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim(),
        url: link.trim(),
        source,
        time: updated ? new Date(updated).toISOString() : new Date().toISOString(),
        category,
      });
    }
  }
  return items;
}

async function fetchFeed(url: string, source: string, category: string, format: "rss" | "atom" = "rss"): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return [];
    const xml = await res.text();
    return format === "atom" ? parseAtom(xml, source, category) : parseRSS(xml, source, category);
  } catch (e) {
    console.error(`Feed error [${source}]:`, e);
    return [];
  }
}

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "tech";

  // Check cache
  if (cache[category] && Date.now() - cache[category].ts < CACHE_TTL) {
    return NextResponse.json(cache[category].data, {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" },
    });
  }

  const feeds = FEEDS[category] || FEEDS.tech;
  const results = await Promise.all(
    feeds.map(f => fetchFeed(f.url, f.source, category, f.format || "rss"))
  );

  // Merge, deduplicate by title, sort by time
  const seen = new Set<string>();
  const all = results
    .flat()
    .filter(item => {
      const key = item.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 30);

  cache[category] = { data: all, ts: Date.now() };

  return NextResponse.json(all, {
    headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" },
  });
}
