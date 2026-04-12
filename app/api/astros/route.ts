import { NextResponse } from "next/server";

let cache: { data: any; ts: number } | null = null;
const TTL = 300_000; // 5 min

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json(cache.data);
  }
  try {
    const res = await fetch("http://api.open-notify.org/astros.json", {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch {
    // Fallback: return a reasonable static list when API is down
    return NextResponse.json({
      message: "success",
      number: 0,
      people: [],
    });
  }
}
