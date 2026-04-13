import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} | Tech Hub`,
    short_name: "maxwellnixon",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#020204",
    theme_color: "#020204",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
