import { NextResponse } from "next/server";

// Popular stocks to track
const STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"];

export async function GET() {
  try {
    const symbols = STOCKS.join(",");
    const res = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=demo`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) {
      console.error(`Stock API failed with status: ${res.status}`);
      return NextResponse.json([], { status: 200 });
    }
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Stock API returned non-JSON response (likely rate limited)");
      return NextResponse.json([], { status: 200 });
    }
    
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      console.error("Invalid response format from stock API:", data);
      return NextResponse.json([], { status: 200 });
    }
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Stock API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
