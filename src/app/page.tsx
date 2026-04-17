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

// ─── Data ─────────────────────────────────────────────────────────────────────

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
      "New streaming architecture delivers first token in under 200ms. Supports parallel tool calls, structured JSON output, and live function streaming.",
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
      "Groundbreaking paper shows how AI systems can reliably self-critique and improve alignment at scale. Reduces harmful outputs by 94% while maintaining full helpfulness.",
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
      "New Projects feature lets users create shared knowledge spaces that persist across sessions. Upload documents, codebases, and context Claude remembers indefinitely.",
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
      "Anthropic expands Claude 3.7 Sonnet's extended thinking to 100,000 thinking tokens — enabling deep exploration and multi-hypothesis testing on complex problems.",
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
      "Upgraded with vision-based navigation, multi-step automation, and error recovery. Claude can browse the web, write and execute code, and interact with any GUI.",
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
      "Major update to the Claude Model Spec adds detailed guidelines on AI autonomy, multi-agent coordination, and long-horizon task execution.",
    category: "safety",
    priority: "normal",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
    readTime: 7,
    tags: ["Model Spec", "Safety", "Alignment"],
    source: "Anthropic",
    imageGradient: "from-slate-500 via-zinc-600 to-neutral-700",
  },
  {
    id: 8,
    title: "Claude Haiku 3.5 Now Free on Claude.ai — Fastest Model Ever",
    summary:
      "Claude Haiku 3.5 available free for all users on Claude.ai. At 200 tokens/second, it's the fastest production AI model for instant responses and rapid prototyping.",
    category: "product",
    priority: "normal",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28),
    readTime: 2,
    tags: ["Haiku", "Free Tier", "Speed"],
    source: "Anthropic Blog",
    imageGradient: "from-cyan-600 via-sky-700 to-blue-800",
  },
];

const CAT = {
  model:    { label: "Model",    bg: "bg-violet-500/20", text: "text-violet-300", border: "border border-violet-500/30" },
  feature:  { label: "Feature",  bg: "bg-orange-500/20", text: "text-orange-300", border: "border border-orange-500/30" },
  api:      { label: "API",      bg: "bg-amber-500/20",  text: "text-amber-300",  border: "border border-amber-500/30"  },
  research: { label: "Research", bg: "bg-emerald-500/20",text: "text-emerald-300",border: "border border-emerald-500/30"},
  safety:   { label: "Safety",   bg: "bg-teal-500/20",   text: "text-teal-300",   border: "border border-teal-500/30"  },
  product:  { label: "Product",  bg: "bg-blue-500/20",   text: "text-blue-300",   border: "border border-blue-500/30"  },
};

const TICKER = [
  "🔥 Claude Opus 4 breaks MMLU record",
  "⚡ API latency drops to 200ms",
  "🛡️ Constitutional AI 2.0 published",
  "🚀 Claude.ai Projects now live",
  "🧠 100K token thinking window",
  "💻 Computer use 2.0 upgraded",
  "📋 Model Spec v2 released",
  "🆓 Haiku 3.5 free for all users",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Pill({ cat }: { cat: keyof typeof CAT }) {
  const c = CAT[cat];
  return (
    <span className={`cat-pill ${c.bg} ${c.text} ${c.border}`}>{c.label}</span>
  );
}

function PriorityBadge({ p }: { p: NewsItem["priority"] }) {
  if (p === "breaking")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-500/20 text-red-400 border border-red-500/40">
        <span className="live-dot" style={{ width: 6, height: 6 }} />
        Breaking
      </span>
    );
  if (p === "high")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-orange-500/15 text-orange-400 border border-orange-500/30">
        <Zap size={9} />Hot
      </span>
    );
  return null;
}

function LiveTicker() {
  const doubled = [...TICKER, ...TICKER];
  return (
    <div className="relative overflow-hidden border-y border-[#1f1f2e]" style={{ background: "#0a0a12" }}>
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0a0a12, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0a0a12, transparent)" }} />
      <div className="py-2.5 flex" style={{ animation: "ticker-scroll 35s linear infinite", width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center mx-8 text-xs font-medium" style={{ color: "#9ca3af", whiteSpace: "nowrap" }}>
            {item}
            <span className="inline-block w-1 h-1 rounded-full mx-6" style={{ background: "#2d2d42" }} />
          </span>
        ))}
      </div>
    </div>
  );
}

function NotifBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
      {count}
    </span>
  );
}

function FeaturedCard({ item }: { item: NewsItem }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl cursor-pointer group min-h-[360px] flex flex-col justify-end bg-gradient-to-br ${item.imageGradient}`}
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* overlays */}
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />

      {/* top badges */}
      <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
        <span className="px-3 py-1 rounded-full text-[11px] font-bold text-white tracking-widest uppercase" style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
          Featured
        </span>
        <PriorityBadge p={item.priority} />
      </div>

      {/* content */}
      <div className="relative z-10 p-6 sm:p-8">
        <Pill cat={item.category} />
        <h2 className="mt-3 mb-2 text-2xl sm:text-3xl font-extrabold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
          {item.title}
        </h2>
        <p className="text-sm text-white/65 leading-relaxed line-clamp-2 mb-5 max-w-2xl">{item.summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-white/45">
            <span className="flex items-center gap-1"><Clock size={10} />{item.readTime}m read</span>
            <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
            <span className="flex items-center gap-1"><Activity size={10} className="text-violet-400" />{item.source}</span>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all group/btn"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(12px)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          >
            Read Story <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={`news-card cursor-pointer transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      style={{ background: "#111118", transitionDelay: `${index * 55}ms` }}
    >
      {/* image area */}
      <div className={`relative h-44 bg-gradient-to-br ${item.imageGradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        {/* grid lines */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* scan line */}
        <div className="absolute inset-x-0 h-px bg-white/30 scan-line opacity-20" />
        {/* bottom fade */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #111118 0%, transparent 55%)" }} />

        {/* badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          {item.isNew && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white tracking-widest uppercase" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              New
            </span>
          )}
          <PriorityBadge p={item.priority} />
        </div>

        {/* sparkle icon */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
          <Sparkles size={13} className="text-white/75" />
        </div>
      </div>

      {/* body */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Pill cat={item.category} />
          <div className="flex items-center gap-2.5 text-[11px]" style={{ color: "#6b7280" }}>
            <span className="flex items-center gap-1"><Clock size={10} />{item.readTime}m</span>
            <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
          </div>
        </div>

        <h2
          className="text-sm font-bold leading-snug mb-2.5 line-clamp-2 transition-colors"
          style={{ color: "#f1f0ff", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.9375rem" }}
        >
          {item.title}
        </h2>

        <p className="text-[13px] leading-relaxed line-clamp-3 mb-4" style={{ color: "#9ca3af" }}>
          {item.summary}
        </p>

        {/* tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: "#1a1a28", color: "#6b7280", border: "1px solid #2d2d42" }}>
              <Hash size={8} />{tag}
            </span>
          ))}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #1f1f2e" }}>
          <span className="text-[11px] flex items-center gap-1.5" style={{ color: "#6b7280" }}>
            <Activity size={10} className="text-violet-400" />
            {item.source}
          </span>
          <button className="flex items-center gap-1 text-[12px] font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            Read more <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="flex gap-3 items-start p-4 rounded-2xl w-80 pointer-events-auto shadow-2xl"
      style={{
        background: "rgba(17,17,26,0.97)",
        border: "1px solid rgba(139,92,246,0.3)",
        backdropFilter: "blur(30px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)",
        animation: "notification-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.imageGradient} flex-shrink-0 flex items-center justify-center`}>
        <Bell size={15} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Claude Update</span>
          <PriorityBadge p={item.priority} />
        </div>
        <p className="text-xs font-semibold leading-snug line-clamp-2" style={{ color: "#f1f0ff" }}>{item.title}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#6b7280" }}>Just now</p>
      </div>
      <button onClick={onClose} className="flex-shrink-0 transition-colors" style={{ color: "#6b7280" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#9ca3af")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
      >
        <X size={14} />
      </button>
    </div>
  );
}

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
    <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "#111118", border: "1px solid rgba(139,92,246,0.25)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top left, rgba(139,92,246,0.07) 0%, transparent 60%)" }} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
            <Bell size={13} className="text-violet-400" />
          </div>
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Stay Updated</span>
        </div>
        <h3 className="text-lg font-bold mb-1" style={{ color: "#f1f0ff", fontFamily: "'Space Grotesk', sans-serif" }}>
          Get Claude News First
        </h3>
        <p className="text-[13px] leading-relaxed mb-5" style={{ color: "#9ca3af" }}>
          Instant email alerts when Anthropic drops new models, features, or research.
        </p>

        {status === "success" ? (
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">You&apos;re in!</p>
              <p className="text-xs" style={{ color: "rgba(52,211,153,0.7)" }}>Check your inbox.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6b7280" }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none"
                style={{
                  background: "#0d0d14",
                  border: "1px solid #2d2d42",
                  color: "#f1f0ff",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2d42")}
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
              style={{
                background: status === "loading" ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg, #6d28d9, #8b5cf6, #a78bfa)",
                boxShadow: status !== "loading" ? "0 0 25px rgba(139,92,246,0.35)" : "none",
              }}
            >
              {status === "loading" ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Subscribing...
                </>
              ) : (
                <><Zap size={13} /> Subscribe Free</>
              )}
            </button>
            {status === "error" && (
              <p className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={11} />{err}
              </p>
            )}
          </form>
        )}
        <p className="text-[11px] text-center mt-3" style={{ color: "#4b5563" }}>No spam · Unsubscribe anytime · Powered by Resend</p>
      </div>
    </div>
  );
}

function StatsGrid() {
  const items = [
    { label: "Today",       val: "8",   icon: <Activity size={14} className="text-violet-400" /> },
    { label: "This Week",   val: "34",  icon: <TrendingUp size={14} className="text-orange-400" /> },
    { label: "Models",      val: "12",  icon: <Cpu size={14} className="text-emerald-400" /> },
    { label: "Subscribers", val: "24K+",icon: <Star size={14} className="text-amber-400" /> },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: "#111118", border: "1px solid #1f1f2e" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#1a1a28" }}>
            {s.icon}
          </div>
          <div>
            <div className="text-lg font-bold leading-none" style={{ color: "#f1f0ff" }}>{s.val}</div>
            <div className="text-[11px] mt-0.5" style={{ color: "#6b7280" }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Filters({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  const all = ["all", ...Object.keys(CAT)] as const;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter size={12} style={{ color: "#6b7280" }} />
      {all.map((f) => {
        const isActive = active === f;
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
            style={{
              background: isActive ? "rgba(139,92,246,0.18)" : "#111118",
              color: isActive ? "#c4b5fd" : "#6b7280",
              border: isActive ? "1px solid rgba(139,92,246,0.4)" : "1px solid #1f1f2e",
            }}
          >
            {f === "all" ? "All Updates" : CAT[f as keyof typeof CAT].label}
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
    const queue = NEWS_DATA.filter((n) => n.priority === "breaking" || n.priority === "high");
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

  const grid = filter === "all" ? NEWS_DATA.slice(1) : NEWS_DATA.filter((n) => n.category === filter);

  return (
    <div className="min-h-screen relative" style={{ background: "#050508" }}>
      {/* Glow orbs */}
      <div className="orb-purple" style={{ top: "-300px", left: "-250px" }} />
      <div className="orb-orange" style={{ bottom: "5%", right: "-150px" }} />
      <div className="noise" />

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 glass" style={{ borderBottom: "1px solid #1f1f2e" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6d28d9, #7c3aed)", boxShadow: "0 0 16px rgba(109,40,217,0.4)" }}>
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#f1f0ff" }}>
                Claude<span style={{ background: "linear-gradient(135deg, #fdba74, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Wire</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="live-dot" style={{ width: 6, height: 6 }} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {["Feed", "Models", "Research", "API", "About"].map((n) => (
              <button key={n} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ color: "#9ca3af" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#f1f0ff"; e.currentTarget.style.background = "#1a1a28"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}
              >{n}</button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: "#111118", border: "1px solid #2d2d42", color: "#9ca3af" }}>
                <Bell size={14} />
              </button>
              {notifCount > 0 && <NotifBadge count={notifCount} />}
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg, #6d28d9, #8b5cf6)" }}>
              <Mail size={11} /> Subscribe
            </button>
          </div>
        </div>
      </header>

      {/* ── Ticker ── */}
      <LiveTicker />

      {/* ── Hero ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest" style={{ background: "rgba(109,40,217,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
            <Radio size={10} /> AI Intelligence Feed
          </span>
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px]" style={{ background: "#111118", border: "1px solid #1f1f2e", color: "#6b7280" }}>
            Focused on Anthropic &amp; Claude
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <span style={{ background: "linear-gradient(135deg, #f1f0ff 0%, #c4b5fd 40%, #f97316 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Claude News,
          </span>
          <br />
          <span style={{ color: "#f1f0ff" }}>Delivered Instantly.</span>
        </h1>

        <p className="text-base leading-relaxed max-w-xl" style={{ color: "#9ca3af" }}>
          Every model release, API update, safety paper, and product launch from Anthropic — streamed to you in real time.
        </p>
      </div>

      {/* ── Main grid ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* Left col */}
          <div className="space-y-6">
            <FeaturedCard item={NEWS_DATA[0]} />
            <Filters active={filter} onChange={setFilter} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {grid.map((item, i) => <NewsCard key={item.id} item={item} index={i} />)}
              {grid.length === 0 && (
                <div className="col-span-2 py-20 text-center" style={{ color: "#4b5563" }}>
                  <Sparkles size={30} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No updates in this category yet.</p>
                </div>
              )}
            </div>
            <div className="flex justify-center pt-2">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all glass" style={{ color: "#9ca3af", border: "1px solid #2d2d42" }}>
                Load More <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SubscribePanel />
            <StatsGrid />

            {/* Trending */}
            <div className="rounded-2xl p-5" style={{ background: "#111118", border: "1px solid #1f1f2e" }}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#6b7280" }}>
                <TrendingUp size={11} /> Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Claude 4", "Extended Thinking", "Computer Use", "Constitutional AI", "Projects", "Haiku", "Opus", "Safety"].map((tag) => (
                  <button
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                    style={{ background: "#0d0d14", color: "#9ca3af", border: "1px solid #2d2d42" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.color = "#c4b5fd"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d2d42"; e.currentTarget.style.color = "#9ca3af"; }}
                  >
                    <Hash size={9} />{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="rounded-2xl p-5" style={{ background: "#111118", border: "1px solid #1f1f2e" }}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#6b7280" }}>
                <ExternalLink size={11} /> Sources
              </h3>
              <div className="divide-y" style={{ borderColor: "#1f1f2e" }}>
                {[
                  { name: "Anthropic Blog",     url: "anthropic.com/blog",     count: 12 },
                  { name: "Anthropic Research",  url: "anthropic.com/research", count: 8  },
                  { name: "Claude Docs",         url: "docs.anthropic.com",     count: 15 },
                  { name: "Claude.ai",           url: "claude.ai",              count: 5  },
                ].map((src) => (
                  <div key={src.name} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#9ca3af" }}>{src.name}</p>
                      <p className="text-[10px]" style={{ color: "#4b5563" }}>{src.url}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#a78bfa", background: "rgba(139,92,246,0.12)" }}>
                      {src.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Toast notifications ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onClose={() => setToasts((p) => p.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </div>
  );
}
