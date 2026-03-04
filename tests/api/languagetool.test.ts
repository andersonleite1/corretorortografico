import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/languagetool/route";
import { NextRequest } from "next/server";

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockRateLimitLimit } = vi.hoisted(() => ({
  mockRateLimitLimit: vi.fn().mockResolvedValue({ success: true, reset: 0 }),
}));

vi.mock("@/lib/ratelimit", () => ({
  ratelimit: {
    languageTool: {
      limit: (...args: any[]) => mockRateLimitLimit(...args),
    },
  },
}));

// Mock do fetch global para evitar chamadas reais à API externa
global.fetch = vi.fn();

describe("POST /api/languagetool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimitLimit.mockResolvedValue({ success: true, reset: 0 });
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ matches: [] }),
    });
  });

  const validBody = {
    text: "Texto de teste para correção.",
    language: "pt-BR",
  };

  const createRequest = (body: any, origin = "http://localhost:3000") => {
    return new NextRequest("http://localhost/api/languagetool", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: origin,
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify(body),
    });
  };

  it("retorna 200 e chama a API externa quando dentro do limite", async () => {
    const req = createRequest(validBody);
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalled();
  });

  it("retorna 429 quando o rate limit por IP é excedido (SEG-02 - REDIS)", async () => {
    mockRateLimitLimit.mockResolvedValue({
      success: false,
      reset: Date.now() + 60000,
    });

    const req = createRequest(validBody);
    const response = await POST(req);

    expect(response.status).toBe(429);
    const json = await response.json();
    expect(json.error).toContain("Muitas requisições");
    expect(response.headers.get("Retry-After")).not.toBeNull();
  });

  it("retorna 403 para origens não permitidas", async () => {
    const req = createRequest(validBody, "http://malicious-site.com");
    const response = await POST(req);

    expect(response.status).toBe(403);
  });
});
