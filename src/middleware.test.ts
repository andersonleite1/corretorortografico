import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse, NextRequest } from "next/server";
import middleware from "./middleware";

// Mock Clerk
vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: vi.fn((handler) => handler),
  createRouteMatcher: vi.fn(
    () => (req: any) => req.nextUrl.pathname.includes("/editor"),
  ),
}));

// Mock i18n
vi.mock("../i18n-config", () => ({
  i18n: {
    locales: ["pt", "en", "es"],
    defaultLocale: "pt",
  },
}));

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return explicit redirect on auth failure for protected routes", async () => {
    const request = new NextRequest(new URL("http://localhost:3000/editor"));

    const authMock = vi.fn().mockResolvedValue({ userId: null });

    // @ts-expect-error
    const response = await middleware(authMock, request) as NextResponse;

    expect(authMock).toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/sign-in");
  });

  it("should proceed to i18n middleware on auth success", async () => {
    const request = new NextRequest(new URL("http://localhost:3000/editor"));

    const authMock = vi.fn().mockResolvedValue({ userId: "user_123" });

    // @ts-expect-error
    const response = await middleware(authMock, request);

    expect(authMock).toHaveBeenCalled();
    expect(response?.status).not.toBe(307); // Should not be the sign-in redirect
  });

  it("should not invoke auth for public routes", async () => {
    const request = new NextRequest(new URL("http://localhost:3000/home"));

    const authMock = vi.fn();

    // @ts-expect-error
    await middleware(authMock, request);

    expect(authMock).not.toHaveBeenCalled();
  });
});
