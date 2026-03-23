import { NextResponse } from "next/server";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META"];

export async function GET() {
  // Try multiple free sources in order of reliability
  try {
    // Attempt 1: Yahoo Finance v8 (works from most server environments)
    const joined = SYMBOLS.join(",");
    const yRes = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${joined}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      }
    );

    if (yRes.ok) {
      const json = await yRes.json();
      const quotes = json?.quoteResponse?.result;
      if (Array.isArray(quotes) && quotes.length > 0) {
        const data = quotes.map((q: Record<string, unknown>) => ({
          symbol: q.symbol,
          name: q.shortName || q.longName || q.symbol,
          price: q.regularMarketPrice || 0,
          change: q.regularMarketChange || 0,
          changesPercentage: q.regularMarketChangePercent || 0,
        }));
        return NextResponse.json(data, {
          headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
        });
      }
    }
  } catch (e) {
    console.error("Yahoo Finance failed:", e);
  }

  // Attempt 2: FMP demo (limited to AAPL but proves connectivity)
  try {
    const fmpRes = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=demo`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) }
    );
    if (fmpRes.ok) {
      const fmpData = await fmpRes.json();
      if (Array.isArray(fmpData) && fmpData.length > 0) {
        return NextResponse.json(fmpData, {
          headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
        });
      }
    }
  } catch (e) {
    console.error("FMP failed:", e);
  }

  // If all APIs fail, return empty — client will show fallback
  return NextResponse.json([], { status: 200 });
}
