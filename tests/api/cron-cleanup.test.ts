import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/cron/cleanup/route";
import { NextResponse } from "next/server";

const { mockAiUsageDeleteMany } = vi.hoisted(() => ({
  mockAiUsageDeleteMany: vi.fn().mockResolvedValue({ count: 10 }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    aiUsage: {
      deleteMany: (...args: any[]) => mockAiUsageDeleteMany(...args),
    },
  },
}));

describe("GET /api/cron/cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
  });

  const createRequest = (authHeader?: string) => {
    return new Request("http://localhost/api/cron/cleanup", {
      method: "GET",
      headers: authHeader ? { Authorization: authHeader } : {},
    });
  };

  it("retorna 401 quando o token de autorização está ausente", async () => {
    const req = createRequest();
    const response = await GET(req);
    expect(response.status).toBe(401);
  });

  it("retorna 401 quando o token de autorização é inválido", async () => {
    const req = createRequest("Bearer wrong-token");
    const response = await GET(req);
    expect(response.status).toBe(401);
  });

  it("retorna 200 e deleta registros antigos quando autorizado (ESC-04 - FIX)", async () => {
    const req = createRequest("Bearer test-secret");
    const response = await GET(req);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.deletedCount).toBe(10);
    expect(mockAiUsageDeleteMany).toHaveBeenCalledWith({
      where: {
        createdAt: {
          lt: expect.any(Date),
        },
      },
    });
  });
});
