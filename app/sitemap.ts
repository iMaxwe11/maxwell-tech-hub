import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

const routes = [
  "",
  "/projects",
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
  "/terminal",
  "/now",
  "/analytics",
  "/contact",
  "/credits",
];

const HIGH_PRIORITY = new Set(["/projects", "/tools", "/space", "/play"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency: path.startsWith("/play/") ? "monthly" : "weekly",
    priority: path === "" ? 1 : HIGH_PRIORITY.has(path) ? 0.9 : 0.7,
  }));
}
