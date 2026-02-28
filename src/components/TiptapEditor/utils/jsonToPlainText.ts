interface TiptapNode {
  type: string;
  text?: string;
  content?: TiptapNode[];
}

export const jsonToPlainText = (
  json: TiptapNode | string | null | undefined,
): string => {
  if (!json) return "";

  // If it's a string, it might be already HTML or plain text
  if (typeof json === "string") {
    try {
      const parsed = JSON.parse(json) as TiptapNode;
      return jsonToPlainText(parsed);
    } catch (e) {
      // Not JSON, return as is (stripping HTML just in case)
      return json.replace(/<[^>]*>?/gm, "");
    }
  }

  const parseNode = (node: TiptapNode): string => {
    if (node.type === "text") {
      return node.text || "";
    }

    let text = "";
    if (node.content && Array.isArray(node.content)) {
      text = node.content.map(parseNode).join("");
    }

    // Add newlines for block elements
    if (
      ["paragraph", "heading", "blockquote", "listItem", "codeBlock"].includes(
        node.type,
      )
    ) {
      return text + "\n";
    }

    return text;
  };

  return parseNode(json).trim();
};
