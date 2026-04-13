import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Space Dashboard",
  description: "Track launches, ISS telemetry, NASA imagery, Mars rover photos, NEO alerts, and space weather in one live dashboard.",
  path: "/space",
  tag: "Space",
  keywords: ["NASA", "ISS tracker", "launch schedule", "Mars rover", "space weather"],
});

export default function SpaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
