import { NextResponse } from "next/server";
import { KNOWLEDGE_BASE } from "@/data/knowledge";

function tokenize(s: string): string[] {
  return (s || "").toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
}
function score(query: string, text: string) {
  const q = new Set(tokenize(query)); const t = new Set(tokenize(text));
  let hit = 0; for (const w of q) if (t.has(w)) hit++; return hit;
}
function retrieve(query: string, k = 3) {
  return KNOWLEDGE_BASE
    .map(item => ({ item, s: score(query, item.q + " " + (item.tags || []).join(" ")) }))
    .sort((a,b)=> b.s - a.s).filter(x => x.s > 0).slice(0, k).map(x => x.item);
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastUser = messages?.findLast?.((m:any)=> m.role==="user")?.content || "";
  const apiKey = process.env.OPENAI_API_KEY;

  const top = retrieve(lastUser, 3);
  const context = top.length
    ? "Context:\n" + top.map((x,i)=> `${i+1}. ${x.a}`).join("\n")
    : "Context:\nKey site facts: tools, terminal at /terminal, music embeds on home, themes in header, contact mnixon112@outlook.com.";

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are Maxwell's portfolio assistant. Be concise, friendly, and technically accurate. Point users to relevant routes (/, /tools, /terminal, /contact). Use the provided context to answer." },
            { role: "system", content: context },
            ...(messages || [])
          ]
        })
      });
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content || "I'm here!";
      return NextResponse.json({ reply });
    } catch (e:any) { /* fall back */ }
  }

  if (top.length) return NextResponse.json({ reply: top[0].a });
  const low = lastUser.toLowerCase();
  if (low.includes("contact")) return NextResponse.json({ reply: "Email: mnixon112@outlook.com — GitHub: github.com/iMaxwe11" });
  if (low.includes("tool")) return NextResponse.json({ reply: "Head to /tools for Color Palette, Markdown, Inspiration, JSON, Regex, Timestamp, Contrast, Generator, Base64, and URL utils." });
  if (low.includes("terminal")) return NextResponse.json({ reply: "Open /terminal and type 'help' to see commands. Try 'obsidian' for theme." });
  if (low.includes("music")) return NextResponse.json({ reply: "On the home page Music panel, switch between Spotify and SoundCloud embeds." });
  return NextResponse.json({ reply: "I'm Maxwell Bot. Ask about tools (/tools), the terminal (/terminal), themes, music, projects, or contact." });
}
