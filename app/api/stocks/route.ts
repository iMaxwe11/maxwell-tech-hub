import { NextResponse } from "next/server";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META"];

async function fetchYahooChart(symbol: string): Promise<any | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const closes = result.indicators?.quote?.[0]?.close;
    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
    const change = prevClose > 0 ? price - prevClose : 0;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    // Build sparkline from last 5 days of close prices
    const sparkline = closes
      ? closes.filter((c: number | null) => c !== null).slice(-5)
      : [];

    return {
      symbol: meta.symbol || symbol,
      name: meta.shortName || meta.longName || symbol,
      price,
      change: +change.toFixed(2),
      changesPercentage: +changePercent.toFixed(2),
      dayHigh: meta.regularMarketDayHigh ?? 0,
      dayLow: meta.regularMarketDayLow ?? 0,
      previousClose: prevClose,
      sparkline,
    };
  } catch {
    return null;
  }
}

// In-memory cache
let cache: { data: any[]; ts: number } = { data: [], ts: 0 };
const CACHE_MS = 90_000; // 90 seconds

export async function GET() {
  // Serve cache if fresh
  if (cache.data.length > 0 && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=180",
        "X-Cache": "HIT",
      },
    });
  }

  // Fetch all symbols in parallel via chart endpoint
  const results = await Promise.allSettled(SYMBOLS.map(fetchYahooChart));
  const data = results
    .filter(
      (r): r is PromiseFulfilledResult<any> =>
        r.status === "fulfilled" && r.value !== null && r.value.price > 0
    )
    .map((r) => r.value);

  if (data.length > 0) {
    cache = { data, ts: Date.now() };
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=180",
        "X-Cache": "MISS",
      },
    });
  }

  // Return stale cache if current fetch failed
  if (cache.data.length > 0) {
    return NextResponse.json(cache.data, {
      headers: {
        "Cache-Control": "public, s-maxage=30",
        "X-Cache": "STALE",
      },
    });
  }

  return NextResponse.json([], { status: 200 });
}
