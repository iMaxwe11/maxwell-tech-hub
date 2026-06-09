import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { POSTS } from "@/lib/blog-posts";

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
  "/tesla",
  "/analytics",
  "/contact",
  "/credits",
  "/uses",
];

const HIGH_PRIORITY = new Set(["/projects", "/tools", "/space", "/play", "/blog"]);

export default function sitemap(): MetadataRoute.Sitemap {
  // Static routes: no lastModified claim — stamping every URL with the build
  // date on each deploy erodes crawler trust in the field.
  const staticEntries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: path.startsWith("/play/") ? "monthly" : "weekly",
    priority: path === "" ? 1 : HIGH_PRIORITY.has(path) ? 0.9 : 0.7,
  }));

  // Blog posts carry their real publish dates.
  const blogEntries: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${siteConfig.url}/blog/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly",
    priority: post.original ? 0.8 : 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
