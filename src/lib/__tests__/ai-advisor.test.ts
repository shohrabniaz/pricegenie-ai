import { describe, expect, it } from "vitest";
import { generateAiReply } from "../ai-advisor";

describe("generateAiReply", () => {
  it("responds to greetings without treating help-me queries as greetings", () => {
    const greeting = generateAiReply("hello", false);
    expect(greeting.body).toMatch(/Genie/i);

    const shopping = generateAiReply("help me find a laptop under $1000", false);
    expect(shopping.productLinks?.length).toBeGreaterThan(0);
    expect(shopping.body).not.toMatch(/what I can help you with/);
  });

  it("returns product recommendations for budget queries", () => {
    const reply = generateAiReply("best gaming laptop under $1500", true);
    expect(reply.productLinks?.length).toBeGreaterThan(0);
    expect(reply.body).toMatch(/True price/i);
  });

  it("answers price questions for a known product", () => {
    const reply = generateAiReply("how much is the ps5", false);
    expect(reply.summary.toLowerCase()).toMatch(/ps5|playstation/i);
    expect(reply.body).toMatch(/true price/i);
  });

  it("compares products with vs or compare phrasing", () => {
    const vsReply = generateAiReply("compare airpods vs galaxy buds", true);
    expect(vsReply.body).toMatch(/Verdict/i);

    const withReply = generateAiReply("compare AirPods with Galaxy Buds", false);
    expect(withReply.body).toMatch(/Verdict/i);
  });

  it("handles kmart budget searches", () => {
    const reply = generateAiReply("kmart headphones under $30", true);
    expect(reply.productLinks?.length).toBeGreaterThan(0);
  });

  it("uses prior user message for short follow-ups", () => {
    const history = [
      { role: "user" as const, content: "best laptop under $1200" },
      {
        role: "assistant" as const,
        content: JSON.stringify({ summary: "picks", body: "", suggestions: [] }),
      },
    ];
    const reply = generateAiReply("any cheaper options?", false, history);
    expect(reply.productLinks?.length).toBeGreaterThan(0);
  });
});
