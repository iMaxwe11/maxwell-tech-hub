import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Now — Maxwell Nixon",
  description:
    "A snapshot of what I'm working on, learning, and thinking about right now. Updated periodically.",
  openGraph: {
    title: "Now — Maxwell Nixon",
    description: "What I'm focused on right now.",
    url: `${siteConfig.url}/now`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: { canonical: `${siteConfig.url}/now` },
};

export default function NowLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
