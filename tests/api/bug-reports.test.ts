import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/bug-reports/route";
import { NextRequest } from "next/server";

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockBugReportCreate, mockUserFindUnique, mockRateLimitLimit } =
  vi.hoisted(() => ({
    mockBugReportCreate: vi.fn(),
    mockUserFindUnique: vi.fn().mockResolvedValue(null),
    mockRateLimitLimit: vi.fn().mockResolvedValue({ success: true, reset: 0 }),
  }));

vi.mock("@/lib/ratelimit", () => ({
  ratelimit: {
    bugReports: {
      limit: (...args: any[]) => mockRateLimitLimit(...args),
    },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: null }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
    },
    bugReport: {
      create: (...args: any[]) => mockBugReportCreate(...args),
    },
  },
}));

describe("POST /api/bug-reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimitLimit.mockResolvedValue({ success: true, reset: 0 });
    mockUserFindUnique.mockResolvedValue(null);
  });

  const createRequest = (body: any) => {
    return new NextRequest("http://localhost/api/bug-reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify(body),
    });
  };

  const validBody = {
    description: "Algum bug aqui",
    wantsNotification: true,
    notificationEmail: "test@example.com",
  };

  it("retorna 429 quando o rate limit por IP é excedido (SEG-01 - REDIS)", async () => {
    mockRateLimitLimit.mockResolvedValue({
      success: false,
      reset: Date.now() + 60000,
    });

    const req = createRequest(validBody);
    const response = await POST(req);

    expect(response.status).toBe(429);
    const json = await response.json();
    expect(json.error).toContain("Muitas requisições");
  });

  it("cria um bug report mesmo sem estar logado (endpoint público com limite)", async () => {
    mockBugReportCreate.mockResolvedValue({ id: "bug_123" });

    const req = createRequest(validBody);
    const response = await POST(req);

    expect(response.status).toBe(201);
    expect(mockBugReportCreate).toHaveBeenCalled();
  });
});
