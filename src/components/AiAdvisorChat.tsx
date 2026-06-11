"use client";

import { FormEvent, useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import type { AiMessage } from "@/types";
import { useStudentMode } from "@/context/StudentModeContext";
import { generateAiResponse } from "@/lib/ai-advisor";

const SUGGESTIONS = [
  "Best gaming laptop under $2,100?",
  "Should I wait to buy iPhone 17 Pro?",
  "Best laptop for university under $1,700?",
  "Cheapest noise cancelling headphones?",
];

function renderMarkdown(text: string) {
  return text
    .split("\n")
    .map((line, i) => {
      const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <p
          key={i}
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }}
        />
      );
    });
}

export function AiAdvisorChat() {
  const { studentMode } = useStudentMode();
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI Shopping Advisor for Australia. Ask me about the best deals, whether to wait for a sale, or what to buy on a student budget. 🎓",
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
      const response = generateAiResponse(trimmed, studentMode);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
      scrollToBottom();
    }, 600);
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
          <h2 className="font-semibold text-white">AI Shopping Advisor</h2>
          <p className="text-xs text-slate-500">
            Powered by PriceMate intelligence · Australia retailers
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-teal-600 text-white"
                  : "bg-white/[0.06] text-slate-300"
              }`}
            >
              {msg.role === "assistant"
                ? renderMarkdown(msg.content)
                : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 animate-pulse text-violet-400" />
            Analysing Australian retailers...
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
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition hover:border-teal-500/30 hover:text-teal-300"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about shopping in Australia..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-teal-500/50 focus:outline-none"
          />
          <button
            type="submit"
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
