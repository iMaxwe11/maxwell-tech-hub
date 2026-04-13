import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Weather Dashboard",
  description: "Live Southampton, NJ weather with radar, hourly and daily forecasts, wind visuals, AQI, and precipitation timing.",
  path: "/weather",
  tag: "Weather",
  keywords: ["weather dashboard", "Southampton NJ weather", "radar", "forecast", "air quality"],
});

export default function WeatherLayout({ children }: { children: React.ReactNode }) {
  return children;
}
