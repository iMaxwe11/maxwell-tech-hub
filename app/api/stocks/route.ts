import { NextResponse } from "next/server";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META"];

// Cache to avoid hammering APIs
let cache: { data: any[]; ts: number } = { data: [], ts: 0 };
const CACHE_MS = 120_000; // 2 min

export async function GET() {
  // Serve from cache if fresh
  if (cache.data.length > 0 && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  // Strategy 1: Yahoo Finance v8
  try {
    const joined = SYMBOLS.join(",");
    const yRes = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${joined}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      }
    );
    if (yRes.ok) {
      const json = await yRes.json();
      const quotes = json?.quoteResponse?.result;
      if (Array.isArray(quotes) && quotes.length > 0) {
        const data = quotes.map((q: any) => ({
          symbol: q.symbol,
          name: q.shortName || q.longName || q.symbol,
          price: q.regularMarketPrice || 0,
          change: q.regularMarketChange || 0,
          changesPercentage: q.regularMarketChangePercent || 0,
          dayHigh: q.regularMarketDayHigh || 0,
          dayLow: q.regularMarketDayLow || 0,
          volume: q.regularMarketVolume || 0,
          marketCap: q.marketCap || 0,
          previousClose: q.regularMarketPreviousClose || 0,
        }));
        if (data.some((d: any) => d.price > 0)) {
          cache = { data, ts: Date.now() };
          return NextResponse.json(data, {
            headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
          });
        }
      }
    }
  } catch (e) {
    console.error("Yahoo Finance failed:", e);
  }

  // Strategy 2: Finnhub (if API key provided)
  const finnhubKey = process.env.FINNHUB_API_KEY;
  if (finnhubKey) {
    try {
      const results = await Promise.allSettled(
        SYMBOLS.map((s) =>
          fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${finnhubKey}`, {
            signal: AbortSignal.timeout(5000),
          }).then((r) => r.json().then((d) => ({ symbol: s, ...d })))
        )
      );
      const data = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value.c > 0)
        .map((r) => ({
          symbol: r.value.symbol,
          name: r.value.symbol,
          price: r.value.c,
          change: r.value.d || 0,
          changesPercentage: r.value.dp || 0,
          dayHigh: r.value.h || 0,
          dayLow: r.value.l || 0,
          previousClose: r.value.pc || 0,
          volume: 0,
          marketCap: 0,
        }));
      if (data.length > 0) {
        cache = { data, ts: Date.now() };
        return NextResponse.json(data, {
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
        });
      }
    } catch (e) {
      console.error("Finnhub failed:", e);
    }
  }

  // Strategy 3: FMP demo
  try {
    const fmpRes = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=demo`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) }
    );
    if (fmpRes.ok) {
      const fmpData = await fmpRes.json();
      if (Array.isArray(fmpData) && fmpData.length > 0) {
        cache = { data: fmpData, ts: Date.now() };
        return NextResponse.json(fmpData, {
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
        });
      }
    }
  } catch (e) {
    console.error("FMP failed:", e);
  }

  // Return stale cache if available
  if (cache.data.length > 0) {
    return NextResponse.json(cache.data, {
      headers: { "X-Data-Stale": "true", "Cache-Control": "public, s-maxage=30" },
    });
  }

  return NextResponse.json([], { status: 200 });
}
