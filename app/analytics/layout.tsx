import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics · Maxwell Nixon",
  description:
    "Privacy-respecting session analytics. See your own journey through maxwellnixon.com — no tracking, no cookies, all data stays on your device.",
  openGraph: {
    title: "Analytics · Maxwell Nixon",
    description: "Client-side visitor dashboard. Your data never leaves your device.",
  },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
