import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PostContent from "@/components/shared/PostContent";

describe("PostContent", () => {
  it("renders children correctly", () => {
    render(
      <PostContent>
        <p>Test Content</p>
      </PostContent>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("has the correct display name", () => {
    expect(PostContent.displayName).toBe("PostContent");
  });
});
