"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell, Zap, Cpu, ArrowRight, ExternalLink, ChevronRight,
  Star, Sparkles, TrendingUp, Clock, Mail, CheckCircle,
  AlertCircle, X, Radio, Activity, Hash, Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: "model" | "feature" | "api" | "research" | "safety" | "product";
  priority: "breaking" | "high" | "normal";
  timestamp: Date;
  readTime: number;
  tags: string[];
  source: string;
  isNew?: boolean;
  accentColor: string; // muted warm tone per card
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NEWS: NewsItem[] = [
  {
    id: 1,
    title: "Claude 4 Opus Achieves State-of-the-Art on Every Major Benchmark",
    summary: "Anthropic's most powerful model yet surpasses all previous benchmarks on MMLU, HumanEval, and GSM8K. Claude Opus 4 introduces extended thinking mode with 32K reasoning tokens and unprecedented accuracy on complex multi-step problems.",
    category: "model", priority: "breaking",
    timestamp: new Date(Date.now() - 8 * 60 * 1000), readTime: 4,
    tags: ["Claude 4", "Opus", "Benchmark"], source: "Anthropic", isNew: true,
    accentColor: "#c96442",
  },
  {
    id: 2,
    title: "Claude API Now Supports Real-Time Streaming with 10x Lower Latency",
    summary: "New streaming architecture delivers first token in under 200ms. Supports parallel tool calls, structured JSON output, and live function streaming — making Claude faster than ever for production apps.",
    category: "api", priority: "high",
    timestamp: new Date(Date.now() - 22 * 60 * 1000), readTime: 3,
    tags: ["API", "Streaming", "Performance"], source: "Anthropic Docs", isNew: true,
    accentColor: "#9b6f2a",
  },
  {
    id: 3,
    title: "Constitutional AI 2.0: Anthropic Publishes Research on Scalable Oversight",
    summary: "Groundbreaking paper shows AI systems can reliably self-critique and improve alignment at scale. Reduces harmful outputs by 94% while maintaining full helpfulness on complex tasks.",
    category: "safety", priority: "high",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000), readTime: 6,
    tags: ["Safety", "Research", "CAI"], source: "Anthropic Research",
    accentColor: "#5c7a5c",
  },
  {
    id: 4,
    title: "Claude.ai Launches Projects — Persistent Memory Across Conversations",
    summary: "New Projects feature lets users create shared knowledge spaces that persist across sessions. Upload documents and codebases that Claude remembers indefinitely.",
    category: "product", priority: "high",
    timestamp: new Date(Date.now() - 5 * 3600 * 1000), readTime: 3,
    tags: ["Claude.ai", "Projects", "Memory"], source: "Anthropic Blog",
    accentColor: "#7a5c3d",
  },
  {
    id: 5,
    title: "Claude 3.7 Sonnet: 100K Token Extended Thinking Window",
    summary: "Anthropic expands Claude 3.7 Sonnet's extended thinking to 100,000 tokens, enabling deep exploration and multi-hypothesis testing on complex reasoning problems.",
    category: "model", priority: "normal",
    timestamp: new Date(Date.now() - 9 * 3600 * 1000), readTime: 5,
    tags: ["Sonnet", "Thinking", "Reasoning"], source: "Anthropic",
    accentColor: "#c96442",
  },
  {
    id: 6,
    title: "Tool Use 2.0: Claude Can Now Control Computers Natively",
    summary: "Upgraded with vision-based navigation, multi-step automation, and error recovery. Claude can now browse the web, execute code, and interact with any GUI application autonomously.",
    category: "feature", priority: "high",
    timestamp: new Date(Date.now() - 14 * 3600 * 1000), readTime: 4,
    tags: ["Tool Use", "Computer Use", "Agents"], source: "Anthropic",
    accentColor: "#6b7c3f",
  },
  {
    id: 7,
    title: "Anthropic Model Spec Updated: New Guidelines on Autonomy and Agency",
    summary: "Major update adds detailed guidelines on AI autonomy, multi-agent coordination, and long-horizon task execution for Claude deployments in production environments.",
    category: "safety", priority: "normal",
    timestamp: new Date(Date.now() - 20 * 3600 * 1000), readTime: 7,
    tags: ["Model Spec", "Safety", "Alignment"], source: "Anthropic",
    accentColor: "#5c7a5c",
  },
  {
    id: 8,
    title: "Claude Haiku 3.5 Now Free on Claude.ai — Fastest Model Ever",
    summary: "Haiku 3.5 is now free for all Claude.ai users. At 200 tokens/second, it's the fastest production AI model — perfect for instant responses and rapid prototyping without a Pro subscription.",
    category: "product", priority: "normal",
    timestamp: new Date(Date.now() - 28 * 3600 * 1000), readTime: 2,
    tags: ["Haiku", "Free Tier", "Speed"], source: "Anthropic Blog",
    accentColor: "#7a5c3d",
  },
];

// Claude design system: warm category labels — all warm-toned
const CAT_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  model:    { label: "Model",    bg: "bg-[#f5ece6]", text: "text-[#8b3a1e]" },
  feature:  { label: "Feature",  bg: "bg-[#eef2e8]", text: "text-[#4a5e2a]" },
  api:      { label: "API",      bg: "bg-[#f5f0e6]", text: "text-[#7a5a1a]" },
  research: { label: "Research", bg: "bg-[#eef0e8]", text: "text-[#3a5a3a]" },
  safety:   { label: "Safety",   bg: "bg-[#e8f0ee]", text: "text-[#2a5a4a]" },
  product:  { label: "Product",  bg: "bg-[#f0ece6]", text: "text-[#6b4a2a]" },
};

const TICKER = [
  "Claude Opus 4 breaks MMLU record",
  "API latency drops to 200ms",
  "Constitutional AI 2.0 published",
  "Claude.ai Projects now live",
  "100K token thinking window",
  "Computer use 2.0 upgraded",
  "Model Spec v2 released",
  "Haiku 3.5 free for all users",
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Pill({ cat }: { cat: string }) {
  const s = CAT_STYLE[cat];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function PriorityBadge({ p }: { p: NewsItem["priority"] }) {
  if (p === "breaking")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#c96442] text-[#faf9f5]">
        <LiveDot /> Breaking
      </span>
    );
  if (p === "high")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#e8e6dc] text-[#4d4c48]">
        <Zap size={9} /> Hot
      </span>
    );
  return null;
}

function LiveDot({ size = 6 }: { size?: number }) {
  return (
    <span className="relative inline-flex flex-shrink-0" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full bg-[#c96442] animate-ping-slow opacity-60" />
      <span className="relative rounded-full bg-[#c96442] w-full h-full" />
    </span>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function Ticker() {
  const doubled = [...TICKER, ...TICKER];
  return (
    <div className="relative overflow-hidden bg-[#141413] border-b border-[#30302e]">
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[#141413] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-[#141413] to-transparent pointer-events-none" />
      <div className="flex py-2.5 animate-ticker" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap mx-8 text-xs text-[#87867f]">
            <span className="w-1 h-1 rounded-full bg-[#c96442] mr-3 flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Featured card ────────────────────────────────────────────────────────────

function FeaturedCard({ item }: { item: NewsItem }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#141413] cursor-pointer group"
      style={{ boxShadow: "rgba(0,0,0,0.12) 0px 8px 40px" }}>

      {/* warm texture lines */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, #faf9f5 0px, #faf9f5 1px, transparent 1px, transparent 32px)" }} />

      {/* terracotta accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c96442]" />

      {/* top badges */}
      <div className="absolute top-6 left-8 flex items-center gap-2 z-10">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold text-[#faf9f5] tracking-widest uppercase bg-[#30302e] border border-[#3d3d3a]">
          Featured
        </span>
        <PriorityBadge p={item.priority} />
      </div>

      {/* content */}
      <div className="relative z-10 px-8 pt-20 pb-8">
        <Pill cat={item.category} />
        <h2 className="mt-4 mb-3 text-2xl sm:text-3xl font-medium text-[#faf9f5] leading-snug max-w-2xl"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          {item.title}
        </h2>
        <p className="text-sm text-[#b0aea5] leading-relaxed line-clamp-2 mb-6 max-w-2xl">{item.summary}</p>
        <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-[#30302e]">
          <div className="flex items-center gap-5 text-xs text-[#87867f]">
            <span className="flex items-center gap-1.5"><Clock size={11} />{item.readTime} min read</span>
            <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
            <span className="flex items-center gap-1.5"><Activity size={11} className="text-[#c96442]" />{item.source}</span>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#faf9f5] bg-[#c96442] hover:bg-[#b8593b] transition-colors"
            style={{ boxShadow: "#c96442 0px 0px 0px 0px, #c96442 0px 0px 0px 1px" }}>
            Read Story <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── News card ────────────────────────────────────────────────────────────────

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-[#faf9f5] border border-[#f0eee6] cursor-pointer group
        transition-all duration-300 hover:-translate-y-0.5
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      style={{
        transitionDelay: `${index * 55}ms`,
        boxShadow: "rgba(0,0,0,0.04) 0px 4px 24px",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "rgba(0,0,0,0.08) 0px 8px 32px, #e8e6dc 0px 0px 0px 1px"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "rgba(0,0,0,0.04) 0px 4px 24px"; }}
    >
      {/* accent bar — warm-toned, unique per card */}
      <div className="h-[3px] w-full" style={{ background: item.accentColor, opacity: 0.7 }} />

      <div className="p-5">
        {/* meta row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Pill cat={item.category} />
            {item.isNew && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8e6dc] text-[#4d4c48]">
                <LiveDot size={5} /> New
              </span>
            )}
            <PriorityBadge p={item.priority} />
          </div>
          <span className="text-[11px] text-[#87867f]">{item.readTime} min</span>
        </div>

        {/* title */}
        <h2 className="text-[17px] font-medium text-[#141413] leading-snug mb-2 line-clamp-2 group-hover:text-[#c96442] transition-colors"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          {item.title}
        </h2>

        {/* summary */}
        <p className="text-[13px] text-[#5e5d59] leading-relaxed line-clamp-3 mb-4">{item.summary}</p>

        {/* tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-[#f0eee6] text-[#87867f] border border-[#e8e6dc]">
              <Hash size={8} />{tag}
            </span>
          ))}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#f0eee6]">
          <span className="text-[11px] text-[#87867f] flex items-center gap-1.5">
            <Activity size={10} style={{ color: "#c96442" }} />
            {item.source} · {formatDistanceToNow(item.timestamp, { addSuffix: true })}
          </span>
          <button className="flex items-center gap-1 text-[12px] font-semibold text-[#c96442] hover:text-[#b8593b] transition-colors">
            Read <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="animate-notif flex gap-3 items-start p-4 rounded-xl w-80 pointer-events-auto bg-[#faf9f5] border border-[#e8e6dc]"
      style={{ boxShadow: "rgba(0,0,0,0.10) 0px 8px 32px, #e8e6dc 0px 0px 0px 1px" }}>
      {/* accent dot */}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#f5ece6]">
        <Bell size={14} style={{ color: "#c96442" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#c96442]">Claude Update</span>
          <PriorityBadge p={item.priority} />
        </div>
        <p className="text-xs font-medium text-[#141413] leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>{item.title}</p>
        <p className="text-[11px] text-[#87867f] mt-0.5">Just now</p>
      </div>
      <button onClick={onClose} className="text-[#b0aea5] hover:text-[#5e5d59] flex-shrink-0 transition-colors">
        <X size={14} />
      </button>
    </div>
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
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("success");
      setEmail("");
    } catch (e: unknown) {
      setStatus("error");
      setErr(e instanceof Error ? e.message : "Something went wrong");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="rounded-xl p-6 bg-[#141413] relative overflow-hidden">
      {/* warm horizontal line texture */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, #faf9f5 0px, #faf9f5 1px, transparent 1px, transparent 28px)" }} />
      {/* terracotta top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c96442]" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Bell size={13} style={{ color: "#c96442" }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c96442]">Stay Updated</span>
        </div>
        <h3 className="text-xl font-medium text-[#faf9f5] mb-1.5" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          Get Claude News First
        </h3>
        <p className="text-[13px] text-[#87867f] leading-relaxed mb-5">
          Instant email alerts when Anthropic drops new models, features, or research papers.
        </p>

        {status === "success" ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#1f2e1f] border border-[#2a3e2a]">
            <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">You&apos;re subscribed!</p>
              <p className="text-xs text-emerald-500">Check your inbox for confirmation.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5e5d59]" />
              <input
                type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-[#30302e] border border-[#3d3d3a] text-[#faf9f5] placeholder-[#5e5d59] outline-none transition-all"
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3898ec")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3d3a")}
              />
            </div>
            <button type="submit" disabled={status === "loading"}
              className="w-full py-3 rounded-xl font-semibold text-sm text-[#faf9f5] bg-[#c96442] hover:bg-[#b8593b] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {status === "loading"
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" /></svg>Subscribing...</>
                : <><Zap size={13} />Subscribe Free</>
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

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const items = [
    { label: "Today",       val: "8",    icon: <Activity size={13} style={{ color: "#c96442" }} /> },
    { label: "This Week",   val: "34",   icon: <TrendingUp size={13} style={{ color: "#9b6f2a" }} /> },
    { label: "Models",      val: "12",   icon: <Cpu size={13} style={{ color: "#5c7a5c" }} /> },
    { label: "Subscribers", val: "24K+", icon: <Star size={13} style={{ color: "#c96442" }} /> },
  ];
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl p-3.5 flex items-center gap-3 bg-[#faf9f5] border border-[#f0eee6]"
          style={{ boxShadow: "rgba(0,0,0,0.03) 0px 2px 12px" }}>
          <div className="w-8 h-8 rounded-lg bg-[#f5f4ed] flex items-center justify-center flex-shrink-0 border border-[#f0eee6]">
            {s.icon}
          </div>
          <div>
            <div className="text-lg font-semibold leading-none text-[#141413]">{s.val}</div>
            <div className="text-[11px] mt-0.5 text-[#87867f]">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────

function Filters({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  const opts = ["all", "model", "feature", "api", "research", "safety", "product"] as const;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter size={11} className="text-[#87867f] flex-shrink-0" />
      {opts.map((f) => {
        const on = active === f;
        return (
          <button key={f} onClick={() => onChange(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${on
              ? "bg-[#141413] text-[#faf9f5]"
              : "bg-[#faf9f5] text-[#5e5d59] border border-[#f0eee6] hover:border-[#e8e6dc] hover:text-[#141413]"
            }`}
            style={on ? { boxShadow: "#141413 0px 0px 0px 0px, #141413 0px 0px 0px 1px" } : {}}>
            {f === "all" ? "All Updates" : CAT_STYLE[f]?.label ?? f}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [toasts, setToasts] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [notifCount, setNotifCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const queue = NEWS.filter((n) => n.priority !== "normal");
    let i = 0;
    function next() {
      if (i < queue.length) {
        const item = queue[i++];
        setToasts((p) => [...p.slice(-2), item]);
        setNotifCount((c) => c + 1);
        timerRef.current = setTimeout(next, 8000);
      }
    }
    timerRef.current = setTimeout(next, 2500);
    return () => clearTimeout(timerRef.current);
  }, []);

  const grid = filter === "all" ? NEWS.slice(1) : NEWS.filter((n) => n.category === filter);

  return (
    <div className="min-h-screen bg-[#f5f4ed] text-[#141413]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#f5f4ed]/95 backdrop-blur-sm border-b border-[#f0eee6]"
        style={{ boxShadow: "rgba(0,0,0,0.04) 0px 1px 0px" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
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

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {["Feed", "Models", "Research", "API", "About"].map((n) => (
              <button key={n} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5e5d59] hover:text-[#141413] hover:bg-[#f0eee6] transition-all">{n}</button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="w-8 h-8 rounded-lg bg-[#faf9f5] border border-[#f0eee6] flex items-center justify-center text-[#5e5d59] hover:text-[#141413] transition-colors"
                style={{ boxShadow: "rgba(0,0,0,0.04) 0px 2px 6px" }}>
                <Bell size={14} />
              </button>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#c96442] text-[#faf9f5] text-[9px] font-bold flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#faf9f5] bg-[#141413] hover:bg-[#30302e] transition-colors"
              style={{ boxShadow: "#141413 0px 0px 0px 0px, #141413 0px 0px 0px 1px" }}>
              <Mail size={11} /> Subscribe
            </button>
          </div>
        </div>
      </header>

      {/* ── Ticker ── */}
      <Ticker />

      {/* ── Hero ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#f5ece6] text-[#c96442] border border-[#ebd8ce]">
            <Radio size={9} /> AI Intelligence Feed
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] bg-[#faf9f5] border border-[#f0eee6] text-[#87867f]">
            Focused on Anthropic &amp; Claude
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-medium text-[#141413] leading-[1.08] mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          Claude News,<br />
          <span style={{ color: "#c96442" }}>Delivered Instantly.</span>
        </h1>

        <p className="text-[17px] text-[#5e5d59] leading-relaxed max-w-xl">
          Every model release, API update, safety paper, and product launch from Anthropic — streamed to you in real time.
        </p>
      </div>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_308px] gap-6">

          {/* Left column */}
          <div className="space-y-6">
            <FeaturedCard item={NEWS[0]} />
            <Filters active={filter} onChange={setFilter} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {grid.map((item, i) => <NewsCard key={item.id} item={item} index={i} />)}
              {grid.length === 0 && (
                <div className="col-span-2 py-20 text-center text-[#87867f]">
                  <Sparkles size={26} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No updates in this category yet.</p>
                </div>
              )}
            </div>
            <div className="flex justify-center pt-2">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-[#5e5d59] hover:text-[#141413] bg-[#faf9f5] border border-[#f0eee6] hover:border-[#e8e6dc] transition-all"
                style={{ boxShadow: "rgba(0,0,0,0.03) 0px 2px 10px" }}>
                Load More Updates <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SubscribePanel />
            <Stats />

            {/* Trending */}
            <div className="rounded-xl p-5 bg-[#faf9f5] border border-[#f0eee6]"
              style={{ boxShadow: "rgba(0,0,0,0.03) 0px 2px 12px" }}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-[#87867f]">
                <TrendingUp size={11} /> Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Claude 4", "Extended Thinking", "Computer Use", "Constitutional AI", "Projects", "Haiku", "Opus", "Safety"].map((tag) => (
                  <button key={tag}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[#f5f4ed] text-[#5e5d59] border border-[#f0eee6] hover:border-[#e8e6dc] hover:text-[#c96442] transition-all">
                    <Hash size={8} />{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="rounded-xl p-5 bg-[#faf9f5] border border-[#f0eee6]"
              style={{ boxShadow: "rgba(0,0,0,0.03) 0px 2px 12px" }}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-[#87867f]">
                <ExternalLink size={11} /> Sources
              </h3>
              <div className="divide-y divide-[#f0eee6]">
                {[
                  { name: "Anthropic Blog",    url: "anthropic.com/blog",     count: 12 },
                  { name: "Anthropic Research", url: "anthropic.com/research", count: 8  },
                  { name: "Claude Docs",        url: "docs.anthropic.com",     count: 15 },
                  { name: "Claude.ai",          url: "claude.ai",              count: 5  },
                ].map((src) => (
                  <div key={src.name} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-xs font-medium text-[#4d4c48]">{src.name}</p>
                      <p className="text-[10px] text-[#87867f]">{src.url}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5ece6] text-[#c96442]">{src.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
