"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell, Zap, Cpu, ArrowRight, ExternalLink, ChevronRight,
  Star, Sparkles, TrendingUp, Clock, Mail, CheckCircle,
  AlertCircle, X, Radio, Activity, Hash, Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  imageGradient: string;
}

// ─── News Data ────────────────────────────────────────────────────────────────

const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    title: "Claude 4 Opus Achieves State-of-the-Art on Every Major Benchmark",
    summary:
      "Anthropic's most powerful model yet surpasses all previous benchmarks on MMLU, HumanEval, and GSM8K. Claude Opus 4 introduces extended thinking mode with 32K reasoning tokens and unprecedented accuracy on complex multi-step problems.",
    category: "model",
    priority: "breaking",
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    readTime: 4,
    tags: ["Claude 4", "Opus", "Benchmark"],
    source: "Anthropic",
    imageGradient: "from-violet-600 via-purple-700 to-fuchsia-800",
    isNew: true,
  },
  {
    id: 2,
    title: "Claude API Now Supports Real-Time Streaming with 10x Lower Latency",
    summary:
      "New streaming architecture delivers first token in under 200ms. The improved infrastructure supports parallel tool calls, structured JSON output, and live function streaming — making Claude faster than ever for production apps.",
    category: "api",
    priority: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 22),
    readTime: 3,
    tags: ["API", "Streaming", "Performance"],
    source: "Anthropic Docs",
    imageGradient: "from-orange-500 via-amber-600 to-red-700",
    isNew: true,
  },
  {
    id: 3,
    title: "Constitutional AI 2.0: Anthropic Publishes Research on Scalable Oversight",
    summary:
      "Groundbreaking paper on Constitutional AI 2.0 shows how AI systems can reliably self-critique and improve alignment at scale. The technique reduces harmful outputs by 94% while maintaining full helpfulness.",
    category: "safety",
    priority: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    readTime: 6,
    tags: ["Safety", "Research", "CAI"],
    source: "Anthropic Research",
    imageGradient: "from-emerald-600 via-teal-700 to-cyan-800",
  },
  {
    id: 4,
    title: "Claude.ai Launches Projects — Persistent Memory Across Conversations",
    summary:
      "Claude.ai's new Projects feature lets users create shared knowledge spaces that persist across sessions. Teams can upload documents, codebases, and context that Claude remembers indefinitely.",
    category: "product",
    priority: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    readTime: 3,
    tags: ["Claude.ai", "Projects", "Memory"],
    source: "Anthropic Blog",
    imageGradient: "from-blue-600 via-indigo-700 to-violet-800",
  },
  {
    id: 5,
    title: "Claude 3.7 Sonnet Extended Thinking: 100K Token Reasoning Window",
    summary:
      "Anthropic expands Claude 3.7 Sonnet's extended thinking capability to support up to 100,000 thinking tokens — allowing deep exploration, multi-hypothesis testing, and extended logical chains.",
    category: "model",
    priority: "normal",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9),
    readTime: 5,
    tags: ["Sonnet", "Thinking", "Reasoning"],
    source: "Anthropic",
    imageGradient: "from-purple-600 via-violet-700 to-indigo-800",
  },
  {
    id: 6,
    title: "Tool Use 2.0: Claude Can Now Control Computers Natively",
    summary:
      "Claude's computer use capability has been upgraded with vision-based navigation, multi-step automation, and error recovery. The model can browse the web, write and execute code, and interact with any GUI application.",
    category: "feature",
    priority: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14),
    readTime: 4,
    tags: ["Tool Use", "Computer Use", "Agents"],
    source: "Anthropic",
    imageGradient: "from-pink-600 via-rose-700 to-red-800",
  },
  {
    id: 7,
    title: "Anthropic Model Spec Updated: New Guidelines on Autonomy and Agency",
    summary:
      "Anthropic releases a major update to the Claude Model Spec, adding detailed guidelines on AI autonomy, multi-agent coordination, and long-horizon task execution.",
    category: "safety",
    priority: "normal",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
    readTime: 7,
    tags: ["Model Spec", "Safety", "Alignment"],
    source: "Anthropic",
    imageGradient: "from-slate-600 via-zinc-700 to-neutral-800",
  },
  {
    id: 8,
    title: "Claude Haiku 3.5 Now Free on Claude.ai — Fastest Model Ever",
    summary:
      "Anthropic makes Claude Haiku 3.5 available free for all users on Claude.ai. At 200 tokens/second, it's the fastest production AI model available — perfect for instant responses and rapid prototyping.",
    category: "product",
    priority: "normal",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28),
    readTime: 2,
    tags: ["Haiku", "Free Tier", "Speed"],
    source: "Anthropic Blog",
    imageGradient: "from-cyan-600 via-sky-700 to-blue-800",
  },
];

const CATEGORY_CONFIG = {
  model:    { label: "Model",    color: "bg-violet-500/15 text-violet-300 border border-violet-500/20" },
  feature:  { label: "Feature",  color: "bg-orange-500/15 text-orange-300 border border-orange-500/20" },
  api:      { label: "API",      color: "bg-amber-500/15  text-amber-300  border border-amber-500/20"  },
  research: { label: "Research", color: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20" },
  safety:   { label: "Safety",   color: "bg-teal-500/15   text-teal-300   border border-teal-500/20"   },
  product:  { label: "Product",  color: "bg-blue-500/15   text-blue-300   border border-blue-500/20"   },
};

const TICKER_ITEMS = [
  "🔥 Claude Opus 4 breaks MMLU record",
  "⚡ API latency drops to 200ms",
  "🛡️ Constitutional AI 2.0 published",
  "🚀 Claude.ai Projects now live",
  "🧠 100K token thinking window",
  "💻 Computer use upgraded",
  "📋 Model Spec updated",
  "🆓 Haiku 3.5 free for all",
];

// ─── Components ───────────────────────────────────────────────────────────────

function LiveTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden bg-[#0d0d14] border-y border-[#1f1f2e] py-2.5">
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[#0d0d14] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#0d0d14] to-transparent pointer-events-none" />
      <div className="flex animate-ticker whitespace-nowrap" style={{ width: "max-content" }}>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 mx-8 text-xs font-medium text-[#9ca3af]">
            {item}
            <span className="w-1 h-1 rounded-full bg-[#2d2d42] mx-4 inline-block" />
          </span>
        ))}
      </div>
    </div>
  );
}

function NotificationBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
      {count}
    </span>
  );
}

function CategoryPill({ category }: { category: keyof typeof CATEGORY_CONFIG }) {
  const cfg = CATEGORY_CONFIG[category];
  return <span className={`category-pill ${cfg.color}`}>{cfg.label}</span>;
}

function PriorityBadge({ priority }: { priority: NewsItem["priority"] }) {
  if (priority === "breaking")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-500/15 text-red-400 border border-red-500/30">
        <span className="live-dot scale-75" />
        Breaking
      </span>
    );
  if (priority === "high")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <Zap size={9} strokeWidth={2.5} />
        Hot
      </span>
    );
  return null;
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <article
      className={`news-card bg-[#111118] cursor-pointer group transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Gradient image area */}
      <div className={`relative h-40 bg-gradient-to-br ${item.imageGradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {item.isNew && (
            <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur text-[10px] font-bold text-white tracking-widest uppercase border border-white/20 flex items-center gap-1">
              <span className="live-dot scale-50" />
              New
            </span>
          )}
          <PriorityBadge priority={item.priority} />
        </div>
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur flex items-center justify-center border border-white/10">
          <Sparkles size={14} className="text-white/80" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <CategoryPill category={item.category} />
          <div className="flex items-center gap-3 text-[#6b7280] text-xs">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {item.readTime}m
            </span>
            <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
          </div>
        </div>
        <h2 className="text-[15px] font-bold text-[#f1f0ff] leading-snug mb-2.5 group-hover:text-white transition-colors line-clamp-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {item.title}
        </h2>
        <p className="text-[13px] text-[#9ca3af] leading-relaxed line-clamp-3 mb-4">{item.summary}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-[#1a1a28] text-[#6b7280] border border-[#2d2d42]">
              <Hash size={8} />
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#1f1f2e]">
          <span className="text-[11px] text-[#6b7280] flex items-center gap-1.5">
            <Activity size={10} className="text-violet-400" />
            {item.source}
          </span>
          <button className="flex items-center gap-1 text-[12px] font-semibold text-violet-400 hover:text-violet-300 transition-colors group/btn">
            Read more <ChevronRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
}

function FeaturedCard({ item }: { item: NewsItem }) {
  return (
    <article
      className={`news-card bg-gradient-to-br ${item.imageGradient} relative overflow-hidden cursor-pointer group min-h-[360px] flex flex-col justify-end`}
    >
      <div className="absolute inset-0 bg-black/25" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <div className="absolute top-5 left-5 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur text-[11px] font-bold text-white tracking-widest uppercase border border-white/20">
          Featured
        </span>
        <PriorityBadge priority={item.priority} />
      </div>

      <div className="relative p-6 z-10">
        <CategoryPill category={item.category} />
        <h2
          className="text-2xl font-extrabold text-white leading-tight mt-3 mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {item.title}
        </h2>
        <p className="text-sm text-white/70 leading-relaxed line-clamp-2 mb-4">{item.summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white/50 text-xs">
            <span className="flex items-center gap-1"><Clock size={10} />{item.readTime}m read</span>
            <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-xs font-semibold transition-all group/btn">
            Read Story <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
}

function NotificationToast({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="animate-notification glass-bright rounded-2xl p-4 w-80 shadow-2xl shadow-black/50 flex gap-3 items-start pointer-events-auto">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.imageGradient} flex-shrink-0 flex items-center justify-center`}>
        <Bell size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Claude Update</span>
          <PriorityBadge priority={item.priority} />
        </div>
        <p className="text-xs font-semibold text-[#f1f0ff] leading-snug line-clamp-2">{item.title}</p>
        <p className="text-[11px] text-[#6b7280] mt-0.5">Just now</p>
      </div>
      <button onClick={onClose} className="text-[#6b7280] hover:text-[#9ca3af] mt-0.5 flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

function SubscribePanel() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setStatus("success");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="glass-bright rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-orange-500/5 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Bell size={13} className="text-violet-400" />
          </div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Stay Updated</span>
        </div>
        <h3 className="text-[18px] font-bold text-[#f1f0ff] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Get Claude News First
        </h3>
        <p className="text-[13px] text-[#9ca3af] mb-5 leading-relaxed">
          Instant email alerts the moment Anthropic drops new models, features, or research.
        </p>

        {status === "success" ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">You&apos;re in!</p>
              <p className="text-xs text-emerald-400/70">Check your inbox for a confirmation.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0d0d14] border border-[#2d2d42] text-[#f1f0ff] text-sm placeholder-[#4b5563] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
              style={{
                background:
                  status === "loading"
                    ? "rgba(139,92,246,0.5)"
                    : "linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa)",
                boxShadow: status !== "loading" ? "0 0 20px rgba(139,92,246,0.3)" : "none",
              }}
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Subscribing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Zap size={14} />
                  Subscribe for Free
                </span>
              )}
            </button>
            {status === "error" && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <AlertCircle size={12} />
                {errorMsg}
              </div>
            )}
          </form>
        )}
        <p className="text-[11px] text-[#4b5563] mt-3 text-center">No spam. Unsubscribe anytime. Powered by Resend.</p>
      </div>
    </div>
  );
}

function StatsBar() {
  const stats = [
    { label: "Today", value: "8", icon: <Activity size={14} className="text-violet-400" /> },
    { label: "This Week", value: "34", icon: <TrendingUp size={14} className="text-orange-400" /> },
    { label: "Models", value: "12", icon: <Cpu size={14} className="text-emerald-400" /> },
    { label: "Subscribers", value: "24K+", icon: <Star size={14} className="text-amber-400" /> },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a28] flex items-center justify-center flex-shrink-0">
            {s.icon}
          </div>
          <div>
            <div className="text-lg font-bold text-[#f1f0ff] leading-none">{s.value}</div>
            <div className="text-[11px] text-[#6b7280] mt-0.5">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterBar({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  const filters = ["all", ...Object.keys(CATEGORY_CONFIG)] as const;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter size={13} className="text-[#6b7280]" />
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize ${
            active === f
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
              : "bg-[#111118] text-[#6b7280] border border-[#1f1f2e] hover:border-[#2d2d42] hover:text-[#9ca3af]"
          }`}
        >
          {f === "all" ? "All Updates" : CATEGORY_CONFIG[f as keyof typeof CATEGORY_CONFIG].label}
        </button>
      ))}
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
    const queue = NEWS_DATA.filter((n) => n.priority === "breaking" || n.priority === "high");
    let i = 0;
    function showNext() {
      if (i < queue.length) {
        const item = queue[i++];
        setToasts((prev) => [...prev.slice(-2), item]);
        setNotifCount((c) => c + 1);
        timerRef.current = setTimeout(showNext, 8000);
      }
    }
    timerRef.current = setTimeout(showNext, 2500);
    return () => clearTimeout(timerRef.current);
  }, []);

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = filter === "all" ? NEWS_DATA : NEWS_DATA.filter((n) => n.category === filter);
  const featured = NEWS_DATA[0];
  const grid = NEWS_DATA.slice(1);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Bg glow orbs */}
      <div className="glow-orb-purple" style={{ top: "-200px", left: "-200px" }} />
      <div className="glow-orb-orange" style={{ bottom: "10%", right: "-100px" }} />
      <div className="noise-overlay" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-[#1f1f2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-900/30">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#f1f0ff] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Claude<span className="gradient-text-orange">Wire</span>
              </span>
              <div className="flex items-center gap-1.5 -mt-0.5">
                <span className="live-dot scale-75" />
                <span className="text-[10px] text-[#22c55e] font-semibold uppercase tracking-widest">Live</span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {["Feed", "Models", "Research", "API", "About"].map((item) => (
              <button key={item} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9ca3af] hover:text-[#f1f0ff] hover:bg-[#1a1a28] transition-all">
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="w-8 h-8 rounded-lg bg-[#111118] border border-[#2d2d42] flex items-center justify-center text-[#9ca3af] hover:text-[#f1f0ff] transition-colors">
                <Bell size={14} />
              </button>
              {notifCount > 0 && <NotificationBadge count={notifCount} />}
            </div>
            <button
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}
            >
              <Mail size={12} />
              Subscribe
            </button>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <LiveTicker />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-400 uppercase tracking-widest">
              <Radio size={10} />
              AI Intelligence Feed
            </span>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#111118] border border-[#2d2d42] text-xs text-[#6b7280]">
              Focused on Anthropic &amp; Claude
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight gradient-text-hero leading-none pb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Claude News,<br />
            <span className="text-[#f1f0ff]">Delivered Instantly.</span>
          </h1>
          <p className="text-[#9ca3af] text-base mt-3 max-w-lg leading-relaxed">
            Every model release, API update, safety paper, and product launch from Anthropic — streamed to you in real time.
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left */}
          <div className="space-y-6">
            <FeaturedCard item={featured} />
            <FilterBar active={filter} onChange={setFilter} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(filter === "all" ? grid : filtered).map((item, i) => (
                <NewsCard key={item.id} item={item} index={i} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-2 py-16 text-center text-[#6b7280]">
                  <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No updates in this category yet.</p>
                </div>
              )}
            </div>
            <div className="flex justify-center pt-4">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-[#2d2d42] text-sm font-semibold text-[#9ca3af] hover:text-[#f1f0ff] hover:border-violet-500/30 transition-all">
                Load More Updates <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <SubscribePanel />
            <StatsBar />

            {/* Trending */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp size={12} /> Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Claude 4", "Extended Thinking", "Computer Use", "Constitutional AI", "Projects", "Haiku", "Opus", "Safety"].map((tag) => (
                  <button key={tag} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#111118] text-[#9ca3af] border border-[#2d2d42] hover:border-violet-500/30 hover:text-violet-300 transition-all">
                    <Hash size={9} />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-widest mb-3 flex items-center gap-2">
                <ExternalLink size={12} /> Sources
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Anthropic Blog", url: "anthropic.com/blog", count: 12 },
                  { name: "Anthropic Research", url: "anthropic.com/research", count: 8 },
                  { name: "Claude Docs", url: "docs.anthropic.com", count: 15 },
                  { name: "Claude.ai", url: "claude.ai", count: 5 },
                ].map((src) => (
                  <div key={src.name} className="flex items-center justify-between py-2 border-b border-[#1f1f2e] last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-[#9ca3af]">{src.name}</p>
                      <p className="text-[10px] text-[#4b5563]">{src.url}</p>
                    </div>
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
                      {src.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <NotificationToast key={toast.id} item={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
}
