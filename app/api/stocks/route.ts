import { NextResponse } from "next/server";

export const runtime = "edge";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META"];

export async function GET() {
  try {
    // Try Yahoo Finance first
    const symbols = SYMBOLS.join(",");
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      }
    );

    if (res.ok) {
      const json = await res.json();
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

    // Fallback: FMP with demo key (limited to AAPL)
    const fmpRes = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=demo`,
      { cache: "no-store" }
    );
    if (fmpRes.ok) {
      const fmpData = await fmpRes.json();
      if (Array.isArray(fmpData) && fmpData.length > 0) {
        return NextResponse.json(fmpData, {
          headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
        });
      }
    }

    return NextResponse.json([], { status: 200 });
  } catch (error) {
    console.error("Stock API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
