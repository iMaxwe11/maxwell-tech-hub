import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Shorts | Maxwell Nixon",
  description: "AI-generated micro-articles on technology, science, space, and developer culture.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
