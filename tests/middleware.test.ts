import { describe, it, expect, vi, beforeEach } from "vitest";
import middleware from "@/middleware";
import { NextRequest, NextResponse } from "next/server";

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockAuthProtect, mockIsProtectedRoute } = vi.hoisted(() => ({
  mockAuthProtect: vi.fn(),
  mockIsProtectedRoute: vi.fn(),
}));

// Mock do Clerk - precisamos simular createRouteMatcher para que retorne nossa função mockada
vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: (handler: any) => (auth: any, req: any) =>
    handler(auth, req),
  createRouteMatcher: () => (req: any) => mockIsProtectedRoute(req),
}));

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsProtectedRoute.mockReturnValue(false);
  });

  const createRequest = (path: string) => {
    const url = new URL(`http://localhost${path}`);
    return new NextRequest(url);
  };

  const mockAuth = vi.fn().mockResolvedValue({ userId: "user_123" });

  it("prossegue normalmente em rotas públicas", async () => {
    const req = createRequest("/");
    const response = (await (middleware as any)(mockAuth, req)) as NextResponse;

    expect(response).toBeInstanceOf(NextResponse);
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("chama auth() em rotas protegidas", async () => {
    mockIsProtectedRoute.mockReturnValue(true);
    const req = createRequest("/dashboard");
    await (middleware as any)(mockAuth, req);

    expect(mockAuth).toHaveBeenCalled();
  });

  it("retorna redirect quando auth não encontra userId", async () => {
    mockIsProtectedRoute.mockReturnValue(true);
    const req = createRequest("/dashboard");
    mockAuth.mockResolvedValueOnce({ userId: null });

    const response = await (middleware as any)(mockAuth, req) as NextResponse;
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/sign-in");
  });
});
