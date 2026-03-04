import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";

describe("Sitemap Generator", () => {
  it("deve gerar as rotas com os slugs corretos em português (SEO Fix)", () => {
    const result = sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain("https://editordetexto.online/sobre");
    expect(urls).toContain("https://editordetexto.online/contato");
    expect(urls).toContain("https://editordetexto.online/privacidade");
    expect(urls).toContain("https://editordetexto.online/termos");
  });

  it("deve gerar as rotas com os slugs corretos em espanhol", () => {
    const result = sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain("https://editordetexto.online/es/sobre");
    expect(urls).toContain("https://editordetexto.online/es/contato");
    expect(urls).toContain("https://editordetexto.online/es/privacidade");
    expect(urls).toContain("https://editordetexto.online/es/termos");
  });

  it("deve gerar as rotas com os slugs corretos em inglês", () => {
    const result = sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain("https://editordetexto.online/about");
    expect(urls).toContain("https://editordetexto.online/contact");
    expect(urls).toContain("https://editordetexto.online/privacy");
    expect(urls).toContain("https://editordetexto.online/terms");
  });

  it("não deve conter as rotas antigas em inglês com prefixo /en/", () => {
    const result = sitemap();
    const urls = result.map((entry) => entry.url);

    const enPrefixUrls = urls.filter((url) => url.includes("/en/"));
    expect(enPrefixUrls).toHaveLength(0);
  });

  it("não deve conter a rota removida /editar-pdf", () => {
    const result = sitemap();
    const urls = result.map((entry) => entry.url);

    const pdfUrls = urls.filter((url) => url.includes("pdf"));
    expect(pdfUrls).toHaveLength(0);
  });
});
