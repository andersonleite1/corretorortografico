import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserPlan } from "@/lib/auth";

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockAuth, mockUserFindUnique, mockRedisGet, mockRedisSet } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
    mockUserFindUnique: vi.fn(),
    mockRedisGet: vi.fn().mockResolvedValue(null),
    mockRedisSet: vi.fn().mockResolvedValue("OK"),
}));

vi.mock("@clerk/nextjs/server", () => ({
    auth: () => mockAuth(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        user: {
            findUnique: (...args: any[]) => mockUserFindUnique(...args),
        },
    },
}));

vi.mock("@/lib/redis", () => ({
    redis: {
        get: (...args: any[]) => mockRedisGet(...args),
        set: (...args: any[]) => mockRedisSet(...args),
    },
}));

vi.mock("react", () => ({
    cache: (fn: any) => fn,
}));

describe("getUserPlan", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRedisGet.mockResolvedValue(null);
        mockRedisSet.mockResolvedValue("OK");
    });

    const mockUserWithSubscription = (status: string, plan = "pro", expiry?: Date) => {
        return {
            id: "user-123",
            clerkId: "clerk-123",
            subscription: {
                status,
                plan,
                stripeCurrentPeriodEnd: expiry || null,
            },
        };
    };

    it("retorna 'free' quando não há usuário logado", async () => {
        mockAuth.mockResolvedValue({ userId: null });
        const plan = await getUserPlan(true);
        expect(plan).toBe("free");
    });

    it("retorna plano do cache se estiver disponível", async () => {
        mockAuth.mockResolvedValue({ userId: "clerk-123" });
        mockRedisGet.mockResolvedValue("pro");

        const plan = await getUserPlan(false); // não forçar refresh

        expect(plan).toBe("pro");
        expect(mockRedisGet).toHaveBeenCalled();
        expect(mockUserFindUnique).not.toHaveBeenCalled();
    });

    it("retorna 'free' quando usuário não existe no DB", async () => {
        mockAuth.mockResolvedValue({ userId: "clerk-123" });
        mockUserFindUnique.mockResolvedValue(null);
        const plan = await getUserPlan(true);
        expect(plan).toBe("free");
    });

    it("retorna 'free' quando não há assinatura ativa", async () => {
        mockAuth.mockResolvedValue({ userId: "clerk-123" });
        mockUserFindUnique.mockResolvedValue({ subscription: null });
        const plan = await getUserPlan(true);
        expect(plan).toBe("free");
    });

    it("retorna o plano correto quando o status é 'active' e salva no cache", async () => {
        mockAuth.mockResolvedValue({ userId: "clerk-123" });
        mockUserFindUnique.mockResolvedValue(mockUserWithSubscription("active"));

        const plan = await getUserPlan(true);

        expect(plan).toBe("pro");
        expect(mockRedisSet).toHaveBeenCalledWith(expect.stringContaining("clerk-123"), "pro", expect.anything());
    });

    it("retorna 'free' quando o status é 'past_due' (BUG-04 - FIX)", async () => {
        mockAuth.mockResolvedValue({ userId: "clerk-123" });
        mockUserFindUnique.mockResolvedValue(mockUserWithSubscription("past_due"));
        const plan = await getUserPlan(true);
        expect(plan).toBe("free");
    });

    it("retorna 'free' quando a assinatura expirou", async () => {
        mockAuth.mockResolvedValue({ userId: "clerk-123" });
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        mockUserFindUnique.mockResolvedValue(mockUserWithSubscription("active", "pro", yesterday));
        const plan = await getUserPlan(true);
        expect(plan).toBe("free");
    });
});
