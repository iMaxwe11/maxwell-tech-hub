import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Tech Shorts",
  description:
    "Build logs from Maxwell Nixon's projects and homelab, plus AI-curated micro-articles on technology, science, space, and developer culture.",
  path: "/blog",
  keywords: ["Blog", "Build Log", "Homelab", "Tech Shorts"],
  tag: "Blog",
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
