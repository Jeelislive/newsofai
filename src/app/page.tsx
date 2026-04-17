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
  gradient: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NEWS: NewsItem[] = [
  {
    id: 1,
    title: "Claude 4 Opus Achieves State-of-the-Art on Every Major Benchmark",
    summary: "Anthropic's most powerful model yet surpasses all previous benchmarks on MMLU, HumanEval, and GSM8K. Claude Opus 4 introduces extended thinking mode with 32K reasoning tokens and unprecedented accuracy on complex multi-step problems.",
    category: "model", priority: "breaking",
    timestamp: new Date(Date.now() - 8 * 60 * 1000), readTime: 4,
    tags: ["Claude 4", "Opus", "Benchmark"], source: "Anthropic",
    gradient: "from-violet-600 via-purple-700 to-fuchsia-800", isNew: true,
  },
  {
    id: 2,
    title: "Claude API Now Supports Real-Time Streaming with 10x Lower Latency",
    summary: "New streaming architecture delivers first token in under 200ms. Supports parallel tool calls, structured JSON output, and live function streaming — making Claude faster than ever for production apps.",
    category: "api", priority: "high",
    timestamp: new Date(Date.now() - 22 * 60 * 1000), readTime: 3,
    tags: ["API", "Streaming", "Performance"], source: "Anthropic Docs",
    gradient: "from-orange-500 via-amber-600 to-red-600", isNew: true,
  },
  {
    id: 3,
    title: "Constitutional AI 2.0: Anthropic Publishes Research on Scalable Oversight",
    summary: "Groundbreaking paper shows AI systems can reliably self-critique and improve alignment at scale. Reduces harmful outputs by 94% while maintaining full helpfulness.",
    category: "safety", priority: "high",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000), readTime: 6,
    tags: ["Safety", "Research", "CAI"], source: "Anthropic Research",
    gradient: "from-emerald-600 via-teal-700 to-cyan-700",
  },
  {
    id: 4,
    title: "Claude.ai Launches Projects — Persistent Memory Across Conversations",
    summary: "New Projects feature lets users create shared knowledge spaces that persist across sessions. Upload documents and codebases that Claude remembers indefinitely.",
    category: "product", priority: "high",
    timestamp: new Date(Date.now() - 5 * 3600 * 1000), readTime: 3,
    tags: ["Claude.ai", "Projects", "Memory"], source: "Anthropic Blog",
    gradient: "from-blue-600 via-indigo-700 to-violet-700",
  },
  {
    id: 5,
    title: "Claude 3.7 Sonnet: 100K Token Extended Thinking Window",
    summary: "Anthropic expands Claude 3.7 Sonnet's extended thinking to 100,000 tokens — enabling deep exploration, multi-hypothesis testing, and complex logical chains.",
    category: "model", priority: "normal",
    timestamp: new Date(Date.now() - 9 * 3600 * 1000), readTime: 5,
    tags: ["Sonnet", "Thinking", "Reasoning"], source: "Anthropic",
    gradient: "from-purple-600 via-violet-700 to-indigo-700",
  },
  {
    id: 6,
    title: "Tool Use 2.0: Claude Can Now Control Computers Natively",
    summary: "Upgraded with vision-based navigation, multi-step automation, and error recovery. Claude can now browse the web, execute code, and interact with any GUI.",
    category: "feature", priority: "high",
    timestamp: new Date(Date.now() - 14 * 3600 * 1000), readTime: 4,
    tags: ["Tool Use", "Computer Use", "Agents"], source: "Anthropic",
    gradient: "from-pink-600 via-rose-600 to-red-700",
  },
  {
    id: 7,
    title: "Anthropic Model Spec Updated: New Guidelines on Autonomy",
    summary: "Major update adds detailed guidelines on AI autonomy, multi-agent coordination, and long-horizon task execution for Claude deployments.",
    category: "safety", priority: "normal",
    timestamp: new Date(Date.now() - 20 * 3600 * 1000), readTime: 7,
    tags: ["Model Spec", "Safety", "Alignment"], source: "Anthropic",
    gradient: "from-slate-500 via-zinc-600 to-gray-700",
  },
  {
    id: 8,
    title: "Claude Haiku 3.5 Now Free — Fastest Production AI Model",
    summary: "Haiku 3.5 is now free for all Claude.ai users. At 200 tokens/second it's the fastest production AI model — perfect for instant responses and rapid prototyping.",
    category: "product", priority: "normal",
    timestamp: new Date(Date.now() - 28 * 3600 * 1000), readTime: 2,
    tags: ["Haiku", "Free Tier", "Speed"], source: "Anthropic Blog",
    gradient: "from-cyan-600 via-sky-600 to-blue-700",
  },
];

const CAT_STYLE = {
  model:    "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  feature:  "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  api:      "bg-amber-500/20  text-amber-300  border border-amber-500/30",
  research: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  safety:   "bg-teal-500/20   text-teal-300   border border-teal-500/30",
  product:  "bg-blue-500/20   text-blue-300   border border-blue-500/30",
} as const;

const CAT_LABEL = {
  model: "Model", feature: "Feature", api: "API",
  research: "Research", safety: "Safety", product: "Product",
} as const;

const TICKER_ITEMS = [
  "🔥 Claude Opus 4 breaks MMLU record",
  "⚡ API latency drops to 200ms",
  "🛡️ Constitutional AI 2.0 published",
  "🚀 Claude.ai Projects now live",
  "🧠 100K token thinking window",
  "💻 Computer use 2.0 upgraded",
  "📋 Model Spec updated",
  "🆓 Haiku 3.5 free for all",
];

// ─── Small reusable pieces ────────────────────────────────────────────────────

function Pill({ cat }: { cat: keyof typeof CAT_STYLE }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${CAT_STYLE[cat]}`}>
      {CAT_LABEL[cat]}
    </span>
  );
}

function Priority({ p }: { p: NewsItem["priority"] }) {
  if (p === "breaking")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-500/20 text-red-400 border border-red-500/40">
        <LiveDot /> Breaking
      </span>
    );
  if (p === "high")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-orange-500/15 text-orange-400 border border-orange-500/30">
        <Zap size={9} /> Hot
      </span>
    );
  return null;
}

function LiveDot({ size = 6 }: { size?: number }) {
  return (
    <span className="relative inline-flex flex-shrink-0" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping-slow opacity-75" />
      <span className="relative rounded-full bg-emerald-400 w-full h-full" />
    </span>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden bg-[#08080f] border-y border-[#1e1e2e]">
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#08080f] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#08080f] to-transparent pointer-events-none" />
      <div className="flex py-2.5 animate-ticker" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap mx-8 text-xs font-medium text-zinc-500">
            {item}
            <span className="inline-block w-1 h-1 rounded-full bg-zinc-700 ml-8" />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Featured card ────────────────────────────────────────────────────────────

function FeaturedCard({ item }: { item: NewsItem }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} min-h-[340px] flex flex-col justify-end border border-white/10 cursor-pointer group`}>
      {/* overlays */}
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* top badges */}
      <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-widest uppercase bg-black/40 backdrop-blur-sm border border-white/20">
          Featured
        </span>
        <Priority p={item.priority} />
      </div>

      {/* content */}
      <div className="relative z-10 p-6 sm:p-8">
        <Pill cat={item.category} />
        <h2 className="mt-3 mb-2 text-2xl sm:text-3xl font-extrabold text-white leading-tight"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif" }}>
          {item.title}
        </h2>
        <p className="text-sm text-white/65 leading-relaxed line-clamp-2 mb-5 max-w-2xl">{item.summary}</p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1"><Clock size={10} />{item.readTime}m read</span>
            <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
            <span className="flex items-center gap-1"><Activity size={10} className="text-violet-400" />{item.source}</span>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all">
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
    <div className={`relative rounded-2xl overflow-hidden border border-[#26263a] bg-[#13131c] cursor-pointer group
      transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-black/60
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transition: `opacity .5s ease ${index * 60}ms, transform .5s ease ${index * 60}ms, box-shadow .3s, border-color .3s` }}
    >
      {/* gradient image */}
      <div className={`relative h-44 bg-gradient-to-br ${item.gradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* scan line */}
        <div className="absolute inset-x-0 h-px bg-white/25 animate-scan" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13131c] via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          {item.isNew && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white tracking-widest uppercase bg-black/50 backdrop-blur-sm border border-white/20">
              <LiveDot size={5} /> New
            </span>
          )}
          <Priority p={item.priority} />
        </div>
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-xl bg-black/35 backdrop-blur-sm border border-white/10 flex items-center justify-center">
          <Sparkles size={13} className="text-white/70" />
        </div>
      </div>

      {/* body */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Pill cat={item.category} />
          <div className="flex items-center gap-2.5 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1"><Clock size={10} />{item.readTime}m</span>
            <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
          </div>
        </div>

        <h2 className="text-[15px] font-bold leading-snug mb-2.5 line-clamp-2 text-zinc-100 group-hover:text-white transition-colors"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif" }}>
          {item.title}
        </h2>

        <p className="text-[13px] text-zinc-500 leading-relaxed line-clamp-3 mb-4">{item.summary}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-[#1c1c2a] text-zinc-500 border border-[#2a2a3e]">
              <Hash size={8} />{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#26263a]">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <Activity size={10} className="text-violet-400" />{item.source}
          </span>
          <button className="flex items-center gap-1 text-[12px] font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            Read more <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Notification toast ───────────────────────────────────────────────────────

function Toast({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="animate-notif flex gap-3 items-start p-4 rounded-2xl w-80 pointer-events-auto bg-[#13131c]/95 backdrop-blur-xl border border-violet-500/25 shadow-2xl shadow-black/60">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex-shrink-0 flex items-center justify-center`}>
        <Bell size={15} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Claude Update</span>
          <Priority p={item.priority} />
        </div>
        <p className="text-xs font-semibold text-zinc-100 leading-snug line-clamp-2">{item.title}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">Just now</p>
      </div>
      <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 flex-shrink-0 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Subscribe panel ──────────────────────────────────────────────────────────

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
    <div className="rounded-2xl p-6 relative overflow-hidden bg-[#13131c] border border-violet-500/25">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Bell size={13} className="text-violet-400" />
          </div>
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Stay Updated</span>
        </div>
        <h3 className="text-lg font-bold text-zinc-100 mb-1" style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif" }}>
          Get Claude News First
        </h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed mb-5">
          Instant email alerts when Anthropic drops new models, features, or research.
        </p>

        {status === "success" ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">You&apos;re in!</p>
              <p className="text-xs text-emerald-400/70">Check your inbox.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-[#0a0a12] border border-[#2a2a3e] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <button
              type="submit" disabled={status === "loading"}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-violet-700 via-violet-600 to-violet-500 hover:opacity-90 shadow-lg shadow-violet-900/30 disabled:opacity-50"
            >
              {status === "loading" ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" /></svg>Subscribing...</>
              ) : (
                <><Zap size={13} />Subscribe Free</>
              )}
            </button>
            {status === "error" && (
              <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={11} />{err}</p>
            )}
          </form>
        )}
        <p className="text-[11px] text-center mt-3 text-zinc-600">No spam · Unsubscribe anytime · Powered by Resend</p>
      </div>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const items = [
    { label: "Today",       val: "8",    icon: <Activity size={13} className="text-violet-400" /> },
    { label: "This Week",   val: "34",   icon: <TrendingUp size={13} className="text-orange-400" /> },
    { label: "Models",      val: "12",   icon: <Cpu size={13} className="text-emerald-400" /> },
    { label: "Subscribers", val: "24K+", icon: <Star size={13} className="text-amber-400" /> },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl p-3.5 flex items-center gap-3 bg-[#13131c] border border-[#26263a]">
          <div className="w-8 h-8 rounded-lg bg-[#1c1c2a] flex items-center justify-center flex-shrink-0">{s.icon}</div>
          <div>
            <div className="text-lg font-bold leading-none text-zinc-100">{s.val}</div>
            <div className="text-[11px] mt-0.5 text-zinc-500">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function Filters({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  const options = ["all", ...Object.keys(CAT_LABEL)] as const;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter size={12} className="text-zinc-600 flex-shrink-0" />
      {options.map((f) => (
        <button key={f} onClick={() => onChange(f)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
            active === f
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/35"
              : "bg-[#13131c] text-zinc-500 border border-[#26263a] hover:border-[#3a3a52] hover:text-zinc-300"
          }`}>
          {f === "all" ? "All Updates" : CAT_LABEL[f as keyof typeof CAT_LABEL]}
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
    <div className="min-h-screen bg-[#06060d] text-zinc-100">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#06060d]/90 backdrop-blur-xl border-b border-[#1e1e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-none text-zinc-100" style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif" }}>
                Claude<span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">Wire</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <LiveDot size={6} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {["Feed", "Models", "Research", "API", "About"].map((n) => (
              <button key={n} className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-100 hover:bg-[#1c1c2a] transition-all">{n}</button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="w-8 h-8 rounded-lg bg-[#13131c] border border-[#26263a] flex items-center justify-center text-zinc-500 hover:text-zinc-100 transition-colors">
                <Bell size={14} />
              </button>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-700 to-violet-500 hover:opacity-90 transition-all shadow-lg shadow-violet-900/30">
              <Mail size={11} /> Subscribe
            </button>
          </div>
        </div>
      </header>

      {/* ── Ticker ── */}
      <Ticker />

      {/* ── Hero ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-violet-500/10 border border-violet-500/25 text-violet-400">
            <Radio size={10} /> AI Intelligence Feed
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] bg-[#13131c] border border-[#26263a] text-zinc-500">
            Focused on Anthropic &amp; Claude
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.05] mb-4"
          style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif" }}>
          <span className="bg-gradient-to-r from-zinc-100 via-violet-300 to-orange-400 bg-clip-text text-transparent">
            Claude News,
          </span>
          <br />
          <span className="text-zinc-100">Delivered Instantly.</span>
        </h1>

        <p className="text-base text-zinc-500 leading-relaxed max-w-xl">
          Every model release, API update, safety paper, and product launch from Anthropic — streamed to you in real time.
        </p>
      </div>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* Left */}
          <div className="space-y-6">
            <FeaturedCard item={NEWS[0]} />
            <Filters active={filter} onChange={setFilter} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {grid.map((item, i) => <NewsCard key={item.id} item={item} index={i} />)}
              {grid.length === 0 && (
                <div className="col-span-2 py-20 text-center text-zinc-600">
                  <Sparkles size={28} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No updates in this category yet.</p>
                </div>
              )}
            </div>
            <div className="flex justify-center pt-2">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-100 bg-[#13131c] border border-[#26263a] hover:border-[#3a3a52] transition-all">
                Load More <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SubscribePanel />
            <Stats />

            {/* Trending */}
            <div className="rounded-2xl p-5 bg-[#13131c] border border-[#26263a]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-zinc-500">
                <TrendingUp size={11} /> Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Claude 4", "Extended Thinking", "Computer Use", "Constitutional AI", "Projects", "Haiku", "Opus", "Safety"].map((tag) => (
                  <button key={tag}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[#0a0a12] text-zinc-500 border border-[#26263a] hover:border-violet-500/30 hover:text-violet-300 transition-all">
                    <Hash size={9} />{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="rounded-2xl p-5 bg-[#13131c] border border-[#26263a]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-zinc-500">
                <ExternalLink size={11} /> Sources
              </h3>
              <div className="space-y-0">
                {[
                  { name: "Anthropic Blog",    url: "anthropic.com/blog",     count: 12 },
                  { name: "Anthropic Research", url: "anthropic.com/research", count: 8  },
                  { name: "Claude Docs",        url: "docs.anthropic.com",     count: 15 },
                  { name: "Claude.ai",          url: "claude.ai",              count: 5  },
                ].map((src) => (
                  <div key={src.name} className="flex items-center justify-between py-2.5 border-b border-[#1e1e2e] last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400">{src.name}</p>
                      <p className="text-[10px] text-zinc-600">{src.url}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-violet-400 bg-violet-500/10">{src.count}</span>
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
