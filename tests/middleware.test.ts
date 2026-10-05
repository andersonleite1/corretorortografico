import { describe, it, expect, vi, beforeEach } from "vitest";
import middleware from "@/middleware";
import { NextRequest, type NextFetchEvent } from "next/server";
const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware:
    (handler: (auth: typeof authMock, req: NextRequest) => unknown) =>
    (req: NextRequest) =>
      handler(authMock, req),
  createRouteMatcher: (patterns: string[]) => (req: NextRequest) =>
    patterns.some((pattern) =>
      new RegExp(`^${pattern}$`).test(req.nextUrl.pathname),
    ),
}));
const event = {} as NextFetchEvent;
const request = (path: string, host = "editordetexto.online") =>
  new NextRequest(`https://${host}${path}`, { headers: { host } });
async function runMiddleware(req: NextRequest, ev: NextFetchEvent) {
  const response = await middleware(req, ev);
  if (!response) throw new Error("Middleware did not return a response");
  return response;
}
describe("Middleware public editor contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: "user_123" });
  });
  it("does not invoke auth for public home", async () => {
    const response = await runMiddleware(request("/"), event);
    expect(response.headers.get("x-middleware-rewrite")).toContain("/pt");
    expect(authMock).not.toHaveBeenCalled();
  });
  it.each([
    "ai",
    "documents",
    "editor-settings",
    "images",
    "dashboard",
    "user",
    "stripe/checkout",
    "stripe/portal",
  ])("protects /api/%s", async (route) => {
    authMock.mockResolvedValue({ userId: null });
    const response = await runMiddleware(request(`/api/${route}`), event);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
  });
  it("allows authenticated protected API", async () => {
    expect((await runMiddleware(request("/api/documents"), event)).status).toBe(
      200,
    );
    expect(authMock).toHaveBeenCalledOnce();
  });
  it("fails closed when authorization throws", async () => {
    authMock.mockRejectedValue(new Error("Clerk unavailable"));
    const response = await runMiddleware(request("/api/documents"), event);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "service_unavailable" });
  });
  it.each(["dashboard", "settings"])(
    "returns legacy %s to home without auth",
    async (route) => {
      const response = await runMiddleware(request(`/en/${route}`), event);
      expect(response.headers.get("location")).toBe(
        "https://editordetexto.online/en?legacy=account",
      );
      expect(authMock).not.toHaveBeenCalled();
    },
  );
  it("sends legacy login to Zerus without forwarding private query", async () => {
    const response = await runMiddleware(
      request("/es/sign-in?docId=private"),
      event,
    );
    const url = new URL(response.headers.get("location")!);
    expect(url.origin).toBe("https://zerus.app");
    expect(url.pathname).toBe("/es");
    expect(url.searchParams.get("utm_content")).toBe("legacy_auth");
    expect(url.searchParams.has("docId")).toBe(false);
  });
  it("canonicalizes www and preserves path/query with HSTS", async () => {
    const response = await runMiddleware(
      request("/en?x=1", "www.editordetexto.online"),
      event,
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://editordetexto.online/en?x=1",
    );
    expect(response.headers.get("strict-transport-security")).toContain(
      "max-age=63072000",
    );
  });
});
