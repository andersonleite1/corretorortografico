import type { JSONContent } from "@tiptap/core";

export type MarkdownExportWarningCode =
  | "html-fallback"
  | "html-source-fallback"
  | "table-normalized"
  | "unsupported-node";

export interface MarkdownExportWarning {
  code: MarkdownExportWarningCode;
  detail?: string;
}

export interface MarkdownExportResult {
  markdown: string;
  warnings: MarkdownExportWarning[];
}

type SerializeMode = "markdown" | "html";

type SerializeContext = {
  warnings: Map<MarkdownExportWarningCode, MarkdownExportWarning>;
};

const MARKS_USING_HTML = new Set([
  "underline",
  "highlight",
  "subscript",
  "superscript",
  "textStyle",
  "color",
  "fontFamily",
  "fontSize",
  "lineHeight",
]);

const BLOCK_HTML_NODES = new Set(["imageFigure", "youtube"]);
const LIST_NODES = new Set(["bulletList", "orderedList", "taskList"]);

export function exportMarkdownDocument(
  content: JSONContent | null | undefined,
): MarkdownExportResult {
  if (!content) {
    return { markdown: "", warnings: [] };
  }

  const context: SerializeContext = {
    warnings: new Map(),
  };

  const markdown = serializeNode(content, context, "markdown", 0).trim();

  return {
    markdown,
    warnings: Array.from(context.warnings.values()),
  };
}

function addWarning(
  context: SerializeContext,
  code: MarkdownExportWarningCode,
  detail?: string,
) {
  if (!context.warnings.has(code)) {
    context.warnings.set(code, { code, detail });
  }
}

function serializeNode(
  node: JSONContent,
  context: SerializeContext,
  mode: SerializeMode,
  depth: number,
): string {
  switch (node.type) {
    case "doc":
      return joinBlocks(
        (node.content ?? [])
          .map((child) => serializeNode(child, context, mode, depth))
          .filter(Boolean),
      );
    case "paragraph":
      return serializeParagraph(node, context, mode);
    case "text":
      return serializeTextNode(node, context, mode);
    case "hardBreak":
      return mode === "html" ? "<br />" : "  \n";
    case "heading":
      return serializeHeading(node, context, mode);
    case "bulletList":
      return serializeList(node, context, depth, "bullet");
    case "orderedList":
      return serializeList(node, context, depth, "ordered");
    case "taskList":
      return serializeList(node, context, depth, "task");
    case "listItem":
    case "taskItem":
      return serializeListItem(node, context, depth, node.type === "taskItem");
    case "blockquote":
      return prefixLines(
        joinBlocks(
          (node.content ?? [])
            .map((child) => serializeNode(child, context, mode, depth))
            .filter(Boolean),
        ),
        "> ",
      );
    case "callout": {
      addWarning(context, "html-fallback", "callout-as-gfm-alert");
      const content = joinBlocks(
        (node.content ?? [])
          .map((child) => serializeNode(child, context, mode, depth))
          .filter(Boolean),
      );
      return prefixLines(`[!NOTE]\n${content}`, "> ");
    }
    case "codeBlock":
      return serializeCodeBlock(node);
    case "blockMath":
      return serializeBlockMath(node);
    case "inlineMath":
      return serializeInlineMath(node, mode);
    case "horizontalRule":
      return "---";
    case "image":
      return serializeImage(node, context, mode);
    case "imageFigure":
      addWarning(context, "html-fallback", "imageFigure");
      return serializeImageFigure(node, context);
    case "imageCaption":
      return serializeInlineChildren(node.content ?? [], context, mode);
    case "table":
      return serializeTable(node, context);
    case "tableRow":
    case "tableHeader":
    case "tableCell":
      return "";
    case "youtube":
      addWarning(context, "html-fallback", "youtube");
      return serializeYoutube(node);
    case "whiteboardEmbed": {
      addWarning(context, "html-fallback", "whiteboardEmbed");
      const title =
        typeof node.attrs?.title === "string" && node.attrs.title.trim()
          ? node.attrs.title.trim()
          : "Quadro visual";
      const href =
        typeof node.attrs?.href === "string" ? node.attrs.href.trim() : "";
      if (!href) return `[${escapeMarkdownInline(title)}]`;
      if (mode === "html") {
        return `<p><a href="${escapeHtmlAttribute(href)}">${escapeHtml(title)}</a></p>`;
      }
      return `[${escapeMarkdownInline(title)}](${href})`;
    }
    default: {
      const childContent = node.content ?? [];
      if (BLOCK_HTML_NODES.has(node.type ?? "")) {
        addWarning(context, "html-fallback", node.type);
      } else {
        addWarning(context, "unsupported-node", node.type);
      }
      return joinBlocks(
        childContent
          .map((child) => serializeNode(child, context, mode, depth))
          .filter(Boolean),
      );
    }
  }
}

function serializeParagraph(
  node: JSONContent,
  context: SerializeContext,
  mode: SerializeMode,
) {
  const align =
    typeof node.attrs?.textAlign === "string" ? node.attrs.textAlign : null;
  const children = node.content ?? [];

  if (align && align !== "left" && mode === "markdown") {
    addWarning(context, "html-fallback", "textAlign");
    return `<p align="${escapeHtmlAttribute(align)}">${serializeInlineChildren(
      children,
      context,
      "html",
    )}</p>`;
  }

  return serializeInlineChildren(children, context, mode).trim();
}

function serializeHeading(
  node: JSONContent,
  context: SerializeContext,
  mode: SerializeMode,
) {
  const level =
    typeof node.attrs?.level === "number" &&
    node.attrs.level >= 1 &&
    node.attrs.level <= 6
      ? node.attrs.level
      : 1;
  const align =
    typeof node.attrs?.textAlign === "string" ? node.attrs.textAlign : null;
  const children = node.content ?? [];

  if (align && align !== "left" && mode === "markdown") {
    addWarning(context, "html-fallback", "heading-align");
    return `<h${level} align="${escapeHtmlAttribute(align)}">${serializeInlineChildren(
      children,
      context,
      "html",
    )}</h${level}>`;
  }

  const inline = serializeInlineChildren(children, context, mode).trim();
  return `${"#".repeat(level)} ${inline}`.trim();
}

function serializeCodeBlock(node: JSONContent) {
  const language =
    typeof node.attrs?.language === "string" ? node.attrs.language.trim() : "";
  const text = extractPlainText(node).replace(/\n$/, "");
  return `\`\`\`${language}\n${text}\n\`\`\``;
}

function serializeBlockMath(node: JSONContent) {
  const latex =
    typeof node.attrs?.latex === "string" ? node.attrs.latex.trim() : "";
  return `$$\n${latex}\n$$`;
}

function serializeInlineMath(node: JSONContent, mode: SerializeMode) {
  const latex =
    typeof node.attrs?.latex === "string" ? node.attrs.latex.trim() : "";
  return mode === "html"
    ? `<span data-type="inline-math" data-latex="${escapeHtmlAttribute(latex)}"></span>`
    : `$${latex}$`;
}

function serializeList(
  node: JSONContent,
  context: SerializeContext,
  depth: number,
  kind: "bullet" | "ordered" | "task",
) {
  return (node.content ?? [])
    .map((item, index) => {
      const prefix =
        kind === "ordered"
          ? `${index + 1}. `
          : kind === "task"
            ? taskPrefix(item)
            : "- ";

      return serializeListItem(item, context, depth, kind === "task", prefix);
    })
    .filter(Boolean)
    .join("\n");
}

function serializeListItem(
  node: JSONContent,
  context: SerializeContext,
  depth: number,
  isTaskItem: boolean,
  explicitPrefix?: string,
) {
  const prefix = explicitPrefix ?? (isTaskItem ? taskPrefix(node) : "- ");
  const continuationIndent = " ".repeat(prefix.length);
  const nestedIndent = "  ".repeat(depth + 1);

  let firstBlock = "";
  const trailingBlocks: string[] = [];

  for (const child of node.content ?? []) {
    if (!firstBlock && child.type === "paragraph") {
      firstBlock = serializeInlineChildren(
        child.content ?? [],
        context,
        "markdown",
      ).trim();
      continue;
    }

    if (!firstBlock && child.type === "heading") {
      firstBlock = serializeInlineChildren(
        child.content ?? [],
        context,
        "markdown",
      ).trim();
      continue;
    }

    const serialized = serializeNode(
      child,
      context,
      "markdown",
      depth + 1,
    ).trim();
    if (!serialized) continue;

    if (LIST_NODES.has(child.type ?? "")) {
      trailingBlocks.push(indentBlock(serialized, nestedIndent));
    } else {
      trailingBlocks.push(indentBlock(serialized, continuationIndent));
    }
  }

  const headerLines = firstBlock ? firstBlock.split("\n") : [""];
  let result = `${prefix}${headerLines[0]}`.trimEnd();

  for (const line of headerLines.slice(1)) {
    result += `\n${continuationIndent}${line}`;
  }

  if (trailingBlocks.length > 0) {
    result += `\n${trailingBlocks.join("\n")}`;
  }

  return result;
}

function serializeTable(node: JSONContent, context: SerializeContext) {
  const rows = (node.content ?? []).filter((row) => row.type === "tableRow");
  if (rows.length === 0) return "";

  const headerCells = getRowCells(rows[0], context);
  const bodyRows = rows.slice(1).map((row) => getRowCells(row, context));

  const firstRowHasExplicitHeader = (rows[0].content ?? []).some(
    (cell) => cell.type === "tableHeader",
  );

  if (!firstRowHasExplicitHeader) {
    addWarning(context, "table-normalized", "first-row-used-as-header");
  }

  const normalizedHeader = headerCells.length > 0 ? headerCells : [" "];
  const normalizedBody =
    bodyRows.length > 0
      ? bodyRows
      : [Array.from({ length: normalizedHeader.length }, () => " ")];

  const width = Math.max(
    normalizedHeader.length,
    ...normalizedBody.map((row) => row.length),
  );

  const header = padRow(normalizedHeader, width);
  const separator = Array.from({ length: width }, () => "---");
  const body = normalizedBody.map((row) => padRow(row, width));

  return [header, separator, ...body]
    .map((row) => `| ${row.join(" | ")} |`)
    .join("\n");
}

function getRowCells(row: JSONContent, context: SerializeContext) {
  return (row.content ?? [])
    .filter((cell) => cell.type === "tableCell" || cell.type === "tableHeader")
    .map(
      (cell) =>
        serializeInlineChildren(cell.content ?? [], context, "markdown")
          .replace(/\n/g, "<br />")
          .replace(/\|/g, "\\|")
          .trim() || " ",
    );
}

function serializeImage(
  node: JSONContent,
  context: SerializeContext,
  mode: SerializeMode,
) {
  const src = typeof node.attrs?.src === "string" ? node.attrs.src.trim() : "";
  const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
  const title = typeof node.attrs?.title === "string" ? node.attrs.title : "";
  const width = node.attrs?.width;

  if (!src) {
    addWarning(context, "unsupported-node", "image-without-src");
    return alt ? `[Image: ${alt}]` : "[Image]";
  }

  if (mode === "html" || width) {
    if (width) {
      addWarning(context, "html-fallback", "image-width");
    }

    const titleAttr = title ? ` title="${escapeHtmlAttribute(title)}"` : "";
    const widthAttr =
      typeof width === "number" || typeof width === "string"
        ? ` width="${escapeHtmlAttribute(String(width))}"`
        : "";
    return `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(
      alt,
    )}"${titleAttr}${widthAttr} />`;
  }

  const titlePart = title ? ` "${escapeMarkdownTitle(title)}"` : "";
  return `![${escapeMarkdownInline(alt)}](${src}${titlePart})`;
}

function serializeImageFigure(node: JSONContent, context: SerializeContext) {
  const imageNode = (node.content ?? []).find(
    (child) => child.type === "image",
  );
  const captionNode = (node.content ?? []).find(
    (child) => child.type === "imageCaption",
  );
  const imageMarkup = imageNode
    ? serializeImage(imageNode, context, "html")
    : "<p>[Image]</p>";
  const caption = captionNode
    ? serializeInlineChildren(captionNode.content ?? [], context, "html").trim()
    : "";

  return caption
    ? `<figure>\n${imageMarkup}\n<figcaption>${caption}</figcaption>\n</figure>`
    : `<figure>\n${imageMarkup}\n</figure>`;
}

function serializeYoutube(node: JSONContent) {
  const src =
    typeof node.attrs?.src === "string"
      ? node.attrs.src
      : typeof node.attrs?.videoId === "string"
        ? `https://www.youtube.com/watch?v=${node.attrs.videoId}`
        : "";

  return src ? `[YouTube](${src})` : "[YouTube]";
}

function serializeInlineChildren(
  content: JSONContent[],
  context: SerializeContext,
  mode: SerializeMode,
) {
  return content
    .map((child) => serializeInlineNode(child, context, mode))
    .join("");
}

function serializeInlineNode(
  node: JSONContent,
  context: SerializeContext,
  mode: SerializeMode,
) {
  if (node.type === "text") {
    return serializeTextNode(node, context, mode);
  }

  if (node.type === "hardBreak") {
    return mode === "html" ? "<br />" : "  \n";
  }

  if (node.type === "image") {
    return serializeImage(node, context, mode);
  }

  if (node.type === "inlineMath") {
    return serializeInlineMath(node, mode);
  }

  const fallback = serializeNode(node, context, mode, 0);
  return fallback;
}

function serializeTextNode(
  node: JSONContent,
  context: SerializeContext,
  mode: SerializeMode,
) {
  const marks = node.marks ?? [];
  const hasHtmlOnlyMarks = marks.some((mark) =>
    MARKS_USING_HTML.has(mark.type),
  );
  const normalizedMode =
    mode === "markdown" && hasHtmlOnlyMarks ? "html" : mode;

  if (mode === "markdown" && normalizedMode === "html") {
    addWarning(
      context,
      "html-fallback",
      marks.map((mark) => mark.type).join(","),
    );
  }

  let value =
    normalizedMode === "html"
      ? escapeHtml(node.text ?? "")
      : escapeMarkdownInline(node.text ?? "");

  for (const mark of marks) {
    value = applyMark(value, mark, context, normalizedMode);
  }

  return value;
}

function applyMark(
  value: string,
  mark: NonNullable<JSONContent["marks"]>[number],
  context: SerializeContext,
  mode: SerializeMode,
) {
  switch (mark.type) {
    case "bold":
      return mode === "html" ? `<strong>${value}</strong>` : `**${value}**`;
    case "italic":
      return mode === "html" ? `<em>${value}</em>` : `*${value}*`;
    case "strike":
      return mode === "html" ? `<s>${value}</s>` : `~~${value}~~`;
    case "code":
      return mode === "html" ? `<code>${value}</code>` : `\`${value}\``;
    case "link": {
      const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
      return mode === "html"
        ? `<a href="${escapeHtmlAttribute(href)}">${value}</a>`
        : `[${value}](${href})`;
    }
    case "underline":
      addWarning(context, "html-fallback", "underline");
      return `<u>${value}</u>`;
    case "subscript":
      addWarning(context, "html-fallback", "subscript");
      return `<sub>${value}</sub>`;
    case "superscript":
      addWarning(context, "html-fallback", "superscript");
      return `<sup>${value}</sup>`;
    case "highlight": {
      addWarning(context, "html-fallback", "highlight");
      const color =
        typeof mark.attrs?.color === "string" ? mark.attrs.color.trim() : "";
      const style = color
        ? ` style="background-color: ${escapeHtmlAttribute(color)};"`
        : "";
      return `<mark${style}>${value}</mark>`;
    }
    case "textStyle": {
      const style: string[] = [];
      if (typeof mark.attrs?.color === "string" && mark.attrs.color) {
        style.push(`color: ${mark.attrs.color}`);
      }
      if (typeof mark.attrs?.fontFamily === "string" && mark.attrs.fontFamily) {
        style.push(`font-family: ${mark.attrs.fontFamily}`);
      }
      if (typeof mark.attrs?.fontSize === "string" && mark.attrs.fontSize) {
        style.push(`font-size: ${mark.attrs.fontSize}`);
      }
      if (typeof mark.attrs?.lineHeight === "string" && mark.attrs.lineHeight) {
        style.push(`line-height: ${mark.attrs.lineHeight}`);
      }
      if (style.length === 0) return value;
      addWarning(context, "html-fallback", "textStyle");
      return `<span style="${escapeHtmlAttribute(style.join("; "))}">${value}</span>`;
    }
    default:
      addWarning(context, "unsupported-node", `mark:${mark.type}`);
      return value;
  }
}

function extractPlainText(node: JSONContent | null | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  return (node.content ?? []).map((child) => extractPlainText(child)).join("");
}

function taskPrefix(node: JSONContent) {
  const checked =
    typeof node.attrs?.checked === "boolean"
      ? node.attrs.checked
      : typeof node.attrs?.isChecked === "boolean"
        ? node.attrs.isChecked
        : false;
  return checked ? "- [x] " : "- [ ] ";
}

function joinBlocks(blocks: string[]) {
  return blocks.filter(Boolean).join("\n\n");
}

function indentBlock(block: string, indent: string) {
  return block
    .split("\n")
    .map((line) => (line ? `${indent}${line}` : line))
    .join("\n");
}

function prefixLines(block: string, prefix: string) {
  return block
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

function padRow(row: string[], width: number) {
  const result = [...row];
  while (result.length < width) {
    result.push(" ");
  }
  return result;
}

function escapeMarkdownInline(value: string) {
  return value.replace(/([\\`*_[\]<>])/g, "\\$1");
}

function escapeMarkdownTitle(value: string) {
  return value.replace(/"/g, '\\"');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlAttribute(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
