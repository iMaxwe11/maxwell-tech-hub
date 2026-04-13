import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

const routes = [
  "",
  "/tools",
  "/space",
  "/weather",
  "/news",
  "/blog",
  "/status",
  "/play",
  "/play/snake",
  "/play/pong",
  "/play/memory",
  "/play/reaction",
  "/play/typing",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/play/") ? "monthly" : "weekly",
    priority: path === "" ? 1 : path === "/tools" || path === "/space" || path === "/play" ? 0.9 : 0.7,
  }));
}
