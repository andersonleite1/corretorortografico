import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import type { EditorState } from "prosemirror-state";
import type { LanguageToolMatch, LanguageToolIssue } from "@/types/languageTool";

type LanguageToolStatus = "idle" | "checking" | "ready" | "error" | "rate_limited";

type LanguageToolOptions = {
  enabled: boolean;
  language: "pt-BR";
  endpoint: string;
  checkDelay: number;
  minChars: number;
};

type TextSegment = {
  start: number;
  end: number;
  from: number;
  to: number;
};

type BlockSegment = {
  startOffset: number;
  endOffset: number;
  from: number;
  to: number;
  segments: TextSegment[];
};

type DocumentTextMap = {
  text: string;
  blocks: BlockSegment[];
};

type LanguageToolPluginState = {
  decorations: DecorationSet;
  issues: LanguageToolIssue[];
  status: LanguageToolStatus;
  message: string | null;
  enabled: boolean;
};

const pluginKey = new PluginKey<LanguageToolPluginState>("languageTool");

const createDefaultState = (enabled: boolean): LanguageToolPluginState => ({
  decorations: DecorationSet.empty,
  issues: [],
  status: "idle",
  message: null,
  enabled,
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    languageTool: {
      applyLanguageToolSuggestion: (options: { from: number; to: number; text: string }) => ReturnType;
      setLanguageToolEnabled: (enabled: boolean) => ReturnType;
      toggleLanguageTool: () => ReturnType;
    };
  }

  interface EditorStorage {
    languageTool: {
      status: LanguageToolStatus;
      issues: LanguageToolIssue[];
      message: string | null;
      lastUpdated: number | null;
      enabled: boolean;
    };
  }
}

const buildDocumentText = (state: EditorState): DocumentTextMap => {
  const blocks: BlockSegment[] = [];
  const blockInfos: Array<{
    segments: TextSegment[];
    pos: number;
    size: number;
    text: string;
  }> = [];

  state.doc.descendants((node, pos) => {
    if (node.isTextblock) {
      const segments: TextSegment[] = [];
      let blockOffset = 0;
      let blockText = "";

      node.descendants((child, childPos) => {
        if (child.isText && child.text) {
          const textContent = child.text;
          const start = blockOffset;
          const end = start + textContent.length;
          segments.push({
            start,
            end,
            from: pos + 1 + childPos,
            to: pos + 1 + childPos + textContent.length,
          });
          blockOffset = end;
          blockText += textContent;
        }
        return false;
      });

      blockInfos.push({
        segments,
        pos,
        size: node.nodeSize,
        text: blockText,
      });

      return false;
    }
    return true;
  });

  let text = "";

  blockInfos.forEach((block, index) => {
    const blockStart = text.length;
    const blockEnd = blockStart + block.text.length;

    blocks.push({
      startOffset: blockStart,
      endOffset: blockEnd,
      from: block.pos + 1,
      to: block.pos + block.size - 1,
      segments: block.segments,
    });

    text += block.text;
    if (index < blockInfos.length - 1) {
      text += "\n";
    }
  });

  return { text, blocks };
};

const findDocPosition = (blocks: BlockSegment[], offset: number): number | null => {
  if (!blocks.length) {
    return null;
  }

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    if (offset < block.startOffset) {
      return block.from;
    }

    if (offset <= block.endOffset) {
      const relative = offset - block.startOffset;

      if (relative <= 0) {
        return block.from;
      }

      for (const segment of block.segments) {
        if (relative < segment.start) {
          continue;
        }

        if (relative <= segment.end) {
          return segment.from + (relative - segment.start);
        }
      }

      return block.to;
    }
  }

  const tail = blocks[blocks.length - 1];
  return tail.to;
};

const toDecorationSet = (
  matches: LanguageToolMatch[],
  map: DocumentTextMap,
  state: EditorState
) => {
  const decorations: Decoration[] = [];
  const issues: LanguageToolIssue[] = [];

  matches.forEach((match, index) => {
    const from = findDocPosition(map.blocks, match.offset);
    const to = findDocPosition(map.blocks, match.offset + match.length);

    if (from === null || to === null || from === to) {
      return;
    }

    const replacements = match.replacements?.map((item) => item.value) ?? [];
    const titleParts = [match.message];
    if (replacements.length) {
      titleParts.push(`Sugestões: ${replacements.join(", ")}`);
    }

    const attrs: Record<string, string> = {
      class: "lt-error",
      "data-lt-id": `${match.rule?.id ?? "lt"}-${index}`,
      "data-lt-message": match.message,
      title: titleParts.join("\n"),
    };

    if (replacements.length) {
      attrs["data-lt-replacements"] = JSON.stringify(replacements);
    }

    decorations.push(Decoration.inline(from, to, attrs));
    issues.push({
      id: `${match.rule?.id ?? "lt"}-${index}`,
      from,
      to,
      message: match.message,
      replacements,
      ruleId: match.rule?.id,
      ruleDescription: match.rule?.description,
      typeName: match.type?.typeName,
      sentence: match.sentence,
    });
  });

  return {
    decorations: DecorationSet.create(state.doc, decorations),
    issues,
  };
};

export const LanguageTool = Extension.create<LanguageToolOptions>({
  name: "languageTool",

  addOptions() {
    return {
      enabled: true,
      language: "pt-BR",
      endpoint: "/api/languagetool",
      checkDelay: 10000,
      minChars: 20,
    };
  },

  addStorage() {
    return {
      status: "idle" as LanguageToolStatus,
      issues: [] as LanguageToolIssue[],
      message: null as string | null,
      lastUpdated: null as number | null,
      enabled: this.options.enabled ?? false,
    };
  },

  addCommands() {
    const getStorage = () => {
      if (!this.storage.languageTool) {
        this.storage.languageTool = {
          status: "idle" as LanguageToolStatus,
          issues: [] as LanguageToolIssue[],
          message: null as string | null,
          lastUpdated: null as number | null,
          enabled: this.options.enabled ?? false,
        };
      }
      return this.storage.languageTool;
    };

    return {
      applyLanguageToolSuggestion:
        ({ from, to, text }) =>
        ({ chain }) => {
          if (from < 0 || to < from) {
            return false;
          }
          return chain().focus().insertContentAt({ from, to }, text).run();
        },
      setLanguageToolEnabled:
        (enabled: boolean) =>
        ({ state, dispatch }) => {
          if (!dispatch) {
            return false;
          }

          const current = pluginKey.getState(state);
          if (current?.enabled === enabled) {
            const storage = getStorage();
            storage.enabled = enabled;
            return true;
          }

          const tr = state.tr.setMeta(pluginKey, {
            type: "languageToolToggle",
            enabled,
          });
          dispatch(tr);
          return true;
        },
      toggleLanguageTool:
        () =>
        ({ editor }) => {
          const storage = getStorage();
          const next = !storage.enabled;
          return editor.commands.setLanguageToolEnabled(next);
        },
    };
  },

  addProseMirrorPlugins() {
    if (typeof window === "undefined") {
      return [];
    }

    const options = this.options;
    const getStorage = () => {
      if (!this.storage.languageTool) {
        this.storage.languageTool = {
          status: "idle" as LanguageToolStatus,
          issues: [] as LanguageToolIssue[],
          message: null as string | null,
          lastUpdated: null as number | null,
          enabled: this.options.enabled ?? false,
        };
      }
      return this.storage.languageTool;
    };

    return [
      new Plugin<LanguageToolPluginState>({
        key: pluginKey,
        state: {
          init() {
            const storage = getStorage();
            return createDefaultState(storage.enabled ?? false);
          },
          apply(tr, value) {
            let next = value;

            if (tr.docChanged) {
              next = {
                ...next,
                decorations: next.decorations.map(tr.mapping, tr.doc),
              };
            }

            const meta = tr.getMeta(pluginKey);
            if (meta?.type === "languageToolResult") {
              next = {
                ...next,
                decorations: meta.decorations ?? DecorationSet.empty,
                issues: meta.issues ?? [],
                status: meta.status ?? "ready",
                message: meta.message ?? null,
              };
            } else if (meta?.type === "languageToolStatus") {
              next = {
                ...next,
                status: meta.status ?? next.status,
                message: meta.message ?? next.message,
              };
            } else if (meta?.type === "languageToolClear") {
              next = {
                ...next,
                decorations: DecorationSet.empty,
                issues: [],
                status: "idle",
                message: null,
              };
            } else if (meta?.type === "languageToolToggle") {
              const enabled = Boolean(meta.enabled);
              next = {
                ...next,
                enabled,
                status: "idle",
                message: null,
                decorations: enabled ? next.decorations : DecorationSet.empty,
                issues: enabled ? next.issues : [],
              };
              if (!enabled) {
                next = {
                  ...next,
                  decorations: DecorationSet.empty,
                  issues: [],
                };
              }
            }

            const storage = getStorage();
            storage.status = next.status;
            storage.issues = next.issues;
            storage.message = next.message;
            storage.lastUpdated = Date.now();
            storage.enabled = next.enabled;

            return next;
          },
        },
        props: {
          decorations(state) {
            const pluginState = pluginKey.getState(state);
            if (!pluginState?.enabled) {
              return DecorationSet.empty;
            }
            return pluginState.decorations ?? DecorationSet.empty;
          },
        },
        view(editorView) {
          const { checkDelay, endpoint, minChars } = options;
          let abortController: AbortController | null = null;
          let lastTextVersion = "";
          let destroyed = false;
          let timeoutId: number | null = null;

          const isEnabled = () => Boolean(pluginKey.getState(editorView.state)?.enabled);

          const dispatchStatus = (status: LanguageToolStatus, message: string | null = null) => {
            const tr = editorView.state.tr.setMeta(pluginKey, {
              type: "languageToolStatus",
              status,
              message,
            });
            editorView.dispatch(tr);
          };

          const resetTimer = () => {
            if (timeoutId) {
              window.clearTimeout(timeoutId);
              timeoutId = null;
            }
          };

          const scheduleCheck = () => {
            if (!isEnabled()) {
              return;
            }
            resetTimer();
            timeoutId = window.setTimeout(() => {
              timeoutId = null;
              if (!destroyed && !editorView.composing && isEnabled()) {
                void runCheck();
              }
            }, checkDelay);
          };

          const clearResults = () => {
            const tr = editorView.state.tr.setMeta(pluginKey, {
              type: "languageToolClear",
            });
            editorView.dispatch(tr);
          };

          const runCheck = async () => {
            if (!isEnabled()) {
              return;
            }

            const map = buildDocumentText(editorView.state);
            const rawText = map.text;
            const trimmed = rawText.trim();

            if (!trimmed || trimmed.length < minChars) {
              lastTextVersion = "";
              clearResults();
              return;
            }

            if (rawText === lastTextVersion) {
              return;
            }

            lastTextVersion = rawText;

            dispatchStatus("checking");

            abortController?.abort();
            abortController = new AbortController();

            let response: Response | null = null;

            try {
              response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: rawText }),
                signal: abortController.signal,
              });
            } catch (error) {
              if ((error as Error).name === "AbortError") {
                return;
              }
              dispatchStatus("error", "Não foi possível contatar o LanguageTool.");
              return;
            }

            if (!response.ok) {
              const message =
                response.status === 429
                  ? "Limite de 19 requisições por minuto atingido."
                  : "Falha ao consultar LanguageTool.";
              dispatchStatus(response.status === 429 ? "rate_limited" : "error", message);
              return;
            }

            let payload: { matches: LanguageToolMatch[] } | null = null;
            try {
              payload = (await response.json()) as { matches: LanguageToolMatch[] };
            } catch (error) {
              dispatchStatus("error", "Resposta inválida do LanguageTool.");
              return;
            }

            if (destroyed || !isEnabled()) {
              return;
            }

            const currentDoc = editorView.state.doc;
            const { decorations, issues } = toDecorationSet(payload.matches ?? [], map, editorView.state);

            if (!editorView.state.doc.eq(currentDoc)) {
              return;
            }

            const tr = editorView.state.tr.setMeta(pluginKey, {
              type: "languageToolResult",
              decorations,
              issues,
              status: "ready",
              message: null,
            });
            editorView.dispatch(tr);
          };

          if (isEnabled()) {
            scheduleCheck();
          }

          return {
            update(view, prevState) {
              const previous = pluginKey.getState(prevState);
              const current = pluginKey.getState(view.state);

              if (previous?.enabled !== current?.enabled) {
                lastTextVersion = "";
                if (current?.enabled) {
                  scheduleCheck();
                } else {
                  resetTimer();
                  abortController?.abort();
                }
                return;
              }

              if (!current?.enabled) {
                return;
              }

              if (view.composing) {
                return;
              }

              if (!view.state.doc.eq(prevState.doc)) {
                scheduleCheck();
              }
            },
            destroy() {
              destroyed = true;
              resetTimer();
              abortController?.abort();
            },
          };
        },
      }),
    ];
  },
});

export default LanguageTool;
