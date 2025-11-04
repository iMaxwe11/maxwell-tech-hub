# Maxwell Tech Hub v2 (Full Security)

Next.js 15 + Tailwind + Framer Motion

## Features
- **Standalone Terminal** (/terminal)
- **Tools**: Palette, Markdown, Inspiration, JSON, Regex, Timestamp, Contrast, Generator, Base64, URL
- **Music** panel (Spotify/SoundCloud)
- **Smarter Chatbot** with local knowledge + optional OpenAI (/.env.local)
- **VirusTotal Scanner** at **/security**

## Setup
```bash
npm install -g pnpm
pnpm install
pnpm dev
# http://localhost:3000
```

Create `.env.local` (do not commit it):
```
OPENAI_API_KEY=your_openai_key
# OPENAI_MODEL=gpt-4o-mini   # optional

VT_API_KEY=your_virustotal_key
```

Then visit **/security** to scan files (<= 32MB on free VT).

## Deploy
Use Vercel and add env vars in the dashboard (never expose keys client-side).
