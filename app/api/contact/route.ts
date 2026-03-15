import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Send via FormSubmit.co — free email forwarding, no API key needed
    const res = await fetch("https://formsubmit.co/ajax/mnixon112@outlook.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: `New message from ${name} via maxwellnixon.com`,
        _template: "table",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("FormSubmit error:", text);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Contact API error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
