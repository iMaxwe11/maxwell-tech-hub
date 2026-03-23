import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "5";

  try {
    const res = await fetch(`https://api.coincap.io/v2/assets?limit=${limit}`, {
      cache: 'no-store' // Force fresh data
    });
    
    if (!res.ok) {
      console.error(`CoinCap API failed with status: ${res.status}`);
      return NextResponse.json([], { status: 200 }); // Return empty array on error
    }
    
    const json = await res.json();
    
    // Ensure we return the data array
    if (!json.data || !Array.isArray(json.data)) {
      console.error("Invalid response format from CoinCap:", json);
      return NextResponse.json([], { status: 200 }); // Return empty array
    }
    
    return NextResponse.json(json.data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Crypto API error:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error
  }
}
