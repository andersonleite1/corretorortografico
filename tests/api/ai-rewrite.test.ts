import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/rewrite/route";
import { auth } from "@clerk/nextjs/server";

// Mock the clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "test_user_id" }),
}));

vi.mock("ai", () => ({
  streamText: vi.fn(),
}));

// Mock the database
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn().mockResolvedValue({
        id: "db_test_user_id",
        clerkId: "test_user_id",
        subscription: { plan: "free" },
      }),
    },
  },
}));

// Mock the auth lib
vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    id: "db_test_user_id",
    clerkId: "test_user_id",
    subscription: { plan: "free" },
  }),
  getUserPlan: vi.fn(),
}));

// Mock the rate limit
vi.mock("@/lib/ratelimit", () => ({
  ratelimit: {
    ai: {
      limit: vi.fn().mockResolvedValue({ success: true }),
    },
  },
}));

// Mock the AI rate limit
vi.mock("@/lib/ai-rate-limit", () => ({
  checkAiRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

describe("POST /api/ai/rewrite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject request when user is not authenticated", async () => {
    // Mock auth failure - need to mock it again if we want to change behavior
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);

    const mockRequest = new Request("http://localhost:3000/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify({ tone: "professional", text: "hello" }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });

  it("should reject request when rate limit exceeded", async () => {
    // Mock rate limit failure
    const { checkAiRateLimit } = await import("@/lib/ai-rate-limit");
    vi.mocked(checkAiRateLimit).mockResolvedValueOnce({
      allowed: false,
      usedDaily: 5,
      limitDaily: 5,
      usedMonthlyPaid: 0,
      limitMonthlyPaid: 0,
    } as any);

    const mockRequest = new Request("http://localhost:3000/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify({
        tone: "professional",
        text: "hello",
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(429); // 429 Too Many Requests

    const json = await response.json();
    expect(json.error).toBe("Limite de uso gratuito atingido.");
  });

  it("should reject unauthorized tones for Free users", async () => {
    const mockRequest = new Request("http://localhost:3000/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify({
        tone: "romantic", // 6th tone (unauthorized for Free)
        text: "hello",
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toContain(
      "Este tom não está disponível no plano gratuito",
    );
  });

  it("should allow any tone for Pro users", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
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

    // Mock completion response since it would try to talk to OpenAI
    const { streamText } = await import("ai");
    vi.mocked(streamText).mockResolvedValue({
      toTextStreamResponse: () => new Response("AI response"),
    } as any);

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
  });

  it("should reject request when Pro rate limit exceeded", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: "db_test_user_id",
      clerkId: "test_user_id",
      subscription: { plan: "pro" },
    } as any);

    const { checkAiRateLimit } = await import("@/lib/ai-rate-limit");
    vi.mocked(checkAiRateLimit).mockResolvedValueOnce({
      allowed: false,
      usedDaily: 5,
      limitDaily: 5,
      usedMonthlyPaid: 500,
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
