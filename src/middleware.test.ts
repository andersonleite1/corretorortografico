import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse, NextRequest, type NextFetchEvent } from "next/server";
import middleware from "./middleware";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: vi.fn(
    (handler) => (request: NextRequest) => handler(authMock, request),
  ),
  createRouteMatcher: vi.fn(
    () => (request: NextRequest) =>
      request.nextUrl.pathname.startsWith("/api/documents"),
  ),
}));
vi.mock("../i18n-config", () => ({
  i18n: { locales: ["pt", "en", "es"], defaultLocale: "pt" },
}));
const event = {} as NextFetchEvent;

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns JSON unauthorized for protected APIs without a session", async () => {
    authMock.mockResolvedValue({ userId: null });
    const response = (await middleware(
      new NextRequest("http://localhost:3000/api/documents"),
      event,
    )) as NextResponse;
    expect(authMock).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
  });

  it("allows authenticated protected APIs", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    const response = await middleware(
      new NextRequest("http://localhost:3000/api/documents"),
      event,
    );
    expect(authMock).toHaveBeenCalled();
    expect(response?.status).toBe(200);
  });

  it("does not invoke auth for public routes", async () => {
    await middleware(new NextRequest("http://localhost:3000/"), event);
    expect(authMock).not.toHaveBeenCalled();
  });
});
