import { NextResponse } from "next/server";

import type { SpaceFeedItem, SpaceFeedResponse } from "@/lib/types";

interface SpaceflightNewsArticle {
  id?: number;
  title?: string;
  url?: string;
  news_site?: string;
  summary?: string;
  published_at?: string;
}

interface SpaceflightNewsResponse {
  results?: SpaceflightNewsArticle[];
}

function cleanText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function stripCdata(value: string) {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseNasaRss(xml: string, limit: number): SpaceFeedItem[] {
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g))
    .slice(0, limit)
    .map((match, index) => {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const descriptionMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);

      const title = decodeXml(stripCdata(titleMatch?.[1] ?? ""));
      const url = cleanText(linkMatch?.[1]) ?? "https://www.nasa.gov/news/";
      const publishedAt = new Date(pubDateMatch?.[1] ?? Date.now()).toISOString();
      const summary = cleanText(
        decodeXml(stripCdata(descriptionMatch?.[1] ?? "")).replace(/<[^>]+>/g, ""),
      );

      return {
        id: `nasa-rss-${index}-${publishedAt}`,
        title: title || "NASA Update",
        url,
        source: "NASA Breaking News",
        publishedAt,
        summary,
      } satisfies SpaceFeedItem;
    });

  return items.filter((item) => Boolean(item.title && item.url));
}

async function fetchSpaceflightNews(limit: number): Promise<SpaceFeedResponse | null> {
  const response = await fetch(
    `https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}`,
    {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Spaceflight News returned ${response.status}`);
  }

  const data = (await response.json()) as SpaceflightNewsResponse;
  const items =
    data.results?.map((article) => ({
      id: `spaceflight-news-${article.id ?? article.url ?? crypto.randomUUID()}`,
      title: cleanText(article.title) ?? "Space update",
      url: cleanText(article.url) ?? "https://spaceflightnewsapi.net/",
      source: cleanText(article.news_site) ?? "Spaceflight News",
      publishedAt: cleanText(article.published_at) ?? new Date().toISOString(),
      summary: cleanText(article.summary),
    })) ?? [];

  if (items.length === 0) {
    return null;
  }

  return {
    items,
    source: "Spaceflight News API",
    updatedAt: new Date().toISOString(),
  };
}

async function fetchNasaFallback(limit: number): Promise<SpaceFeedResponse | null> {
  const response = await fetch("https://www.nasa.gov/rss/dyn/breaking_news.rss", {
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`NASA RSS returned ${response.status}`);
  }

  const xml = await response.text();
  const items = parseNasaRss(xml, limit);

  if (items.length === 0) {
    return null;
  }

  return {
    items,
    source: "NASA Breaking News RSS",
    isFallback: true,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 8) : 6;

  try {
    const primary = await fetchSpaceflightNews(limit);
    if (primary) {
      return NextResponse.json(primary, {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      });
    }
  } catch (error) {
    // Fallback below.
  }

  try {
    const fallback = await fetchNasaFallback(limit);
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      });
    }
  } catch (error) {
    // Fall through to empty state.
  }

  return NextResponse.json(
    {
      items: [],
      source: "Unavailable",
      isFallback: true,
      updatedAt: new Date().toISOString(),
    } satisfies SpaceFeedResponse,
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    },
  );
}
