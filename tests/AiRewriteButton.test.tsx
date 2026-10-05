import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AiRewriteButton from "@/components/TiptapEditor/components/controls/AiRewriteButton";
const context = { locale: "pt" };
vi.mock("@/components/TiptapEditor/components/Provider", () => ({
  useTiptapContext: () => context,
}));
describe("AI referral to Zerus", () => {
  beforeEach(() => {
    context.locale = "pt";
  });
  it.each(["pt", "en", "es"])(
    "links to Zerus in %s without document data",
    (locale) => {
      context.locale = locale;
      render(<AiRewriteButton />);
      const link = screen.getByRole("link");
      const url = new URL(link.getAttribute("href")!);
      expect(url.origin).toBe("https://zerus.app");
      expect(url.pathname).toBe(locale === "pt" ? "/" : `/${locale}`);
      expect([...url.searchParams.keys()].sort()).toEqual([
        "utm_campaign",
        "utm_content",
        "utm_medium",
        "utm_source",
      ]);
      expect(url.searchParams.get("utm_content")).toBe("editor_ai");
      expect(link).toHaveAttribute("referrerpolicy", "origin");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    },
  );
  it("allows persistence failure to cancel navigation", () => {
    render(<AiRewriteButton />);
    const listener = (event: Event) => event.preventDefault();
    window.addEventListener("editordetexto:before-leave", listener);
    try {
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      screen.getByRole("link").dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    } finally {
      window.removeEventListener("editordetexto:before-leave", listener);
    }
  });
});
