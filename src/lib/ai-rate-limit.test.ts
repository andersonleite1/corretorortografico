import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAiRateLimit } from "./ai-rate-limit";
import { db } from "./db";

vi.mock("./db", () => ({
  db: {
    aiUsage: {
      findMany: vi.fn(),
    },
  },
}));

describe("checkAiRateLimit", () => {
  const userId = "test_user_123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Free Plan", () => {
    it("should allow access when user has 0 uses today", async () => {
      vi.mocked(db.aiUsage.findMany).mockResolvedValue([]);

      const result = await checkAiRateLimit(userId, "free");

      expect(result.allowed).toBe(true);
      expect(result.usedDaily).toBe(0);
      expect(result.remainingDaily).toBe(5);
    });

    it("should allow access when user has 4 uses today", async () => {
      const today = new Date().toISOString().split("T")[0];
      vi.mocked(db.aiUsage.findMany).mockResolvedValue(
        Array(4).fill({ createdAt: new Date(`${today}T12:00:00Z`) }),
      );

      const result = await checkAiRateLimit(userId, "free");

      expect(result.allowed).toBe(true);
      expect(result.usedDaily).toBe(4);
      expect(result.remainingDaily).toBe(1);
    });

    it("should block access when user already used 5 today", async () => {
      const today = new Date().toISOString().split("T")[0];
      vi.mocked(db.aiUsage.findMany).mockResolvedValue(
        Array(5).fill({ createdAt: new Date(`${today}T12:00:00Z`) }),
      );

      const result = await checkAiRateLimit(userId, "free");

      expect(result.allowed).toBe(false);
      expect(result.usedDaily).toBe(5);
      expect(result.remainingDaily).toBe(0);
    });
  });

  describe("Pro Plan", () => {
    it("should allow access when user has 5 uses today (uses free daily units)", async () => {
      const today = new Date().toISOString().split("T")[0];
      vi.mocked(db.aiUsage.findMany).mockResolvedValue(
        Array(4).fill({ createdAt: new Date(`${today}T12:00:00Z`) }),
      );

      const result = await checkAiRateLimit(userId, "pro");

      expect(result.allowed).toBe(true);
      expect(result.usedDaily).toBe(4);
      expect(result.usedMonthlyPaid).toBe(0); // 4 < 5, nothing from paid monthly
    });

    it("should allow access and start consuming monthly paid units after 5 free units today", async () => {
      const today = new Date().toISOString().split("T")[0];
      vi.mocked(db.aiUsage.findMany).mockResolvedValue(
        Array(6).fill({ createdAt: new Date(`${today}T12:00:00Z`) }),
      );

      const result = await checkAiRateLimit(userId, "pro");

      expect(result.allowed).toBe(true);
      expect(result.usedDaily).toBe(6);
      expect(result.usedMonthlyPaid).toBe(1); // 6 - 5 = 1 paid unit
      expect(result.limitMonthlyPaid).toBe(500);
      expect(result.remainingMonthlyPaid).toBe(499);
    });

    it("should correctly sum monthly paid usage from different days", async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const tKey = today.toISOString().split("T")[0];
      const yKey = yesterday.toISOString().split("T")[0];

      vi.mocked(db.aiUsage.findMany).mockResolvedValue([
        ...Array(7).fill({ createdAt: new Date(`${tKey}T12:00:00Z`) }),
        ...Array(8).fill({ createdAt: new Date(`${yKey}T12:00:00Z`) }),
      ]);

      const result = await checkAiRateLimit(userId, "pro");

      expect(result.usedDaily).toBe(7);
      // Day 1: 7 - 5 = 2 paid
      // Day 2 (yesterday): 8 - 5 = 3 paid
      // Total: 5 paid
      expect(result.usedMonthlyPaid).toBe(5);
      expect(result.remainingMonthlyPaid).toBe(495);
      expect(result.allowed).toBe(true);
    });

    it("should block access only when monthly paid limit is exceeded AND today free daily is gone", async () => {
      const today = new Date().toISOString().split("T")[0];
      const otherDay = "2024-01-01"; // Oldest day but in same month (mock logic)

      vi.mocked(db.aiUsage.findMany).mockResolvedValue([
        ...Array(5).fill({ createdAt: new Date(`${today}T12:00:00Z`) }), // 5 today (gone free)
        ...Array(505).fill({ createdAt: new Date(`${otherDay}T12:00:00Z`) }), // 505 that day (5 free + 500 paid)
      ]);

      // Monthly paid limit is 500. usedMonthlyPaid = (5-5) + (505-5) = 500.
      const result = await checkAiRateLimit(userId, "pro");

      expect(result.usedMonthlyPaid).toBe(500);
      expect(result.usedDaily).toBe(5);
      expect(result.allowed).toBe(false); // both gone
    });
  });
});
