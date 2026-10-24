import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";

describe("Sitemap Generator", () => {
  it("lista a landing e as páginas institucionais canônicas", () => {
    expect(sitemap()).toEqual([
      expect.objectContaining({
        url: "https://corretorortografico.online/",
        priority: 1,
      }),
      expect.objectContaining({
        url: "https://corretorortografico.online/sobre",
        priority: 0.5,
      }),
      expect.objectContaining({
        url: "https://corretorortografico.online/privacidade",
        priority: 0.3,
      }),
    ]);
  });
});
