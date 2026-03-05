import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/rewrite/route";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";
import { streamText } from "ai";
import { ratelimit } from "@/lib/ratelimit";

// Mock dependencies
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("ai", () => ({
  streamText: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    aiUsage: {
      create: vi.fn().mockResolvedValue({}),
    },
    user: {
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock("@/lib/ratelimit", () => ({
  ratelimit: {
    ai: {
      limit: vi.fn(),
    },
  },
}));

vi.mock("@/lib/ai-rate-limit", () => ({
  checkAiRateLimit: vi.fn(),
}));

vi.mock("@/lib/ai-sanitize", () => ({
  sanitizeAiInput: vi.fn((x) => x),
}));

describe("POST /api/ai/rewrite", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Default mocks for each test to override as needed
    vi.mocked(auth).mockResolvedValue({ userId: "test_user_id" } as any);
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "db_test_user_id",
      clerkId: "test_user_id",
      subscription: { plan: "free" },
    } as any);
    vi.mocked(checkAiRateLimit).mockResolvedValue({ allowed: true } as any);
    vi.mocked(ratelimit.ai.limit).mockResolvedValue({ success: true } as any);
    vi.mocked(streamText).mockResolvedValue({
      toTextStreamResponse: () => new Response("AI response"),
    } as any);
  });

  it("should reject request when user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);

    const mockRequest = new Request("http://localhost:3000/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify({ tone: "professional", text: "hello" }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });

  it("should reject request when rate limit exceeded", async () => {
    vi.mocked(checkAiRateLimit).mockResolvedValueOnce({
      allowed: false,
      usedDaily: 5,
      limitDaily: 5,
    } as any);

    const mockRequest = new Request("http://localhost:3000/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify({
        tone: "professional",
        text: "hello",
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(429);
    const json = await response.json();
    expect(json.error).toBe("Limite de uso gratuito atingido.");
  });

  it("should reject unauthorized tones for Free users", async () => {
    const mockRequest = new Request("http://localhost:3000/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify({
        tone: "romantic", // romantic is not allowed for free users
        text: "hello",
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toContain("Este tom não está disponível no plano gratuito");
  });

  it("should allow any tone for Pro users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: "db_test_user_id",
      clerkId: "test_user_id",
      subscription: { plan: "pro" },
    } as any);

    const mockRequest = new Request("http://localhost:3000/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify({
        tone: "romantic",
        text: "hello",
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
  });

  it("should reject request when Pro rate limit exceeded", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: "db_test_user_id",
      clerkId: "test_user_id",
      subscription: { plan: "pro" },
    } as any);

    vi.mocked(checkAiRateLimit).mockResolvedValueOnce({
      allowed: false,
      limitMonthlyPaid: 500,
    } as any);

    const mockRequest = new Request("http://localhost:3000/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify({
        tone: "professional",
        text: "hello",
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(429);
    const json = await response.json();
    expect(json.error).toBe("Limite do plano Pro atingido.");
  });
});
