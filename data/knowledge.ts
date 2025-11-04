export type KBItem = { q: string; a: string; tags?: string[] };

export const KNOWLEDGE_BASE: KBItem[] = [
  { q: "What is this site?", a: "Maxwell Tech Hub is an interactive portfolio that blends a clean tech studio vibe with an experimental playground—featuring tools, a standalone terminal, music embeds, and a chatbot." },
  { q: "What tools are included?", a: "Tools include: Color Palette, Markdown Preview, Inspiration, JSON Formatter, Regex Tester, Timestamp Converter, Color Contrast Checker, Generator Kit (UUID/Password), Base64 Encoder/Decoder, and URL Encoder/Decoder.", tags: ["tools"] },
  { q: "How do I open the terminal?", a: "Go to /terminal. Type 'help' to see commands like about, projects, contact, echo, obsidian, and clear.", tags: ["terminal"] },
  { q: "What terminal commands exist?", a: "help, about, projects, contact, echo [text], obsidian (theme), clear. The console is a playful way to explore info.", tags: ["terminal"] },
  { q: "How do I change themes?", a: "Use the Theme buttons in the header. Themes: Studio (default), Obsidian, Aurora.", tags: ["theme"] },
  { q: "How does music work?", a: "On the home page Music panel, switch between Spotify and SoundCloud embeds. Replace the default URLs in components/MusicPanel.tsx to feature your own playlists/tracks.", tags: ["music"] },
  { q: "Contact info", a: "Email: mnixon112@outlook.com — GitHub: github.com/iMaxwe11", tags: ["contact"] },
  { q: "Projects", a: "Recent projects: Interactive Hub v2 (this site), Terminal UI experiments, Obsidian Echoes (concept).", tags: ["projects"] },
  { q: "How to enable real AI?", a: "Create .env.local and add OPENAI_API_KEY=your_key_here. The /api/chat route will then call OpenAI; otherwise it uses a smart local fallback.", tags: ["ai"] },
];
