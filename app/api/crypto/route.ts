import { NextResponse } from "next/server";

// Server-side proxy with caching to avoid client-side rate limits
let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 60_000; // 60s cache

export async function GET() {
  // Return cached data if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  }

  // Try CoinGecko first
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1&sparkline=false&price_change_percentage=24h",
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((c: any) => ({
          id: c.id,
          symbol: c.symbol,
          name: c.name,
          price: c.current_price,
          change24h: c.price_change_percentage_24h || 0,
          marketCap: c.market_cap,
          image: c.image,
        }));
        cache = { data: mapped, ts: Date.now() };
        return NextResponse.json(mapped, {
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
        });
      }
    }
  } catch (e) {
    console.error("CoinGecko failed, trying CoinCap:", e);
  }

  // Fallback to CoinCap
  try {
    const res = await fetch("https://api.coincap.io/v2/assets?limit=8", {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const mapped = json.data.map((c: any) => ({
          id: c.id,
          symbol: c.symbol.toLowerCase(),
          name: c.name,
          price: parseFloat(c.priceUsd),
          change24h: parseFloat(c.changePercent24Hr) || 0,
          marketCap: parseFloat(c.marketCapUsd),
          image: null,
        }));
        cache = { data: mapped, ts: Date.now() };
        return NextResponse.json(mapped, {
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
        });
      }
    }
  } catch (e) {
    console.error("CoinCap also failed:", e);
  }

  // Return cached data even if stale, or empty array
  if (cache) return NextResponse.json(cache.data);
  return NextResponse.json([]);
}
