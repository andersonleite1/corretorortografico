import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/rewrite/route";
import { auth } from "@clerk/nextjs/server";

// Mock the clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "test_user_id" }),
}));

// Mock the database
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn().mockResolvedValue({
        id: "db_test_user_id",
        subscription: { plan: "free" },
      }),
    },
  },
}));

// Mock the AI rate limit
vi.mock("@/lib/ai-rate-limit", () => ({
  checkAiRateLimit: vi.fn().mockResolvedValue({ allowed: false }),
}));

describe("POST /api/ai/rewrite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject request when user is not authenticated", async () => {
    // Mock auth failure
    (auth as any).mockResolvedValueOnce({ userId: null });

    const mockRequest = new Request("http://localhost:3000/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify({ action: "improve", text: "hello" }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });

  it("should reject request when rate limit exceeded", async () => {
    const mockRequest = new Request("http://localhost:3000/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify({
        action: "improve",
        content: "hello",
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(429); // 429 Too Many Requests

    const json = await response.json();
    expect(json.error).toBe("Limite de uso gratuito atingido.");
  });
});
