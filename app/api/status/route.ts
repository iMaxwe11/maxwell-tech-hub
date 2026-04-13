import { NextRequest, NextResponse } from "next/server";
import type { ServiceStatus, ComponentStatus, ActiveIncident } from "@/lib/types";

// Service configuration
interface ServiceConfig {
  name: string;
  category: "cloud" | "social" | "streaming" | "gaming" | "ai";
  url: string;
  icon: string;
  apiUrl: string;
  type: "statuspage" | "head-check";
  statuspageBase?: string; // Base URL for Statuspage API (e.g., https://www.githubstatus.com)
}

const SERVICES: ServiceConfig[] = [
  // Cloud & Dev (24 original services)
  {
    name: "GitHub",
    category: "cloud",
    url: "https://github.com",
    icon: "🐙",
    apiUrl: "https://www.githubstatus.com/api/v2/status.json",
    statuspageBase: "https://www.githubstatus.com",
    type: "statuspage",
  },
  {
    name: "Vercel",
    category: "cloud",
    url: "https://vercel.com",
    icon: "▲",
    apiUrl: "https://www.vercel-status.com/api/v2/status.json",
    statuspageBase: "https://www.vercel-status.com",
    type: "statuspage",
  },
  {
    name: "Cloudflare",
    category: "cloud",
    url: "https://cloudflare.com",
    icon: "☁️",
    apiUrl: "https://www.cloudflarestatus.com/api/v2/status.json",
    statuspageBase: "https://www.cloudflarestatus.com",
    type: "statuspage",
  },
  {
    name: "AWS",
    category: "cloud",
    url: "https://aws.amazon.com",
    icon: "📦",
    apiUrl: "https://health.aws.amazon.com/health/status",
    type: "statuspage",
  },
  {
    name: "Netlify",
    category: "cloud",
    url: "https://netlify.com",
    icon: "⚡",
    apiUrl: "https://www.netlifystatus.com/api/v2/status.json",
    statuspageBase: "https://www.netlifystatus.com",
    type: "statuspage",
  },
  {
    name: "npm",
    category: "cloud",
    url: "https://npmjs.com",
    icon: "📦",
    apiUrl: "https://status.npmjs.org/api/v2/status.json",
    statuspageBase: "https://status.npmjs.org",
    type: "statuspage",
  },
  {
    name: "DigitalOcean",
    category: "cloud",
    url: "https://digitalocean.com",
    icon: "🌊",
    apiUrl: "https://status.digitalocean.com/api/v2/status.json",
    statuspageBase: "https://status.digitalocean.com",
    type: "statuspage",
  },
  {
    name: "Docker Hub",
    category: "cloud",
    url: "https://hub.docker.com",
    icon: "🐳",
    apiUrl: "https://hub.docker.com",
    type: "head-check",
  },
  {
    name: "Railway",
    category: "cloud",
    url: "https://railway.app",
    icon: "🚆",
    apiUrl: "https://railway.app",
    type: "head-check",
  },

  // Social & Communication (6 original + 3 new)
  {
    name: "Discord",
    category: "social",
    url: "https://discord.com",
    icon: "💬",
    apiUrl: "https://discordstatus.com/api/v2/status.json",
    statuspageBase: "https://discordstatus.com",
    type: "statuspage",
  },
  {
    name: "Reddit",
    category: "social",
    url: "https://reddit.com",
    icon: "🔴",
    apiUrl: "https://www.redditstatus.com/api/v2/status.json",
    statuspageBase: "https://www.redditstatus.com",
    type: "statuspage",
  },
  {
    name: "Slack",
    category: "social",
    url: "https://slack.com",
    icon: "🟣",
    apiUrl: "https://status.slack.com/api/v2.0/current",
    statuspageBase: "https://status.slack.com",
    type: "statuspage",
  },
  {
    name: "Twitter/X",
    category: "social",
    url: "https://x.com",
    icon: "𝕏",
    apiUrl: "https://x.com",
    type: "head-check",
  },
  {
    name: "Zoom",
    category: "social",
    url: "https://zoom.us",
    icon: "📹",
    apiUrl: "https://status.zoom.us/api/v2/status.json",
    statuspageBase: "https://status.zoom.us",
    type: "statuspage",
  },
  {
    name: "WhatsApp",
    category: "social",
    url: "https://web.whatsapp.com",
    icon: "💚",
    apiUrl: "https://web.whatsapp.com",
    type: "head-check",
  },
  {
    name: "Telegram",
    category: "social",
    url: "https://web.telegram.org",
    icon: "📱",
    apiUrl: "https://web.telegram.org",
    type: "head-check",
  },
  {
    name: "LinkedIn",
    category: "social",
    url: "https://linkedin.com",
    icon: "💼",
    apiUrl: "https://linkedin.com",
    type: "head-check",
  },

  // Streaming & Media (4 original + 3 new)
  {
    name: "YouTube",
    category: "streaming",
    url: "https://youtube.com",
    icon: "📺",
    apiUrl: "https://www.youtube.com",
    type: "head-check",
  },
  {
    name: "Twitch",
    category: "streaming",
    url: "https://twitch.tv",
    icon: "🎮",
    apiUrl: "https://status.twitch.tv/api/v2/status.json",
    statuspageBase: "https://status.twitch.tv",
    type: "statuspage",
  },
  {
    name: "Spotify",
    category: "streaming",
    url: "https://spotify.com",
    icon: "🎵",
    apiUrl: "https://status.spotify.dev",
    type: "head-check",
  },
  {
    name: "Netflix",
    category: "streaming",
    url: "https://netflix.com",
    icon: "🎬",
    apiUrl: "https://www.netflix.com",
    type: "head-check",
  },
  {
    name: "Disney+",
    category: "streaming",
    url: "https://disneyplus.com",
    icon: "🏰",
    apiUrl: "https://disneyplus.com",
    type: "head-check",
  },
  {
    name: "Hulu",
    category: "streaming",
    url: "https://hulu.com",
    icon: "📹",
    apiUrl: "https://hulu.com",
    type: "head-check",
  },
  {
    name: "Apple Music",
    category: "streaming",
    url: "https://music.apple.com",
    icon: "🎶",
    apiUrl: "https://music.apple.com",
    type: "head-check",
  },

  // Gaming (5 original + 4 new)
  {
    name: "Steam",
    category: "gaming",
    url: "https://steampowered.com",
    icon: "🎮",
    apiUrl: "https://store.steampowered.com",
    type: "head-check",
  },
  {
    name: "PlayStation Network",
    category: "gaming",
    url: "https://playstation.com",
    icon: "🎮",
    apiUrl: "https://status.playstation.com",
    type: "head-check",
  },
  {
    name: "Xbox Live",
    category: "gaming",
    url: "https://xbox.com",
    icon: "🎮",
    apiUrl: "https://support.xbox.com",
    type: "head-check",
  },
  {
    name: "Epic Games",
    category: "gaming",
    url: "https://epicgames.com",
    icon: "🎮",
    apiUrl: "https://status.epicgames.com/api/v2/status.json",
    statuspageBase: "https://status.epicgames.com",
    type: "statuspage",
  },
  {
    name: "Roblox",
    category: "gaming",
    url: "https://roblox.com",
    icon: "🎮",
    apiUrl: "https://www.roblox.com",
    type: "head-check",
  },
  {
    name: "Riot Games",
    category: "gaming",
    url: "https://status.riotgames.com",
    icon: "⚔️",
    apiUrl: "https://status.riotgames.com",
    type: "head-check",
  },
  {
    name: "Minecraft",
    category: "gaming",
    url: "https://minecraft.net",
    icon: "⛏️",
    apiUrl: "https://minecraft.net",
    type: "head-check",
  },
  {
    name: "Nintendo",
    category: "gaming",
    url: "https://nintendo.com",
    icon: "🎮",
    apiUrl: "https://nintendo.com",
    type: "head-check",
  },

  // AI & Productivity (4 original + 5 new)
  {
    name: "OpenAI",
    category: "ai",
    url: "https://openai.com",
    icon: "🤖",
    apiUrl: "https://status.openai.com/api/v2/status.json",
    statuspageBase: "https://status.openai.com",
    type: "statuspage",
  },
  {
    name: "Anthropic",
    category: "ai",
    url: "https://anthropic.com",
    icon: "🤖",
    apiUrl: "https://console.anthropic.com",
    type: "head-check",
  },
  {
    name: "Notion",
    category: "ai",
    url: "https://notion.so",
    icon: "📝",
    apiUrl: "https://status.notion.so/api/v2/status.json",
    statuspageBase: "https://status.notion.so",
    type: "statuspage",
  },
  {
    name: "Figma",
    category: "ai",
    url: "https://figma.com",
    icon: "🎨",
    apiUrl: "https://status.figma.com/api/v2/status.json",
    statuspageBase: "https://status.figma.com",
    type: "statuspage",
  },
  {
    name: "Google Gemini",
    category: "ai",
    url: "https://gemini.google.com",
    icon: "✨",
    apiUrl: "https://gemini.google.com",
    type: "head-check",
  },
  {
    name: "Perplexity",
    category: "ai",
    url: "https://perplexity.ai",
    icon: "🔍",
    apiUrl: "https://perplexity.ai",
    type: "head-check",
  },
  {
    name: "Midjourney",
    category: "ai",
    url: "https://midjourney.com",
    icon: "🎨",
    apiUrl: "https://midjourney.com",
    type: "head-check",
  },
  {
    name: "Hugging Face",
    category: "ai",
    url: "https://huggingface.co",
    icon: "🤗",
    apiUrl: "https://huggingface.co",
    type: "head-check",
  },
];

// In-memory cache
interface CacheEntry {
  data: ServiceStatus[];
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_DURATION = 90 * 1000; // 90 seconds

// Parse Atlassian Statuspage API response
function parseStatuspageResponse(data: any): {
  status: "operational" | "degraded" | "outage" | "unknown";
  message: string;
} {
  try {
    const indicator = data?.status?.indicator;
    const description = data?.status?.description || "";

    switch (indicator) {
      case "none":
        return { status: "operational", message: description || "All systems operational" };
      case "minor":
        return { status: "degraded", message: description || "Minor issues detected" };
      case "major":
        return { status: "outage", message: description || "Major outage" };
      case "critical":
        return { status: "outage", message: description || "Critical outage" };
      default:
        return { status: "unknown", message: "Unable to determine status" };
    }
  } catch {
    return { status: "unknown", message: "Error parsing status" };
  }
}

// Fetch components for Statuspage services
async function fetchComponents(
  statuspageBase: string | undefined,
  signal: AbortSignal
): Promise<ComponentStatus[]> {
  if (!statuspageBase) return [];

  try {
    const response = await fetch(`${statuspageBase}/api/v2/components.json`, {
      signal,
      headers: {
        "User-Agent": "Maxwell-Tech-Hub Status Monitor",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const components = (data?.components || []) as any[];
      return components
        .slice(0, 5) // Limit to 5 components for brevity
        .map((c) => ({
          name: c.name || "Unknown",
          status: c.status || "unknown",
        }));
    }
  } catch {
    // Silently fail - component data is optional
  }

  return [];
}

// Fetch unresolved incidents for Statuspage services
async function fetchIncidents(
  statuspageBase: string | undefined,
  signal: AbortSignal
): Promise<ActiveIncident[]> {
  if (!statuspageBase) return [];

  try {
    const response = await fetch(`${statuspageBase}/api/v2/incidents/unresolved.json`, {
      signal,
      headers: {
        "User-Agent": "Maxwell-Tech-Hub Status Monitor",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const incidents = (data?.incidents || []) as any[];
      return incidents
        .slice(0, 3) // Limit to 3 most recent incidents
        .map((incident) => {
          const latestUpdate =
            incident?.updates?.[0]?.body || "No update available";
          return {
            name: incident.name || "Unknown Incident",
            impact: incident.impact || "unknown",
            status: incident.status || "investigating",
            updatedAt: incident.updated_at || new Date().toISOString(),
            latestUpdate: latestUpdate.substring(0, 100) + (latestUpdate.length > 100 ? "..." : ""),
          };
        });
    }
  } catch {
    // Silently fail - incident data is optional
  }

  return [];
}

// Check individual service with enhanced data fetching
async function checkService(service: ServiceConfig): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    if (service.type === "statuspage") {
      // Fetch statuspage API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetch(service.apiUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Maxwell-Tech-Hub Status Monitor",
          },
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json();
          const { status, message } = parseStatuspageResponse(data);

          // Fetch components and incidents in parallel
          const componentController = new AbortController();
          const componentTimeoutId = setTimeout(
            () => componentController.abort(),
            8000
          );
          const incidentController = new AbortController();
          const incidentTimeoutId = setTimeout(
            () => incidentController.abort(),
            8000
          );

          const [components, incidents] = await Promise.all([
            fetchComponents(service.statuspageBase, componentController.signal),
            fetchIncidents(service.statuspageBase, incidentController.signal),
          ]);

          clearTimeout(componentTimeoutId);
          clearTimeout(incidentTimeoutId);

          return {
            name: service.name,
            category: service.category,
            status,
            responseTime,
            statusMessage: message,
            url: service.url,
            icon: service.icon,
            lastChecked: new Date().toISOString(),
            components: components.length > 0 ? components : undefined,
            activeIncidents: incidents.length > 0 ? incidents : undefined,
          };
        } else {
          return {
            name: service.name,
            category: service.category,
            status: "unknown",
            responseTime,
            statusMessage: `API returned ${response.status}`,
            url: service.url,
            icon: service.icon,
            lastChecked: new Date().toISOString(),
          };
        }
      } catch (error) {
        clearTimeout(timeoutId);
        // Request failed or timed out
        return {
          name: service.name,
          category: service.category,
          status: "unknown",
          responseTime: null,
          statusMessage: "Unable to fetch status",
          url: service.url,
          icon: service.icon,
          lastChecked: new Date().toISOString(),
        };
      }
    } else {
      // HEAD request for simple availability check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetch(service.apiUrl, {
          method: "HEAD",
          signal: controller.signal,
          headers: {
            "User-Agent": "Maxwell-Tech-Hub Status Monitor",
          },
          redirect: "follow",
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        // 2xx or 3xx = operational
        const isOperational = response.status >= 200 && response.status < 400;

        return {
          name: service.name,
          category: service.category,
          status: isOperational ? "operational" : "degraded",
          responseTime,
          statusMessage: isOperational ? "Service is operational" : `HTTP ${response.status}`,
          url: service.url,
          icon: service.icon,
          lastChecked: new Date().toISOString(),
        };
      } catch (error) {
        clearTimeout(timeoutId);
        return {
          name: service.name,
          category: service.category,
          status: "unknown",
          responseTime: null,
          statusMessage: "Unable to reach service",
          url: service.url,
          icon: service.icon,
          lastChecked: new Date().toISOString(),
        };
      }
    }
  } catch (error) {
    return {
      name: service.name,
      category: service.category,
      status: "unknown",
      responseTime: null,
      statusMessage: "Check failed",
      url: service.url,
      icon: service.icon,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Check all services in parallel
async function checkAllServices(): Promise<ServiceStatus[]> {
  const results = await Promise.allSettled(SERVICES.map(checkService));

  return results
    .map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        // Fallback if promise rejected
        return {
          name: "Unknown",
          category: "cloud" as const,
          status: "unknown" as const,
          responseTime: null,
          statusMessage: "Service check failed",
          url: "",
          icon: "❓",
          lastChecked: new Date().toISOString(),
        };
      }
    })
    .sort((a, b) => {
      // Sort by category first, then by name
      if (a.category !== b.category) {
        const categoryOrder = { cloud: 0, social: 1, streaming: 2, gaming: 3, ai: 4 };
        return categoryOrder[a.category] - categoryOrder[b.category];
      }
      return a.name.localeCompare(b.name);
    });
}

export async function GET(request: NextRequest) {
  const now = Date.now();

  // Check if cache is valid
  if (cache && now - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache.data, {
      headers: {
        "Cache-Control": "public, s-maxage=90, stale-while-revalidate=180",
        "X-Cache": "HIT",
        "Content-Type": "application/json",
      },
    });
  }

  // Cache miss - check all services
  const data = await checkAllServices();

  // Update cache
  cache = {
    data,
    timestamp: now,
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=90, stale-while-revalidate=180",
      "X-Cache": "MISS",
      "Content-Type": "application/json",
    },
  });
}
