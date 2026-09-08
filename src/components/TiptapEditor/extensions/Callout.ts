import { mergeAttributes, Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      toggleCallout: () => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: "default",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-variant") || "default",
        renderHTML: () => ({ "data-variant": "default" }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'aside[data-type="callout"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes, { "data-type": "callout", "data-variant": "default" }), 0];
  },
  addCommands() {
    return {
      toggleCallout: () => ({ commands }: { commands: any }) => commands.toggleWrap(this.name),
      unsetCallout: () => ({ commands }: { commands: any }) => commands.lift(this.name),
    };
  },
});
