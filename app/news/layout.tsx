import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "News Feed",
  description: "Auto-curated tech, world, and gaming headlines with keyless video highlights and compact live stats.",
  path: "/news",
  tag: "News",
  keywords: ["RSS", "technology news", "world news", "gaming news", "YouTube feeds"],
});

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
