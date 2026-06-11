"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { Bot, ExternalLink, Send, Sparkles } from "lucide-react";
import type { AiMessage } from "@/types";
import { useStudentMode } from "@/context/StudentModeContext";
import { generateAiReply } from "@/lib/ai-advisor";

const SUGGESTIONS = [
  "Best gaming laptop under $1,500?",
  "Should I wait to buy iPhone 17 Pro?",
  "Kmart electronics for students",
  "Compare AirPods vs Galaxy Buds",
];

function renderLine(line: string, key: number) {
  if (!line.trim()) return <div key={key} className="h-2" />;

  if (line.startsWith("### ")) {
    return (
      <h4 key={key} className="mt-3 font-semibold text-white">
        {line.replace("### ", "")}
      </h4>
    );
  }

  if (line.startsWith("• ")) {
    const content = line.slice(2);
    return (
      <p key={key} className="ml-1 flex gap-2 leading-relaxed">
        <span className="text-teal-400">•</span>
        <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
      </p>
    );
  }

  if (line.startsWith("*") && line.endsWith("*")) {
    return (
      <p key={key} className="text-xs italic text-slate-500">
        {line.replace(/^\*|\*$/g, "")}
      </p>
    );
  }

  return (
    <p
      key={key}
      className="leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formatInline(line) }}
    />
  );
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_, label, href) => {
        const external = href.startsWith("http");
        const cls = external
          ? "text-violet-300 underline underline-offset-2 hover:text-violet-200"
          : "text-teal-300 underline underline-offset-2 hover:text-teal-200";
        const target = external ? " target='_blank' rel='noopener noreferrer'" : "";
        return `<a href='${href}' class='${cls}'${target}>${label}</a>`;
      }
    );
}

function AssistantMessage({ content }: { content: string }) {
  const reply = JSON.parse(content) as ReturnType<typeof generateAiReply>;

  return (
    <div className="space-y-2">
      <p className="rounded-lg bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200">
        {reply.summary}
      </p>
      <div className="space-y-1 text-sm text-slate-300">
        {reply.body.split("\n").map((line, i) => renderLine(line, i))}
      </div>
      {reply.productLinks && reply.productLinks.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Quick picks
          </p>
          {reply.productLinks.map((p) => (
            <div
              key={p.href}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2"
            >
              <div className="min-w-0">
                <Link href={p.href} className="truncate text-sm font-medium text-teal-300 hover:underline">
                  {p.name}
                </Link>
                <p className="text-xs text-slate-500">
                  {p.price} · {p.store}
                </p>
              </div>
              <Link
                href={p.href}
                className="shrink-0 text-xs text-slate-400 hover:text-white"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
      {reply.suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {reply.suggestions.map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-500"
            >
              Try: {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function AiAdvisorChat() {
  const { studentMode } = useStudentMode();
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      content: JSON.stringify({
        summary: "Your wish for the best price — granted.",
        body: "G'day! I'm **Niaz**, your AI shopping assistant for Australia.\n\nI compare **true prices** across JB Hi-Fi, Harvey Norman, Amazon AU, **Kmart**, and more — including coupons, student discounts, cashback, and shipping.\n\nWhat are you looking for today?",
        suggestions: [
          "Best laptop under $1,200?",
          "Kmart dorm essentials",
          "Should I wait for EOFY sales?",
        ],
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    setTimeout(() => {
      const reply = generateAiReply(trimmed, studentMode);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: JSON.stringify(reply) },
      ]);
      setLoading(false);
      scrollToBottom();
    }, 800);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-white/10 bg-white/[0.02] md:h-[600px]">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 p-2">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Niaz</h2>
          <p className="text-xs text-slate-500">
            PriceGenie AI assistant · True prices · Kmart · Student deals
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              data-testid={msg.role === "assistant" ? "advisor-response" : "advisor-user-message"}
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-teal-600 text-white"
                  : "bg-white/[0.06] text-slate-300"
              }`}
            >
              {msg.role === "assistant" ? (
                <AssistantMessage content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 animate-pulse text-violet-400" />
            Niaz is checking JB Hi-Fi, Kmart, Amazon AU & more...
            <ExternalLink className="h-3 w-3 opacity-50" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition hover:border-violet-500/30 hover:text-violet-300"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            data-testid="advisor-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Best Kmart headphones under $30?"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none"
          />
          <button
            type="submit"
            data-testid="advisor-send"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-white transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
