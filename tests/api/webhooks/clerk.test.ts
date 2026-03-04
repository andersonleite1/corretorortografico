import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/webhooks/clerk/route";
import { NextResponse } from "next/server";

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockSvixVerify, mockUserUpsert, mockUserDelete } = vi.hoisted(() => ({
  mockSvixVerify: vi.fn(),
  mockUserUpsert: vi.fn(),
  mockUserDelete: vi.fn(),
}));

vi.mock("svix", () => ({
  Webhook: class {
    verify() {
      return mockSvixVerify();
    }
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      upsert: (...args: any[]) => mockUserUpsert(...args),
      delete: (...args: any[]) => mockUserDelete(...args),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (key: string) => {
      if (key === "svix-id") return "id";
      if (key === "svix-timestamp") return "ts";
      if (key === "svix-signature") return "sig";
      return null;
    },
  }),
}));

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = "test-secret";
  });

  const createRequest = (body: any) => {
    return new Request("http://localhost/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  it("retorna 400 para o evento user.deleted com ID inválido (BUG-03 - FIX)", async () => {
    mockSvixVerify.mockReturnValue({
      type: "user.deleted",
      data: { id: null }, // ID inválido
    });

    const req = createRequest({ some: "payload" });
    const response = await POST(req);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe("ID inválido.");
    expect(mockUserDelete).not.toHaveBeenCalled();
  });

  it("deleta o usuário do banco quando o evento user.deleted tem um ID válido (BUG-03)", async () => {
    mockSvixVerify.mockReturnValue({
      type: "user.deleted",
      data: { id: "user_123" },
    });

    const req = createRequest({ some: "payload" });
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mockUserDelete).toHaveBeenCalledWith({
      where: { clerkId: "user_123" },
    });
  });

  it("chama upsert quando o evento é user.created", async () => {
    mockSvixVerify.mockReturnValue({
      type: "user.created",
      data: {
        id: "user_123",
        email_addresses: [{ email_address: "test@example.com" }],
        first_name: "John",
        last_name: "Doe",
        image_url: "https://example.com/image.png",
      },
    });

    const req = createRequest({ some: "payload" });
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mockUserUpsert).toHaveBeenCalled();
  });
});
