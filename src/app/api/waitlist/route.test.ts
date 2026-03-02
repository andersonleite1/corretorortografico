import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    waitlist: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
}));

describe("Waitlist API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not logged in", async () => {
    (currentUser as any).mockResolvedValue(null);
    const req = new Request("http://localhost/api/waitlist", {
      method: "POST",
      body: JSON.stringify({ device: "test", info: {} }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 if user has no email", async () => {
    (currentUser as any).mockResolvedValue({
      emailAddresses: [],
    });
    const req = new Request("http://localhost/api/waitlist", {
      method: "POST",
      body: JSON.stringify({ device: "test", info: {} }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email missing");
  });

  it("should successfully join waitlist", async () => {
    const mockUser = {
      emailAddresses: [{ emailAddress: "test@example.com" }],
    };
    (currentUser as any).mockResolvedValue(mockUser);
    (db.waitlist.upsert as any).mockResolvedValue({
      id: "1",
      email: "test@example.com",
    });

    const req = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: {
        "x-vercel-ip-country": "BR",
      },
      body: JSON.stringify({
        device: "Mozilla/5.0",
        info: { screen: "1920x1080" },
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(db.waitlist.upsert).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      update: expect.objectContaining({
        region: "BR",
        device: "Mozilla/5.0",
      }),
      create: expect.objectContaining({
        email: "test@example.com",
        region: "BR",
        device: "Mozilla/5.0",
      }),
    });
  });

  it("should return 500 on database error", async () => {
    (currentUser as any).mockResolvedValue({
      emailAddresses: [{ emailAddress: "test@example.com" }],
    });
    (db.waitlist.upsert as any).mockRejectedValue(new Error("DB Error"));

    const req = new Request("http://localhost/api/waitlist", {
      method: "POST",
      body: JSON.stringify({ device: "test", info: {} }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});
