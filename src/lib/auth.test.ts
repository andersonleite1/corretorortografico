import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserPlan } from "./auth";
import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { redis } from "./redis";

// Mock dependencies
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("./db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("./redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("react", () => ({
  cache: (fn: any) => fn,
}));

describe("getUserPlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 'free' if no clerkId is found", async () => {
    (auth as any).mockResolvedValue({ userId: null });
    const plan = await getUserPlan();
    expect(plan).toBe("free");
  });

  it("should return cached plan from redis if available", async () => {
    (auth as any).mockResolvedValue({ userId: "clerk_123" });
    (redis.get as any).mockResolvedValue("pro");

    const plan = await getUserPlan();

    expect(plan).toBe("pro");
    expect(redis.get).toHaveBeenCalledWith("user_plan:clerk_123");
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("should return 'pro' for active subscription", async () => {
    (auth as any).mockResolvedValue({ userId: "clerk_123" });
    (redis.get as any).mockResolvedValue(null);
    (db.user.findUnique as any).mockResolvedValue({
      subscription: {
        status: "active",
        plan: "pro",
        stripeCurrentPeriodEnd: new Date(Date.now() + 86400000), // tomorrow
      },
    });

    const plan = await getUserPlan();

    expect(plan).toBe("pro");
    expect(redis.set).toHaveBeenCalledWith(
      "user_plan:clerk_123",
      "pro",
      "EX",
      300
    );
  });

  it("should return 'free' for 'past_due' status (BUG-04 fix verification)", async () => {
    (auth as any).mockResolvedValue({ userId: "clerk_123" });
    (redis.get as any).mockResolvedValue(null);
    (db.user.findUnique as any).mockResolvedValue({
      subscription: {
        status: "past_due",
        plan: "pro",
        stripeCurrentPeriodEnd: new Date(Date.now() + 86400000),
      },
    });

    const plan = await getUserPlan();

    expect(plan).toBe("free");
  });

  it("should return 'pro' for 'trialing' status", async () => {
    (auth as any).mockResolvedValue({ userId: "clerk_123" });
    (redis.get as any).mockResolvedValue(null);
    (db.user.findUnique as any).mockResolvedValue({
      subscription: {
        status: "trialing",
        plan: "pro",
        stripeCurrentPeriodEnd: new Date(Date.now() + 86400000),
      },
    });

    const plan = await getUserPlan();

    expect(plan).toBe("pro");
  });

  it("should return 'free' if subscription is expired", async () => {
    (auth as any).mockResolvedValue({ userId: "clerk_123" });
    (redis.get as any).mockResolvedValue(null);
    (db.user.findUnique as any).mockResolvedValue({
      subscription: {
        status: "active",
        plan: "pro",
        stripeCurrentPeriodEnd: new Date(Date.now() - 86400000), // yesterday
      },
    });

    const plan = await getUserPlan();

    expect(plan).toBe("free");
  });
});
