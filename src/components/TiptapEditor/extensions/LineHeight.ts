import { Extension } from "@tiptap/core";

export interface LineHeightOptions {
  types: string[];
  defaultLineHeight: string | null;
  lineHeights: string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LineHeight = Extension.create<LineHeightOptions>({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      defaultLineHeight: null,
      lineHeights: ["1", "1.15", "1.5", "2"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) {
                return {};
              }

              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }) => {
          const normalized = lineHeight?.trim();
          if (!normalized) {
            return this.options.types
              .map((type) => commands.resetAttributes(type, "lineHeight"))
              .every(Boolean);
          }

          if (!this.options.lineHeights.includes(normalized)) {
            return false;
          }

          return this.options.types
            .map((type) =>
              commands.updateAttributes(type, { lineHeight: normalized }),
            )
            .every(Boolean);
        },
      unsetLineHeight:
        () =>
        ({ commands }) =>
          this.options.types
            .map((type) => commands.resetAttributes(type, "lineHeight"))
            .every(Boolean),
    };
  },
});

export default LineHeight;
