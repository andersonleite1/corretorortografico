import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/images/route";
import { NextResponse } from "next/server";

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockAuth, mockCloudinaryUpload } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockCloudinaryUpload: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: (options: any, callback: any) => {
        // Simula o comportamento do stream
        return {
          end: (buffer: any) => {
            mockCloudinaryUpload(options, callback);
          },
        };
      },
    },
  },
}));

describe("POST /api/images", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: "user-123" });
  });

  const createRequestWithFile = (name: string, type: string, size: number) => {
    const file = new File(["content"], name, { type });
    Object.defineProperty(file, "size", { value: size });

    const formData = new FormData();
    formData.append("file", file);

    return new Request("http://localhost/api/images", {
      method: "POST",
      body: formData,
    });
  };

  it("retorna 500 quando o upload do Cloudinary retorna undefined (BUG-02 - FIX)", async () => {
    // Simula o upload retornando undefined através do callback
    mockCloudinaryUpload.mockImplementation((options, callback) => {
      callback(null, undefined); // Erro null, resultado undefined
    });

    const req = createRequestWithFile("test.png", "image/png", 1000);
    const response = await POST(req);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Falha ao realizar upload para a nuvem.");
  });

  it("retorna 200 e os dados da imagem quando o upload tem sucesso", async () => {
    const mockResult = {
      public_id: "image-id",
      secure_url: "https://cloudinary.com/image.png",
      created_at: "2024-01-01",
      bytes: 1000,
      format: "png",
      width: 100,
      height: 100,
    };

    mockCloudinaryUpload.mockImplementation((options, callback) => {
      callback(null, mockResult);
    });

    const req = createRequestWithFile("test.png", "image/png", 1000);
    const response = await POST(req);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.id).toBe("image-id");
    expect(json.url).toBe(mockResult.secure_url);
  });

  it("garante que o public_id enviado ao Cloudinary contém o userId (SEG-07 - FIX)", async () => {
    mockCloudinaryUpload.mockImplementation((options, callback) => {
      callback(null, { public_id: "any" });
    });

    const req = createRequestWithFile("foto.jpg", "image/jpeg", 1000);
    await POST(req);

    const callArgs = mockCloudinaryUpload.mock.calls[0][0];
    expect(callArgs.public_id).toContain("user-123");
    expect(callArgs.public_id).toMatch(/user-123\/\d+-/); // Verifica estrutura userId/timestamp-
    expect(callArgs.tags).toContain("user-123");
  });

  it("retorna 400 para arquivos com tipo não permitido", async () => {
    const req = createRequestWithFile("test.pdf", "application/pdf", 1000);
    const response = await POST(req);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("Tipo de arquivo não permitido");
  });
});
