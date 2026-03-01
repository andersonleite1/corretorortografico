import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DraftComparison } from "@/components/Drafts/DraftComparison";

// Mock jsonToPlainText if needed, but it's likely a simple utility
vi.mock("../TiptapEditor/utils/jsonToPlainText", () => ({
  jsonToPlainText: (content: any) =>
    typeof content === "string" ? content : JSON.stringify(content),
}));

describe("DraftComparison", () => {
  it("renders the comparison title", () => {
    render(
      <DraftComparison
        oldContent="Old text"
        newContent="New text"
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("Comparação de Versão")).toBeInTheDocument();
  });

  it("highlights added text", () => {
    render(
      <DraftComparison
        oldContent="Hello"
        newContent="Hello World"
        onClose={() => {}}
      />,
    );
    const addedPart = screen.getByText(/World/);
    expect(addedPart).toHaveClass("bg-green-100");
  });

  it("highlights removed text", () => {
    render(
      <DraftComparison
        oldContent="Hello World"
        newContent="Hello"
        onClose={() => {}}
      />,
    );
    const removedPart = screen.getByText(/World/);
    expect(removedPart).toHaveClass("bg-red-100");
  });

  it("renders restore button if onRestore is provided", () => {
    const handleRestore = vi.fn();
    render(
      <DraftComparison
        oldContent="Old"
        newContent="New"
        onClose={() => {}}
        onRestore={handleRestore}
      />,
    );
    expect(screen.getByText("Restaurar esta versão")).toBeInTheDocument();
  });
});
