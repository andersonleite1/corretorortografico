import { Node } from "@tiptap/core";
import {
  getEmbedYoutubeUrl,
  isValidYoutubeUrl,
  normalizeYoutubeWidth,
} from "./utils";

export interface YoutubeOptions {
  allowFullscreen?: boolean;
  autoplay?: boolean;
  nocookie?: boolean;
  controls?: boolean;
}

type EmbedYoutubeOptions = { src: string; width?: number; height?: number };

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      embedYoutube: (options: EmbedYoutubeOptions) => ReturnType;
    };
  }
}

export const Youtube = Node.create<YoutubeOptions>({
  name: "youtube",
  group: "block",
  draggable: true,
  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      autoplay: false,
      nocookie: false,
      controls: true,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) =>
          getEmbedYoutubeUrl({ url: element.getAttribute("src") || "" }),
      },
      width: {
        default: null,
        parseHTML: (element) =>
          normalizeYoutubeWidth(Number.parseFloat(element.style.width)),
        renderHTML: (attrs) => {
          const width = normalizeYoutubeWidth(attrs.width);
          if (!width) return {};
          return { style: `width: ${width}%` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe[src]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const src = getEmbedYoutubeUrl({
            url: element.getAttribute("src") || "",
          });
          return src ? { src } : false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const src = getEmbedYoutubeUrl({
      url: typeof node.attrs.src === "string" ? node.attrs.src : "",
      allowFullscreen: this.options.allowFullscreen,
      autoplay: this.options.autoplay,
      controls: this.options.controls,
      nocookie: this.options.nocookie,
    });

    if (!src) {
      return [
        "span",
        { "data-youtube-invalid": "" },
        "Vídeo do YouTube indisponível",
      ];
    }

    const width = normalizeYoutubeWidth(node.attrs.width);
    const attributes: Record<string, string> = {
      src,
      title: "Vídeo do YouTube",
      allow:
        "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share",
      sandbox: "allow-scripts allow-same-origin allow-presentation",
      referrerpolicy: "strict-origin-when-cross-origin",
      loading: "lazy",
    };

    if (width) attributes.style = `width: ${width}%`;
    if (this.options.allowFullscreen) attributes.allowfullscreen = "";

    return ["iframe", attributes];
  },

  addCommands() {
    return {
      embedYoutube:
        (options: EmbedYoutubeOptions) =>
        ({ commands }) => {
          if (!isValidYoutubeUrl(options.src)) {
            return false;
          }

          const embedUrl = getEmbedYoutubeUrl({
            url: options.src,
            allowFullscreen: this.options.allowFullscreen,
            autoplay: this.options.autoplay,
            controls: this.options.controls,
            nocookie: this.options.nocookie,
          });

          if (!embedUrl) return false;

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: embedUrl,
              width: normalizeYoutubeWidth(options.width),
            },
          });
        },
    };
  },

  addNodeView() {
    return ({ node: initialNode }) => {
      let currentNode = initialNode;
      const dom = document.createElement("div");
      dom.className = "youtube-node-view";
      dom.contentEditable = "false";
      dom.style.cursor = "default";
      dom.style.marginInline = "auto";

      const renderNode = () => {
        const src = getEmbedYoutubeUrl({
          url:
            typeof currentNode.attrs.src === "string"
              ? currentNode.attrs.src
              : "",
          allowFullscreen: this.options.allowFullscreen,
          autoplay: this.options.autoplay,
          controls: this.options.controls,
          nocookie: this.options.nocookie,
        });
        const width = normalizeYoutubeWidth(currentNode.attrs.width);

        dom.style.width = width ? `${width}%` : "100%";
        dom.replaceChildren();

        if (!src) {
          dom.textContent = "Vídeo do YouTube indisponível";
          return;
        }

        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.title = "Vídeo do YouTube";
        iframe.allow =
          "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.setAttribute(
          "sandbox",
          "allow-scripts allow-same-origin allow-presentation",
        );
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.loading = "lazy";
        iframe.allowFullscreen = Boolean(this.options.allowFullscreen);
        dom.appendChild(iframe);
      };

      renderNode();

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) return false;
          currentNode = updatedNode;
          renderNode();
          return true;
        },
      };
    };
  },
});
