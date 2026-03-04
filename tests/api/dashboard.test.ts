import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/dashboard/route";

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
  getUserPlan: vi.fn(),
}));

vi.mock("@/lib/ai-rate-limit", () => ({
  checkAiRateLimit: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    document: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    aiUsage: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return updated dashboard metrics including detailed rate limits", async () => {
    const { getCurrentUser, getUserPlan } = await import("@/lib/auth");
    const { checkAiRateLimit } = await import("@/lib/ai-rate-limit");
    const { db } = await import("@/lib/db");

    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user_123" } as any);
    vi.mocked(getUserPlan).mockResolvedValue("pro");
    vi.mocked(db.document.count).mockResolvedValue(10);
    vi.mocked(db.aiUsage.findMany).mockResolvedValue([]);
    vi.mocked(db.document.findMany).mockResolvedValue([]);
    vi.mocked(db.aiUsage.groupBy).mockResolvedValue([]);
    vi.mocked(checkAiRateLimit).mockResolvedValue({
      usedDaily: 3,
      limitDaily: 5,
      usedMonthlyPaid: 20,
      limitMonthlyPaid: 500,
    } as any);

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      plan: "pro",
      usedDaily: 3,
      limitDaily: 5,
      usedMonthlyPaid: 20,
      limitMonthlyPaid: 500,
    });
  });

  it("should return Unauthorized if no user is found", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
  });
});
