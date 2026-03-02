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

  const mockAuth = {
    protect: () => mockAuthProtect(),
  };

  it("prossegue normalmente em rotas públicas", async () => {
    const req = createRequest("/");
    const response = (await (middleware as any)(mockAuth, req)) as NextResponse;

    expect(response).toBeInstanceOf(NextResponse);
    expect(mockAuthProtect).not.toHaveBeenCalled();
  });

  it("chama auth.protect() em rotas protegidas", async () => {
    mockIsProtectedRoute.mockReturnValue(true);
    const req = createRequest("/dashboard");
    await (middleware as any)(mockAuth, req);

    expect(mockAuthProtect).toHaveBeenCalled();
  });

  it("redireciona para /sign-in quando ocorre erro em rota protegida (BUG-01 - FIX)", async () => {
    mockIsProtectedRoute.mockReturnValue(true);
    const req = createRequest("/dashboard");
    mockAuthProtect.mockRejectedValue(new Error("Auth failed"));

    const response = (await (middleware as any)(mockAuth, req)) as NextResponse;

    expect(response.status).toBe(307); // NextResponse.redirect
    expect(response.headers.get("location")).toContain("/sign-in");
    expect(response.headers.get("location")).toContain("redirect_url");
  });

  it("prossegue (fail-safe) se houver erro em rota pública", async () => {
    const req = createRequest("/");

    // Forçar um erro no try block antes do retorno
    // Na primeira chamada (try), lança erro. Na segunda (catch), retorna false.
    mockIsProtectedRoute
      .mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      })
      .mockReturnValueOnce(false);

    const response = (await (middleware as any)(mockAuth, req)) as NextResponse;

    expect(response).toBeInstanceOf(NextResponse);
    // Verificamos que NÃO redirecionou para sign-in
    expect(response.headers.get("location")).toBeNull();
  });
});
