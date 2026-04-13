import { NextRequest, NextResponse } from "next/server";
import type { ServiceStatus } from "@/lib/types";

// Service configuration
interface ServiceConfig {
  name: string;
  category: "cloud" | "social" | "streaming" | "gaming" | "ai";
  url: string;
  icon: string;
  apiUrl: string;
  type: "statuspage" | "head-check";
}

const SERVICES: ServiceConfig[] = [
  // Cloud & Dev
  {
    name: "GitHub",
    category: "cloud",
    url: "https://github.com",
    icon: "🐙",
    apiUrl: "https://www.githubstatus.com/api/v2/status.json",
    type: "statuspage",
  },
  {
    name: "Vercel",
    category: "cloud",
    url: "https://vercel.com",
    icon: "▲",
    apiUrl: "https://www.vercel-status.com/api/v2/status.json",
    type: "statuspage",
  },
  {
    name: "Cloudflare",
    category: "cloud",
    url: "https://cloudflare.com",
    icon: "☁️",
    apiUrl: "https://www.cloudflarestatus.com/api/v2/status.json",
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
    type: "statuspage",
  },
  {
    name: "npm",
    category: "cloud",
    url: "https://npmjs.com",
    icon: "📦",
    apiUrl: "https://status.npmjs.org/api/v2/status.json",
    type: "statuspage",
  },

  // Social & Communication
  {
    name: "Discord",
    category: "social",
    url: "https://discord.com",
    icon: "💬",
    apiUrl: "https://discordstatus.com/api/v2/status.json",
    type: "statuspage",
  },
  {
    name: "Reddit",
    category: "social",
    url: "https://reddit.com",
    icon: "🔴",
    apiUrl: "https://www.redditstatus.com/api/v2/status.json",
    type: "statuspage",
  },
  {
    name: "Slack",
    category: "social",
    url: "https://slack.com",
    icon: "🟣",
    apiUrl: "https://status.slack.com/api/v2.0/current",
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
    type: "statuspage",
  },

  // Streaming & Media
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

  // Gaming
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

  // AI & Productivity
  {
    name: "OpenAI",
    category: "ai",
    url: "https://openai.com",
    icon: "🤖",
    apiUrl: "https://status.openai.com/api/v2/status.json",
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
    type: "statuspage",
  },
  {
    name: "Figma",
    category: "ai",
    url: "https://figma.com",
    icon: "🎨",
    apiUrl: "https://status.figma.com/api/v2/status.json",
    type: "statuspage",
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

// Check individual service
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
          return {
            name: service.name,
            category: service.category,
            status,
            responseTime,
            statusMessage: message,
            url: service.url,
            icon: service.icon,
            lastChecked: new Date().toISOString(),
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
