import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components/shared/EmptyState";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock icon component if needed
vi.mock("../TiptapEditor/components/ui/Icon", () => ({
  Icon: ({ name }: any) => <div data-testid="icon">{name}</div>,
}));

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="No items found"
        description="Try adding something new."
      />,
    );

    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(screen.getByText("Try adding something new.")).toBeInTheDocument();
  });

  it("renders string icon", () => {
    render(<EmptyState icon="📂" title="Title" description="Desc" />);
    expect(screen.getByText("📂")).toBeInTheDocument();
  });

  it("renders action button with href", () => {
    render(
      <EmptyState
        title="Title"
        description="Desc"
        action={{ label: "Go Home", href: "/" }}
      />,
    );
    const link = screen.getByText("Go Home");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/");
  });

  it("renders action button with onClick", () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="Title"
        description="Desc"
        action={{ label: "Click Me", onClick: handleClick }}
      />,
    );
    const button = screen.getByText("Click Me");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });
});
