import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";

describe("Sitemap Generator", () => {
  it("lista apenas a landing canônica do projeto", () => {
    expect(sitemap()).toEqual([
      expect.objectContaining({
        url: "https://corretorortografico.online/",
        priority: 1,
      }),
    ]);
  });
});
