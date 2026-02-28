import { describe, it, expect } from "vitest";
import {
  getEditorMessages,
  editorMessages,
} from "@/components/TiptapEditor/i18n/messages";
import { i18n, type Locale } from "../i18n-config";

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("i18n — getEditorMessages", () => {
  it('retorna strings em português para locale "pt"', () => {
    const msg = getEditorMessages("pt");
    expect(msg.toolbar.bold).toBe("Negrito");
    expect(msg.toolbar.italic).toBe("Itálico");
    expect(msg.statusBar.words).toBe("Palavras");
    expect(msg.statusBar.characters).toBe("Caracteres");
    expect(msg.statusBar.fullscreen).toBe("Tela cheia");
  });

  it('retorna strings em inglês para locale "en"', () => {
    const msg = getEditorMessages("en");
    expect(msg.toolbar.bold).toBe("Bold");
    expect(msg.toolbar.italic).toBe("Italic");
    expect(msg.statusBar.words).toBe("Words");
    expect(msg.statusBar.characters).toBe("Characters");
    expect(msg.statusBar.fullscreen).toBe("Full screen");
  });

  it('retorna strings em espanhol para locale "es"', () => {
    const msg = getEditorMessages("es");
    expect(msg.toolbar.bold).toBe("Negrita");
    expect(msg.toolbar.italic).toBe("Cursiva");
    expect(msg.statusBar.words).toBe("Palabras");
    expect(msg.statusBar.characters).toBe("Caracteres");
    expect(msg.statusBar.fullscreen).toBe("Pantalla completa");
  });

  it("retorna mensagens em português (padrão) quando locale não está definido", () => {
    const msg = getEditorMessages(undefined);
    expect(msg.toolbar.bold).toBe("Negrito");
  });

  it("retorna mensagens em português (padrão) para locale inválido", () => {
    const msg = getEditorMessages("fr" as Locale);
    expect(msg.toolbar.bold).toBe("Negrito");
  });
});

describe("i18n — Integridade das mensagens", () => {
  const locales = i18n.locales as readonly Locale[];
  const referenceLocale: Locale = "pt";
  const referenceKeys = collectLeafKeys(editorMessages[referenceLocale]);

  it("todos os locales têm o mesmo conjunto de chaves que o locale de referência (pt)", () => {
    for (const locale of locales) {
      if (locale === referenceLocale) continue;
      const localeKeys = collectLeafKeys(editorMessages[locale]);
      const missing = referenceKeys.filter((k) => !localeKeys.includes(k));
      expect(
        missing,
        `Locale "${locale}" está faltando as chaves: ${missing.join(", ")}`,
      ).toHaveLength(0);
    }
  });

  it("função spellcheck.ready retorna string com contagem para todos os locales", () => {
    for (const locale of locales) {
      const msg = getEditorMessages(locale);
      const result = msg.statusBar.spellcheck.ready(5);
      expect(typeof result).toBe("string");
      expect(result).toContain("5");
    }
  });

  it("i18n tem exatamente 3 locales configurados", () => {
    expect(i18n.locales).toHaveLength(3);
    expect(i18n.locales).toContain("pt");
    expect(i18n.locales).toContain("en");
    expect(i18n.locales).toContain("es");
  });

  it('locale padrão é "pt"', () => {
    expect(i18n.defaultLocale).toBe("pt");
  });
});

// ── Utility ───────────────────────────────────────────────────────────────────
function collectLeafKeys(obj: any, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      typeof value === "object" &&
      value !== null &&
      typeof value !== "function"
    ) {
      keys.push(...collectLeafKeys(value, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}
