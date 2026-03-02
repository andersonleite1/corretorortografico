import { describe, it, expect, vi, beforeEach } from "vitest";
import { savePost, getPost } from "@/services/post";
import { mock } from "@/sample";

describe("services/post", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.clearAllMocks();
  });

  it("should save a post with content", () => {
    const data = {
      title: "Test Title",
      content: "<p>Test Content</p>",
      wordCount: 10,
    };
    savePost(data);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "post",
      expect.stringContaining('"title":"Test Title"'),
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "post",
      expect.stringContaining('"content":"<p>Test Content</p>"'),
    );
  });

  it("should handle empty content by resetting to empty values instead of full mock with old wordCount", () => {
    const data = { title: "", content: "", wordCount: 0 };
    savePost(data);

    const callArgs = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
    expect(callArgs.title).toBe("");
    expect(callArgs.content).toBe("");
    expect(callArgs.wordCount).toBe(0);
  });

  it("should return mock with 0 wordCount when no post is in localStorage", async () => {
    (localStorage.getItem as any).mockReturnValue(null);
    const post = await getPost();
    expect(post.wordCount).toBe(0);
  });
});
