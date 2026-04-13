import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Neon Arcade",
  description: "A retro-inspired browser arcade with Snake, Pong, Memory Matrix, Reaction Tester, and Type Racer.",
  path: "/play",
  tag: "Arcade",
  keywords: ["browser games", "retro arcade", "snake game", "pong", "typing game"],
});

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
