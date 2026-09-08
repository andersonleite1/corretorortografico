import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import DOMPurify from "isomorphic-dompurify";

export type MarkdownImportMode = "normalized" | "plain-text";

export interface MarkdownImportResult {
  mode: MarkdownImportMode;
  html: string;
  warnings: string[];
}

export const MARKDOWN_IMPORT_MAX_BYTES = 1024 * 1024;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const plainTextFallback = (content: string) =>
  `<pre>${escapeHtml(content)}</pre>`;

const warningPatterns: Array<[RegExp, string]> = [
  [/^\s*import\s.+from\s.+$/m, "unsupported-mdx-import"],
  [/^\s*export\s.+$/m, "unsupported-mdx-export"],
  [/(^|\s)\[\[[^\]]+\]\]/m, "unsupported-wikilink"],
  [/^\s*:::[\s\w-]*$/m, "unsupported-directive"],
];

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["align", "class", "checked", "disabled"],
  }).trim();
}

function preserveFrontmatter(content: string) {
  return content.replace(
    /^(---|\+\++)\n([\s\S]*?)\n\1(\n|$)/,
    (_match, _delimiter, body, ending) => `\`\`\`yaml\n${body}\n\`\`\`${ending}`,
  );
}

function normalizeTaskLists(html: string) {
  if (typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const list of doc.querySelectorAll("ul.contains-task-list")) {
    list.setAttribute("data-type", "taskList");
    for (const item of Array.from(list.children)) {
      if (!(item instanceof HTMLElement) || item.tagName !== "LI") continue;
      const checkbox = item.querySelector("input[type=checkbox]");
      if (!checkbox) continue;
      item.setAttribute("data-type", "taskItem");
      item.setAttribute("data-checked", checkbox.hasAttribute("checked") ? "true" : "false");
      checkbox.remove();
    }
  }
  return doc.body.innerHTML.trim();
}

export async function importMarkdown({
  fileName,
  content,
}: {
  fileName?: string;
  content: string;
}): Promise<MarkdownImportResult> {
  if (fileName && !fileName.toLowerCase().endsWith(".md")) {
    throw new Error("invalid-markdown-extension");
  }
  if (!content.trim()) throw new Error("empty-markdown-file");
  if (new TextEncoder().encode(content).length > MARKDOWN_IMPORT_MAX_BYTES) {
    throw new Error("markdown-file-too-large");
  }

  const warnings = warningPatterns
    .filter(([pattern]) => pattern.test(content))
    .map(([, warning]) => warning);

  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkFrontmatter, ["yaml", "toml"])
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(preserveFrontmatter(content));
    const rawHtml = String(file).trim();
    const html = normalizeTaskLists(sanitizeHtml(rawHtml));
    if (!html) {
      return { mode: "plain-text", html: plainTextFallback(content), warnings: ["empty-sanitized-output"] };
    }
    if (html !== rawHtml) warnings.push("html-sanitized");
    return { mode: "normalized", html, warnings: [...new Set(warnings)] };
  } catch {
    return { mode: "plain-text", html: plainTextFallback(content), warnings: ["parse-failed-fallback", ...warnings] };
  }
}
