import { JSONContent, type CommandProps } from "@tiptap/core";
import { NodeSelection, Plugin, TextSelection } from "@tiptap/pm/state";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

import Figure from "../Figure";
import ImageCaption from "./ImageCaption";
import Image from "../Image/Image";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageFigure: {
      setImageFigure: (options: { src: string; caption?: string }) => ReturnType;
      imageToFigure: () => ReturnType;
      figureToImage: () => ReturnType;
      removeImage: () => ReturnType;
    };
  }
}

export const ImageFigure = Figure.extend({
  name: "imageFigure",
  content: "image imageCaption?",
  //   atom: true,

  addExtensions() {
    return [ImageCaption];
  },

  addCommands() {
    return {
      /**
       * Insert an imageFigure node with an image and optional caption.
       */
      setImageFigure:
        ({ src, caption }: { src: string; caption?: string | null }) =>
        ({ chain }: CommandProps) => {
          const content: JSONContent[] = [
            {
              type: Image.name,
              attrs: { src },
            },
          ];

          if (caption !== null && caption !== undefined) {
            content.push({
              type: ImageCaption.name,
              content: caption === "" ? [] : [{ type: "text", text: caption }],
            });
          }

          return chain().insertContent({ type: this.name, content }).run();
        },

      /**
       * Convert a standalone image into an imageFigure node.
       */
      imageToFigure:
        () =>
        ({ state, dispatch }: CommandProps) => {
          const { selection } = state;
          const imagePos =
            selection instanceof NodeSelection ? selection.from : selection.$anchor.pos;

          const imageNode = state.doc.nodeAt(imagePos);

          if (!imageNode || imageNode.type.name !== Image.name) {
            return false;
          }

          const figureType = this.type;
          const captionType = this.editor.schema.nodes[ImageCaption.name];

          const children: ProseMirrorNode[] = [imageNode];

          if (captionType) {
            const captionNode = captionType.createAndFill();
            if (captionNode) {
              children.push(captionNode);
            }
          }

          const figureNode = figureType.create(null, children);

          const tr = state.tr.replaceWith(
            imagePos,
            imagePos + imageNode.nodeSize,
            figureNode
          );

          const mappedPos = tr.mapping.map(imagePos);

          if (figureNode.childCount > 1) {
            const imageChild = figureNode.child(0);
            const captionStart = mappedPos + 1 + imageChild.nodeSize;
            tr.setSelection(TextSelection.create(tr.doc, captionStart));
          } else {
            tr.setSelection(NodeSelection.create(tr.doc, mappedPos));
          }

          if (dispatch) {
            dispatch(tr.scrollIntoView());
          }

          return true;
        },

      /**
       * Convert an imageFigure node back to a standalone image.
       */
      figureToImage:
        () =>
        ({ state, dispatch }: CommandProps) => {
          const { selection } = state;
          const $from =
            selection instanceof NodeSelection
              ? state.doc.resolve(selection.from)
              : selection.$from;

          let depth = $from.depth;
          let figurePos = selection instanceof NodeSelection ? selection.from : $from.pos;

          while (depth > 0 && $from.node(depth).type.name !== this.name) {
            figurePos = $from.before(depth);
            depth--;
          }

          const figureNode = state.doc.nodeAt(figurePos);

          if (!figureNode || figureNode.type.name !== this.name) {
            return false;
          }

          const imageNode = figureNode.firstChild;

          if (!imageNode) {
            return false;
          }

          const tr = state.tr.replaceWith(
            figurePos,
            figurePos + figureNode.nodeSize,
            imageNode
          );

          tr.setSelection(NodeSelection.create(tr.doc, tr.mapping.map(figurePos)));

          if (dispatch) {
            dispatch(tr.scrollIntoView());
          }

          return true;
        },

      /**
       * Remove an image or imageFigure node.
       */
      removeImage:
        () =>
        ({ state, tr, dispatch }: CommandProps) => {
          const { selection } = state;
          const pos =
            selection instanceof NodeSelection ? selection.from : selection.$from.pos;

          const node = state.doc.nodeAt(pos);

          if (!node || (node.type.name !== this.name && node.type.name !== Image.name)) {
            return false;
          }

          if (dispatch) {
            tr.deleteRange(pos, pos + node.nodeSize);
            dispatch(tr);
          }

          return true;
        },
    };
  },

  /**
   * Handle drag-and-drop behavior for imageFigure nodes.
   */
  addProseMirrorPlugins() {
    let draggedNode: NodeSelection | null;

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            dragstart: (view, event) => {
              if (
                !event.dataTransfer ||
                !event.target ||
                !(event.target instanceof HTMLImageElement)
              ) {
                return false;
              }

              // Get the position of the dragged image
              const pos = view.posAtDOM(event.target, 0);
              const $pos = view.state.doc.resolve(pos);

              // Check if the image is part of a `figure` node
              if ($pos.parent.type !== this.type) {
                return false;
              }

              // Set up drag data
              draggedNode = NodeSelection.create(view.state.doc, $pos.before($pos.depth));
              const draggedSlice = draggedNode.content();
              const { dom, text, slice } = view.serializeForClipboard(draggedSlice);

              event.dataTransfer.clearData();
              event.dataTransfer.setData("text/html", dom.innerHTML);
              event.dataTransfer.setData("text/plain", text);
              event.dataTransfer.effectAllowed = "copyMove";
              view.dragging = { slice: slice, move: event.ctrlKey };

              return true;
            },
            drop: (view) => {
              if (draggedNode) {
                view.dispatch(view.state.tr.setSelection(draggedNode));
                draggedNode = null;
              }
            },
            dragend: () => {
              draggedNode = null;
            },
          },
        },
      }),
    ];
  },
});

export default ImageFigure;
