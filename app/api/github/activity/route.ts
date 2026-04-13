import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site-config";
import type { GitHubActivityItem, GitHubProfileSummary } from "@/lib/types";

const CACHE_TTL = 10 * 60 * 1000;

let cache: { data: { profile: GitHubProfileSummary | null; items: GitHubActivityItem[] }; ts: number } | null = null;

function toRepoUrl(repoName: string) {
  return `https://github.com/${repoName}`;
}

function getCommitUrl(repoName: string, apiUrl?: string) {
  if (!apiUrl) return toRepoUrl(repoName);
  return apiUrl
    .replace("https://api.github.com/repos/", "https://github.com/")
    .replace("/commits/", "/commit/");
}

function mapGitHubEvent(event: any): GitHubActivityItem | null {
  const repoName = event?.repo?.name;
  if (!repoName || !event?.type || !event?.id || !event?.created_at) {
    return null;
  }

  switch (event.type) {
    case "PushEvent": {
      const commits = Array.isArray(event.payload?.commits) ? event.payload.commits : [];
      const firstCommit = commits[0];
      return {
        id: event.id,
        type: event.type,
        repo: repoName,
        action: `Pushed ${commits.length || 1} commit${commits.length === 1 ? "" : "s"}`,
        url: getCommitUrl(repoName, firstCommit?.url),
        createdAt: event.created_at,
        icon: "↗",
        detail: firstCommit?.message?.split("\n")[0],
      };
    }
    case "CreateEvent":
      return {
        id: event.id,
        type: event.type,
        repo: repoName,
        action: `Created ${event.payload?.ref_type || "resource"}`,
        url: toRepoUrl(repoName),
        createdAt: event.created_at,
        icon: "+",
        detail: event.payload?.ref || undefined,
      };
    case "PullRequestEvent":
      return {
        id: event.id,
        type: event.type,
        repo: repoName,
        action: `${event.payload?.action || "Updated"} pull request`,
        url: event.payload?.pull_request?.html_url || toRepoUrl(repoName),
        createdAt: event.created_at,
        icon: "⇄",
        detail: event.payload?.pull_request?.title,
      };
    case "WatchEvent":
      return {
        id: event.id,
        type: event.type,
        repo: repoName,
        action: "Starred repository",
        url: toRepoUrl(repoName),
        createdAt: event.created_at,
        icon: "★",
      };
    case "IssuesEvent":
      return {
        id: event.id,
        type: event.type,
        repo: repoName,
        action: `${event.payload?.action || "Updated"} issue`,
        url: event.payload?.issue?.html_url || toRepoUrl(repoName),
        createdAt: event.created_at,
        icon: "!",
        detail: event.payload?.issue?.title,
      };
    default:
      return {
        id: event.id,
        type: event.type,
        repo: repoName,
        action: event.type.replace("Event", ""),
        url: toRepoUrl(repoName),
        createdAt: event.created_at,
        icon: "•",
      };
  }
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const [profileResponse, eventsResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${siteConfig.githubUsername}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "maxwell-tech-hub/1.0",
        },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(10_000),
      }),
      fetch(`https://api.github.com/users/${siteConfig.githubUsername}/events/public?per_page=8`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "maxwell-tech-hub/1.0",
        },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(10_000),
      }),
    ]);

    if (!profileResponse.ok || !eventsResponse.ok) {
      throw new Error(`GitHub request failed (${profileResponse.status}/${eventsResponse.status})`);
    }

    const profileJson = await profileResponse.json();
    const eventsJson = await eventsResponse.json();

    const profile: GitHubProfileSummary = {
      login: profileJson.login,
      publicRepos: profileJson.public_repos ?? 0,
      followers: profileJson.followers ?? 0,
      following: profileJson.following ?? 0,
      htmlUrl: profileJson.html_url,
    };

    const items = Array.isArray(eventsJson)
      ? eventsJson.map(mapGitHubEvent).filter((item): item is GitHubActivityItem => Boolean(item)).slice(0, 6)
      : [];

    const data = { profile, items };
    cache = { data, ts: Date.now() };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error(error);

    if (cache) {
      return NextResponse.json(cache.data, {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
          "X-Cache": "STALE",
        },
      });
    }

    return NextResponse.json({ error: "Unable to load GitHub activity right now." }, { status: 502 });
  }
}
