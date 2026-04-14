import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import * as prod from "react/jsx-runtime";
import { createHighlighter } from "shiki";
import type { JSX } from "react";

// Restrict to only the languages supported by the editor's CodeBlock extension.
// This replaces shiki/bundle/full (loads ALL ~200 languages) with a minimal set,
// reducing the client bundle by ~35-40 MB.
const SUPPORTED_LANGS = [
  "bash",
  "c",
  "csharp",
  "css",
  "go",
  "graphql",
  "java",
  "javascript",
  "json",
  "kotlin",
  "less",
  "makefile",
  "markdown",
  "objc",
  "php",
  "plaintext",
  "python",
  "scss",
  "shell",
  "sql",
  "typescript",
  "vb",
  "xml",
] as const;

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light-default", "one-dark-pro"],
      langs: SUPPORTED_LANGS as unknown as string[],
    });
  }
  return highlighterPromise;
}

export async function highlight(code: string, lang: string) {
  const highlighter = await getHighlighter();

  // Fall back to plaintext if the requested language isn't in our set
  const resolvedLang = (SUPPORTED_LANGS as readonly string[]).includes(lang)
    ? lang
    : "plaintext";

  const out = await highlighter.codeToHast(code, {
    lang: resolvedLang,
    themes: {
      light: "github-light-default",
      dark: "one-dark-pro",
    },
  });

  return toJsxRuntime(out as any, {
    Fragment: prod.Fragment,
    jsx: prod.jsx,
    jsxs: prod.jsxs,
    components: {
      pre: ({ children }) => children as any,
    },
  }) as JSX.Element;
}
