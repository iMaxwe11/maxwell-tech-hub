import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "apod";
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";

  try {
    let url = "";
    if (endpoint === "apod") {
      url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
    } else if (endpoint === "neo") {
      const today = new Date().toISOString().split("T")[0];
      url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&api_key=${apiKey}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch NASA data" }, { status: 500 });
  }
}