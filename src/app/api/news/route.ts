import { NextResponse } from "next/server";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: "hackernews" | "github" | "reddit" | "anthropic";
  sourceLabel: string;
  timestamp: string; // ISO string
  score?: number;    // HN points / GH stars
  comments?: number;
  author?: string;
  category: "model" | "feature" | "api" | "research" | "safety" | "product" | "general";
}

// ─── Category heuristic ───────────────────────────────────────────────────────

function guessCategory(title: string, body = ""): NewsItem["category"] {
  const t = (title + " " + body).toLowerCase();
  if (/\bopus\b|\bsonnet\b|\bhaiku\b|\bclaude [234]\b|\bmodel release\b|\bbenchmark\b|\bmmlu\b/.test(t)) return "model";
  if (/\bapi\b|\bsdk\b|\bstreaming\b|\btokens?\b|\blatency\b|\bendpoint\b/.test(t)) return "api";
  if (/\bsafety\b|\balignment\b|\bconstitutional\b|\bharmful\b|\brlhf\b|\brsps?\b/.test(t)) return "safety";
  if (/\bresearch\b|\bpaper\b|\bstudy\b|\bscientific\b/.test(t)) return "research";
  if (/\bcomputer use\b|\btool use\b|\bagent\b|\bautomation\b|\bfunction call/.test(t)) return "feature";
  if (/\bclaude\.ai\b|\bproduct\b|\blaunch\b|\bpro\b|\bteam\b|\bworkspace\b/.test(t)) return "product";
  return "general";
}

// ─── HackerNews ───────────────────────────────────────────────────────────────

async function fetchHackerNews(): Promise<NewsItem[]> {
  const results: NewsItem[] = [];

  // Search for Anthropic + Claude stories via Algolia HN API
  const queries = [
    "https://hn.algolia.com/api/v1/search?query=anthropic+claude&tags=story&hitsPerPage=8&restrictSearchableAttributes=title",
    "https://hn.algolia.com/api/v1/search?query=anthropic&tags=story&hitsPerPage=6&restrictSearchableAttributes=title",
    "https://hn.algolia.com/api/v1/search?query=model+context+protocol&tags=story&hitsPerPage=4&restrictSearchableAttributes=title",
    "https://hn.algolia.com/api/v1/search?query=claude+code&tags=story&hitsPerPage=4&restrictSearchableAttributes=title",
  ];

  for (const url of queries) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) continue;
      const data = await res.json();

      for (const hit of data.hits ?? []) {
        if (!hit.title || !hit.objectID) continue;
        // Only include if title mentions Claude or Anthropic
        const title: string = hit.title;
        if (!/claude|anthropic/i.test(title)) continue;

        results.push({
          id: `hn-${hit.objectID}`,
          title,
          summary: hit.story_text?.replace(/<[^>]+>/g, "").slice(0, 200) || `Discussed on Hacker News with ${hit.points ?? 0} points and ${hit.num_comments ?? 0} comments.`,
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          source: "hackernews",
          sourceLabel: "Hacker News",
          timestamp: hit.created_at,
          score: hit.points ?? 0,
          comments: hit.num_comments ?? 0,
          author: hit.author,
          category: guessCategory(title),
        });
      }
    } catch {
      // silently skip
    }
  }

  return results;
}

// ─── GitHub ───────────────────────────────────────────────────────────────────

async function fetchGitHub(): Promise<NewsItem[]> {
  const results: NewsItem[] = [];

  const repos = [
    // Core SDKs
    "anthropics/anthropic-sdk-python",
    "anthropics/anthropic-sdk-js",
    "anthropics/anthropic-sdk-go",
    "anthropics/anthropic-sdk-java",
    // Products & tools
    "anthropics/claude-code",
    "anthropics/anthropic-quickstarts",
    // Safety & research
    "anthropics/model-spec",
    "anthropics/evals",
    // Learning & community
    "anthropics/courses",
    "anthropics/prompt-eng-interactive-tutorial",
    // MCP & integrations
    "modelcontextprotocol/python-sdk",
    "modelcontextprotocol/typescript-sdk",
    "modelcontextprotocol/servers",
  ];

  for (const repo of repos) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo}/releases?per_page=3`,
        {
          headers: { Accept: "application/vnd.github+json" },
          next: { revalidate: 600 },
        }
      );
      if (!res.ok) continue;
      const releases = await res.json();

      for (const r of releases) {
        if (!r.tag_name) continue;
        const repoShort = repo.split("/")[1];
        const title = `${repoShort} ${r.tag_name} released${r.name && r.name !== r.tag_name ? ` — ${r.name}` : ""}`;
        results.push({
          id: `gh-${r.id}`,
          title,
          summary: r.body?.replace(/#{1,6}\s?/g, "").replace(/\*\*/g, "").replace(/\n+/g, " ").slice(0, 220) || `New release of ${repoShort} published on GitHub.`,
          url: r.html_url,
          source: "github",
          sourceLabel: "GitHub",
          timestamp: r.published_at || r.created_at,
          author: r.author?.login,
          category: guessCategory(title, r.body ?? ""),
        });
      }
    } catch {
      // silently skip
    }
  }

  return results;
}

// ─── Reddit ───────────────────────────────────────────────────────────────────

async function fetchReddit(): Promise<NewsItem[]> {
  const results: NewsItem[] = [];

  const feeds = [
    "https://www.reddit.com/r/ClaudeAI/new.json?limit=8",
    "https://www.reddit.com/r/artificial/search.json?q=claude+anthropic&sort=new&limit=5&restrict_sr=1",
  ];

  for (const url of feeds) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "claudewire-news-aggregator/1.0" },
        next: { revalidate: 300 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const posts = data?.data?.children ?? [];

      for (const post of posts) {
        const p = post.data;
        if (!p?.title || p.stickied) continue;

        results.push({
          id: `reddit-${p.id}`,
          title: p.title,
          summary: p.selftext
            ? p.selftext.slice(0, 200) + (p.selftext.length > 200 ? "…" : "")
            : `Posted on r/${p.subreddit} with ${p.score} upvotes and ${p.num_comments} comments.`,
          url: `https://www.reddit.com${p.permalink}`,
          source: "reddit",
          sourceLabel: `r/${p.subreddit}`,
          timestamp: new Date(p.created_utc * 1000).toISOString(),
          score: p.score,
          comments: p.num_comments,
          author: p.author,
          category: guessCategory(p.title, p.selftext ?? ""),
        });
      }
    } catch {
      // silently skip
    }
  }

  return results;
}

// ─── Anthropic blog (RSS) ────────────────────────────────────────────────────

async function fetchAnthropicBlog(): Promise<NewsItem[]> {
  const results: NewsItem[] = [];

  try {
    const res = await fetch("https://www.anthropic.com/rss.xml", {
      next: { revalidate: 600 },
    });
    if (!res.ok) return results;

    const xml = await res.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

    for (const item of items.slice(0, 8)) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? item.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1]
        ?? item.match(/<guid>(.*?)<\/guid>/)?.[1] ?? "";
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? item.match(/<description>(.*?)<\/description>/)?.[1] ?? "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? new Date().toISOString();

      if (!title || !link) continue;

      results.push({
        id: `anthropic-${Buffer.from(link).toString("base64").slice(0, 12)}`,
        title: title.trim(),
        summary: description.replace(/<[^>]+>/g, "").trim().slice(0, 220),
        url: link.trim(),
        source: "anthropic",
        sourceLabel: "Anthropic",
        timestamp: new Date(pubDate).toISOString(),
        category: guessCategory(title, description),
      });
    }
  } catch {
    // RSS might not exist or be blocked — silent skip
  }

  return results;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET() {
  // Fetch all sources in parallel
  const [hn, gh, reddit, anthropic] = await Promise.allSettled([
    fetchHackerNews(),
    fetchGitHub(),
    fetchReddit(),
    fetchAnthropicBlog(),
  ]);

  const all: NewsItem[] = [
    ...(anthropic.status === "fulfilled" ? anthropic.value : []),
    ...(hn.status === "fulfilled" ? hn.value : []),
    ...(gh.status === "fulfilled" ? gh.value : []),
    ...(reddit.status === "fulfilled" ? reddit.value : []),
  ];

  // Deduplicate by title similarity (simple)
  const seen = new Set<string>();
  const deduped = all.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by recency
  deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(deduped.slice(0, 30), {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
  });
}
