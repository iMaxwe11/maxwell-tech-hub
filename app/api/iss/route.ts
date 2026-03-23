import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
    const data = await res.json();
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ISS data" }, { status: 500 });
  }
}