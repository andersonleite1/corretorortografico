export const jsonToPlainText = (json: any): string => {
    if (!json) return "";

    // If it's a string, it might be already HTML or plain text
    if (typeof json === "string") {
        try {
            const parsed = JSON.parse(json);
            return jsonToPlainText(parsed);
        } catch (e) {
            // Not JSON, return as is (stripping HTML just in case)
            return json.replace(/<[^>]*>?/gm, '');
        }
    }

    const parseNode = (node: any): string => {
        if (node.type === "text") {
            return node.text || "";
        }

        let text = "";
        if (node.content && Array.isArray(node.content)) {
            text = node.content.map(parseNode).join("");
        }

        // Add newlines for block elements
        if (["paragraph", "heading", "blockquote", "listItem", "codeBlock"].includes(node.type)) {
            return text + "\n";
        }

        return text;
    };

    return parseNode(json).trim();
};
