import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

// Mock Clerk
vi.mock("@clerk/nextjs/server", () => ({
    auth: vi.fn(),
}));

// Mock Cloudinary
vi.mock("cloudinary", () => ({
    v2: {
        config: vi.fn(),
        uploader: {
            upload_stream: vi.fn(),
        },
        search: {
            expression: vi.fn().mockReturnThis(),
            sort_by: vi.fn().mockReturnThis(),
            execute: vi.fn(),
        },
    },
}));

describe("Images API POST", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CLOUDINARY_CLOUD_NAME = "test_cloud";
        process.env.CLOUDINARY_API_KEY = "test_key";
        process.env.CLOUDINARY_API_SECRET = "test_secret";
    });

    it("should return 401 if user is not authenticated", async () => {
        (auth as any).mockResolvedValue({ userId: null });
        const req = new Request("http://localhost:3000/api/images", { method: "POST" });

        const response = await POST(req);
        expect(response.status).toBe(401);
    });

    it("should upload image with unique public_id including userId", async () => {
        const userId = "user_123";
        (auth as any).mockResolvedValue({ userId });

        const file = new File(["dummy content"], "test-image.jpg", { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("file", file);

        const req = {
            formData: vi.fn().mockResolvedValue(formData),
        } as unknown as Request;

        // Mock cloudinary upload_stream
        const mockResult = {
            public_id: "user_123/1646140000000-test-image",
            secure_url: "https://res.cloudinary.com/test/image/upload/v1/user_123/1646140000000-test-image",
            created_at: new Date().toISOString(),
            bytes: 123,
            format: "jpg",
            width: 100,
            height: 100,
        };

        (cloudinary.uploader.upload_stream as any).mockImplementation((options, callback) => {
            // Capture the public_id passed to options
            expect(options.public_id).toMatch(new RegExp(`^${userId}/\\d+-test-image$`));
            expect(options.tags).toContain(userId);

            // Simulate success
            setTimeout(() => callback(null, mockResult), 0);
            return { end: vi.fn() };
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.id).toBe(mockResult.public_id);
        expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
    });

    it("should return 400 if no file is provided", async () => {
        (auth as any).mockResolvedValue({ userId: "user_123" });
        const formData = new FormData();
        const req = new Request("http://localhost:3000/api/images", {
            method: "POST",
            body: formData,
        });

        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe("No file provided");
    });

    it("should return 400 for invalid file types", async () => {
        (auth as any).mockResolvedValue({ userId: "user_123" });
        const file = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
        const formData = new FormData();
        formData.append("file", file);

        const req = new Request("http://localhost:3000/api/images", {
            method: "POST",
            body: formData,
        });

        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toContain("Tipo de arquivo não permitido");
    });
});
