"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, ArrowRight, ExternalLink, ChevronRight,
  Sparkles, TrendingUp, Clock, Mail, CheckCircle,
  AlertCircle, X, Radio, Activity, Hash, Filter,
  RefreshCw, AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { NewsItem } from "./api/news/route";

// ─── Category config ──────────────────────────────────────────────────────────

const CAT: Record<string, { label: string; bg: string; text: string; accent: string }> = {
  model:    { label: "Model",    bg: "bg-[#f5ece6]", text: "text-[#8b3a1e]", accent: "#c96442" },
  feature:  { label: "Feature",  bg: "bg-[#eef2e8]", text: "text-[#4a5e2a]", accent: "#6b7c3f" },
  api:      { label: "API",      bg: "bg-[#f5f0e6]", text: "text-[#7a5a1a]", accent: "#9b6f2a" },
  research: { label: "Research", bg: "bg-[#eef0e8]", text: "text-[#3a5a3a]", accent: "#5c7a5c" },
  safety:   { label: "Safety",   bg: "bg-[#e8f0ee]", text: "text-[#2a5a4a]", accent: "#3d6b6b" },
  product:  { label: "Product",  bg: "bg-[#f0ece6]", text: "text-[#6b4a2a]", accent: "#7a5c3d" },
  general:  { label: "News",     bg: "bg-[#f0eee6]", text: "text-[#4d4c48]", accent: "#87867f" },
};

const SOURCE_ICONS: Record<string, string> = {
  hackernews: "🟠",
  github:     "⚫",
  reddit:     "🔴",
  anthropic:  "✦",
};

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Pill({ cat }: { cat: string }) {
  const c = CAT[cat] ?? CAT.general;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function LiveDot({ size = 6 }: { size?: number }) {
  return (
    <span className="relative inline-flex flex-shrink-0" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full bg-[#c96442] animate-ping-slow opacity-60" />
      <span className="relative rounded-full bg-[#c96442] w-full h-full" />
    </span>
  );
}

// ─── Featured card ────────────────────────────────────────────────────────────

function FeaturedCard({ item }: { item: NewsItem }) {
  const accent = CAT[item.category]?.accent ?? "#c96442";
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      className="block relative overflow-hidden rounded-2xl bg-[#141413] cursor-pointer group"
      style={{ boxShadow: "rgba(0,0,0,0.14) 0px 8px 40px" }}>
      {/* accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />
      {/* texture */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#faf9f5 0px,#faf9f5 1px,transparent 1px,transparent 32px)" }} />

      {/* top meta */}
      <div className="absolute top-6 left-8 flex items-center gap-2 z-10">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold text-[#faf9f5] tracking-widest uppercase bg-[#30302e] border border-[#3d3d3a]">
          Top Story
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1e1e1e] text-[#b0aea5] border border-[#30302e]">
          {SOURCE_ICONS[item.source]} {item.sourceLabel}
        </span>
      </div>

      <div className="relative z-10 px-8 pt-20 pb-8">
        <Pill cat={item.category} />
        <h2 className="mt-4 mb-3 text-2xl sm:text-3xl font-medium text-[#faf9f5] leading-snug max-w-2xl group-hover:text-[#d97757] transition-colors"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          {item.title}
        </h2>
        {item.summary && (
          <p className="text-sm text-[#b0aea5] leading-relaxed line-clamp-2 mb-6 max-w-2xl">{item.summary}</p>
        )}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-[#30302e]">
          <div className="flex items-center gap-5 text-xs text-[#87867f] flex-wrap">
            <span className="flex items-center gap-1.5"><Clock size={11} />{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
            {item.score != null && <span className="flex items-center gap-1.5"><TrendingUp size={11} />{item.score} points</span>}
            {item.comments != null && <span>{item.comments} comments</span>}
            {item.author && <span>by {item.author}</span>}
          </div>
          <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#faf9f5] bg-[#c96442] group-hover:bg-[#b8593b] transition-colors">
            Read Story <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── News card ────────────────────────────────────────────────────────────────

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const [visible, setVisible] = useState(false);
  const accent = CAT[item.category]?.accent ?? "#87867f";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      className={`relative rounded-xl overflow-hidden bg-[#faf9f5] border border-[#f0eee6] cursor-pointer group block
        transition-all duration-300 hover:-translate-y-0.5
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      style={{
        transitionDelay: `${index * 50}ms`,
        boxShadow: "rgba(0,0,0,0.04) 0px 2px 16px",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "rgba(0,0,0,0.08) 0px 6px 28px, #e8e6dc 0px 0px 0px 1px"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "rgba(0,0,0,0.04) 0px 2px 16px"; }}
    >
      {/* accent bar */}
      <div className="h-[3px] w-full" style={{ background: accent, opacity: 0.6 }} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Pill cat={item.category} />
            <span className="text-[11px] text-[#87867f]">{SOURCE_ICONS[item.source]} {item.sourceLabel}</span>
          </div>
          <span className="text-[11px] text-[#87867f] flex items-center gap-1"><Clock size={9} />{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
        </div>

        <h2 className="text-[16px] font-medium text-[#141413] leading-snug mb-2 line-clamp-2 group-hover:text-[#c96442] transition-colors"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          {item.title}
        </h2>

        {item.summary && (
          <p className="text-[13px] text-[#5e5d59] leading-relaxed line-clamp-3 mb-4">{item.summary}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#f0eee6]">
          <div className="flex items-center gap-3 text-[11px] text-[#87867f]">
            {item.score != null && <span className="flex items-center gap-1"><TrendingUp size={9} />{item.score}</span>}
            {item.comments != null && <span>{item.comments} comments</span>}
            {item.author && <span>by {item.author}</span>}
          </div>
          <span className="flex items-center gap-1 text-[12px] font-semibold text-[#c96442] group-hover:text-[#b8593b] transition-colors">
            Read <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      className="animate-notif flex gap-3 items-start p-4 rounded-xl w-80 pointer-events-auto bg-[#faf9f5] border border-[#e8e6dc] no-underline"
      style={{ boxShadow: "rgba(0,0,0,0.10) 0px 8px 32px, #e8e6dc 0px 0px 0px 1px" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#f5ece6]">
        <span className="text-sm">{SOURCE_ICONS[item.source]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#c96442]">{item.sourceLabel}</span>
          <Pill cat={item.category} />
        </div>
        <p className="text-xs font-medium text-[#141413] leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>{item.title}</p>
        <p className="text-[11px] text-[#87867f] mt-0.5">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
      </div>
      <button onClick={(e) => { e.preventDefault(); onClose(); }} className="text-[#b0aea5] hover:text-[#5e5d59] flex-shrink-0 transition-colors">
        <X size={14} />
      </button>
    </a>
  );
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

function SubscribePanel() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus("success");
      setEmail("");
    } catch (e: unknown) {
      setStatus("error");
      setErr(e instanceof Error ? e.message : "Something went wrong");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="rounded-xl bg-[#141413] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c96442]" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#faf9f5 0px,#faf9f5 1px,transparent 1px,transparent 28px)" }} />
      <div className="relative p-6">
        <div className="flex items-center gap-2 mb-2">
          <Bell size={13} style={{ color: "#c96442" }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c96442]">Email Alerts</span>
        </div>
        <h3 className="text-xl font-medium text-[#faf9f5] mb-1.5" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          Get Claude News First
        </h3>
        <p className="text-[13px] text-[#87867f] leading-relaxed mb-5">
          Email digest when Anthropic ships new models, APIs, or research.
        </p>

        {status === "success" ? (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1a2e1a] border border-[#2a402a]">
            <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-300">Subscribed — check your inbox.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5e5d59]" />
              <input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-[#30302e] border border-[#3d3d3a] text-[#faf9f5] placeholder-[#5e5d59] outline-none transition-all"
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3898ec")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3d3a")} />
            </div>
            <button type="submit" disabled={status === "loading"}
              className="w-full py-3 rounded-xl font-semibold text-sm text-[#faf9f5] bg-[#c96442] hover:bg-[#b8593b] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {status === "loading"
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" /></svg>Subscribing...</>
                : "Subscribe Free"
              }
            </button>
            {status === "error" && (
              <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={11} />{err}</p>
            )}
          </form>
        )}
        <p className="text-[11px] text-center mt-3 text-[#5e5d59]">No spam · Unsubscribe anytime · Powered by Resend</p>
      </div>
    </div>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────

function Filters({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  const opts = ["all", "model", "api", "research", "safety", "feature", "product"] as const;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter size={11} className="text-[#87867f] flex-shrink-0" />
      {opts.map((f) => {
        const on = active === f;
        return (
          <button key={f} onClick={() => onChange(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${on
              ? "bg-[#141413] text-[#faf9f5]"
              : "bg-[#faf9f5] text-[#5e5d59] border border-[#f0eee6] hover:border-[#e8e6dc] hover:text-[#141413]"}`}
            style={on ? { boxShadow: "#141413 0px 0px 0px 1px" } : {}}>
            {f === "all" ? "All" : CAT[f]?.label ?? f}
          </button>
        );
      })}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-[#faf9f5] border border-[#f0eee6] animate-pulse">
      <div className="h-[3px] bg-[#f0eee6]" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-[#f0eee6]" />
          <div className="h-5 w-20 rounded-full bg-[#f0eee6]" />
        </div>
        <div className="h-4 w-full rounded bg-[#f0eee6]" />
        <div className="h-4 w-4/5 rounded bg-[#f0eee6]" />
        <div className="h-3 w-full rounded bg-[#f0eee6]" />
        <div className="h-3 w-3/4 rounded bg-[#f0eee6]" />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("all");
  const [toasts, setToasts] = useState<NewsItem[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const shownToasts = useRef(new Set<string>());

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Failed");
      const data: NewsItem[] = await res.json();
      setNews(data);

      // Show a toast for the first fresh item
      const fresh = data.find((n) => !shownToasts.current.has(n.id));
      if (fresh) {
        setTimeout(() => {
          setToasts((p) => [...p.slice(-2), fresh]);
          setNotifCount((c) => c + 1);
          shownToasts.current.add(fresh.id);
        }, 2500);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filtered = filter === "all" ? news : news.filter((n) => n.category === filter);
  const featured = filtered[0];
  const grid = filtered.slice(1);

  return (
    <div className="min-h-screen bg-[#f5f4ed] text-[#141413]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#f5f4ed]/95 backdrop-blur-sm border-b border-[#f0eee6]"
        style={{ boxShadow: "rgba(0,0,0,0.03) 0px 1px 0px" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#141413] flex items-center justify-center">
              <Sparkles size={14} className="text-[#c96442]" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-none text-[#141413]" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
                Claude<span style={{ color: "#c96442" }}>Wire</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <LiveDot size={5} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#c96442]">Live</span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-0.5">
            {["Feed", "GitHub", "HackerNews", "Reddit"].map((n) => (
              <button key={n} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5e5d59] hover:text-[#141413] hover:bg-[#f0eee6] transition-all">{n}</button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={fetchNews} disabled={loading}
              className="w-8 h-8 rounded-lg bg-[#faf9f5] border border-[#f0eee6] flex items-center justify-center text-[#5e5d59] hover:text-[#141413] transition-colors disabled:opacity-40"
              title="Refresh">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="relative">
              <button className="w-8 h-8 rounded-lg bg-[#faf9f5] border border-[#f0eee6] flex items-center justify-center text-[#5e5d59] hover:text-[#141413] transition-colors">
                <Bell size={14} />
              </button>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#c96442] text-[#faf9f5] text-[9px] font-bold flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#faf9f5] bg-[#141413] hover:bg-[#30302e] transition-colors">
              <Mail size={11} /> Subscribe
            </button>
          </div>
        </div>
      </header>

      {/* ── Live sources bar ── */}
      <div className="bg-[#141413] border-b border-[#30302e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-6 overflow-x-auto">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Radio size={9} className="text-[#c96442]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c96442]">Sources</span>
          </div>
          {[
            { icon: "✦", label: "Anthropic Blog" },
            { icon: "🟠", label: "Hacker News" },
            { icon: "⚫", label: "GitHub" },
            { icon: "🔴", label: "Reddit r/ClaudeAI" },
          ].map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-[11px] text-[#87867f] whitespace-nowrap flex-shrink-0">
              <span>{s.icon}</span> {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-7">
        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-medium text-[#141413] leading-[1.08] mb-3 tracking-tight"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          Claude News,<br />
          <span style={{ color: "#c96442" }}>Live From The Source.</span>
        </h1>
        <p className="text-[16px] text-[#5e5d59] leading-relaxed max-w-lg">
          Aggregated in real time from Anthropic, Hacker News, GitHub, and Reddit — no editorial delay.
        </p>
      </div>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-6">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#faf9f5] border border-[#f0eee6] text-[#5e5d59]">
            <AlertTriangle size={16} className="text-[#c96442] flex-shrink-0" />
            <p className="text-sm">Could not fetch latest news. <button onClick={fetchNews} className="text-[#c96442] underline">Try again</button></p>
          </div>
        )}

        {/* Featured — full width */}
        {!loading && featured && <FeaturedCard item={featured} />}

        {/* Source counts strip */}
        {!loading && news.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 py-3 border-y border-[#f0eee6]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#87867f] flex items-center gap-1.5 mr-1">
              <ExternalLink size={10} /> Sources
            </span>
            {([
              { icon: "✦", src: "anthropic" as const, label: "Anthropic" },
              { icon: "🟠", src: "hackernews" as const, label: "Hacker News" },
              { icon: "⚫", src: "github" as const, label: "GitHub" },
              { icon: "🔴", src: "reddit" as const, label: "Reddit" },
            ]).map((s) => {
              const count = news.filter((n) => n.source === s.src).length;
              if (!count) return null;
              return (
                <span key={s.src} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faf9f5] border border-[#f0eee6] text-xs text-[#5e5d59]">
                  {s.icon} {s.label}
                  <span className="font-bold text-[#c96442]">{count}</span>
                </span>
              );
            })}
            <span className="ml-auto text-[11px] text-[#87867f]">{news.length} stories fetched</span>
          </div>
        )}

        {/* Filters + category tags */}
        <div className="flex flex-wrap items-center gap-3">
          <Filters active={filter} onChange={setFilter} />
          {news.length > 0 && (
            <div className="flex flex-wrap gap-1.5 ml-2 pl-2 border-l border-[#f0eee6]">
              {(["model","api","research","safety","feature","product","general"] as const)
                .filter((cat) => news.some((n) => n.category === cat))
                .map((cat) => {
                  const count = news.filter((n) => n.category === cat).length;
                  return (
                    <button key={cat} onClick={() => setFilter(cat)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[#f5f4ed] text-[#5e5d59] border border-[#f0eee6] hover:border-[#e8e6dc] hover:text-[#c96442] transition-all">
                      <Hash size={8} />{CAT[cat]?.label ?? cat}
                      <span className="text-[#b0aea5] ml-0.5">{count}</span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* News grid — full width 3-col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)
            : grid.map((item, i) => <NewsCard key={item.id} item={item} index={i} />)
          }
          {!loading && filtered.length === 0 && !error && (
            <div className="col-span-3 py-16 text-center text-[#87867f]">
              <Activity size={24} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No stories in this category right now.</p>
            </div>
          )}
        </div>

        {/* Subscribe inline banner */}
        {!loading && news.length > 0 && (
          <div className="rounded-xl overflow-hidden">
            <SubscribePanel />
          </div>
        )}

        {/* Refresh */}
        {!loading && filtered.length > 0 && (
          <div className="flex justify-center pt-2">
            <button onClick={fetchNews}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-[#5e5d59] hover:text-[#141413] bg-[#faf9f5] border border-[#f0eee6] hover:border-[#e8e6dc] transition-all">
              <RefreshCw size={13} /> Refresh Feed
            </button>
          </div>
        )}
      </main>

      {/* ── Toasts ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onClose={() => setToasts((p) => p.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </div>
  );
}
