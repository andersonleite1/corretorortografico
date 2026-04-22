import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// Define the state interface
interface SearchState {
  searchTerm: string;
  replaceTerm: string;
  results: { from: number; to: number }[];
  currentResultIndex: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    searchAndReplace: {
      setSearchTerm: (searchTerm: string) => ReturnType;
      setReplaceTerm: (replaceTerm: string) => ReturnType;
      replace: () => ReturnType;
      replaceAll: () => ReturnType;
      nextSearchResult: () => ReturnType;
      previousSearchResult: () => ReturnType;
    };
  }
}

const searchReplacePluginKey = new PluginKey<SearchState>("searchReplace");

export const SearchAndReplace = Extension.create<any, SearchState>({
  name: "searchAndReplace",

  addStorage() {
    return {
      searchTerm: "",
      replaceTerm: "",
      results: [] as { from: number; to: number }[],
      currentResultIndex: 0,
    };
  },

  addCommands() {
    return {
      setSearchTerm:
        (searchTerm: string) =>
        ({ editor, tr, dispatch }) => {
          const storage = (editor.storage as any).searchAndReplace as SearchState;
          storage.searchTerm = searchTerm;
          storage.results = [];
          storage.currentResultIndex = 0;

          if (dispatch) {
            tr.setMeta("searchAndReplace", { type: "UPDATE_SEARCH", searchTerm });
          }
          return true;
        },
      setReplaceTerm:
        (replaceTerm: string) =>
        ({ editor, tr, dispatch }) => {
          const storage = (editor.storage as any).searchAndReplace as SearchState;
          storage.replaceTerm = replaceTerm;
          if (dispatch) {
            tr.setMeta("searchAndReplace", { type: "UPDATE_REPLACE", replaceTerm });
          }
          return true;
        },
      replace:
        () =>
        ({ editor, tr, dispatch }) => {
          const state = (editor.storage as any).searchAndReplace as SearchState;
          if (state.results.length === 0) return false;

          const result = state.results[state.currentResultIndex];
          if (!result) return false;

          if (dispatch) {
            tr.insertText(state.replaceTerm, result.from, result.to);
            tr.setMeta("searchAndReplace", { type: "REPLACE" });
          }
          return true;
        },
      replaceAll:
        () =>
        ({ editor, tr, dispatch }) => {
          const state = (editor.storage as any).searchAndReplace as SearchState;
          if (state.results.length === 0) return false;

          let offset = 0;
          const resultsCopy = [...state.results];

          if (dispatch) {
            resultsCopy.forEach((result) => {
              tr.insertText(state.replaceTerm, result.from + offset, result.to + offset);
              offset += state.replaceTerm.length - (result.to - result.from);
            });
            tr.setMeta("searchAndReplace", { type: "REPLACE_ALL" });
          }
          return true;
        },
      nextSearchResult:
        () =>
        ({ editor, tr, dispatch }) => {
          const state = (editor.storage as any).searchAndReplace as SearchState;
          if (state.results.length === 0) return false;

          const nextIndex = (state.currentResultIndex + 1) % state.results.length;
          state.currentResultIndex = nextIndex;

          if (dispatch) {
            tr.setMeta("searchAndReplace", { type: "UPDATE_INDEX", index: nextIndex });
          }
          return true;
        },
      previousSearchResult:
        () =>
        ({ editor, tr, dispatch }) => {
          const state = (editor.storage as any).searchAndReplace as SearchState;
          if (state.results.length === 0) return false;

          const prevIndex =
            (state.currentResultIndex - 1 + state.results.length) % state.results.length;
          state.currentResultIndex = prevIndex;

          if (dispatch) {
            tr.setMeta("searchAndReplace", { type: "UPDATE_INDEX", index: prevIndex });
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        key: searchReplacePluginKey,
        state: {
          init() {
            return {
              searchTerm: "",
              replaceTerm: "",
              results: [] as { from: number; to: number }[],
              currentResultIndex: 0,
            };
          },
          apply(tr, value, oldState, newState) {
            const meta = tr.getMeta("searchAndReplace");
            const nextValue = { ...value };

            // Permite sincronizar com mudanças enviadas pela meta transaction
            if (meta) {
              if (meta.type === "UPDATE_SEARCH") nextValue.searchTerm = meta.searchTerm;
              if (meta.type === "UPDATE_INDEX") nextValue.currentResultIndex = meta.index;
            }

            // Sempre recalcular a busca se o documento mudar ou a query mudar
            if (tr.docChanged || meta) {
              const results: { from: number; to: number }[] = [];
              const searchTerm = nextValue.searchTerm;

              if (searchTerm) {
                // regex simples ignorando minusculas/maiusculas
                const regex = new RegExp(
                  searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                  "gi"
                );

                newState.doc.descendants((node, pos) => {
                  if (node.isText && node.text) {
                    let match;
                    while ((match = regex.exec(node.text)) !== null) {
                      results.push({
                        from: pos + match.index,
                        to: pos + match.index + match[0].length,
                      });
                    }
                  }
                });
              }

              nextValue.results = results;

              // Corrigir cursor de índice, caso saia out-of-bounds pela mudança do doc
              if (results.length > 0) {
                if (nextValue.currentResultIndex >= results.length) {
                  nextValue.currentResultIndex = 0;
                }
              } else {
                nextValue.currentResultIndex = 0;
              }

              const storage = (editor.storage as any).searchAndReplace as SearchState;
              storage.results = nextValue.results;
              storage.currentResultIndex = nextValue.currentResultIndex;
            }

            return nextValue;
          },
        },
        props: {
          decorations(state) {
            const pluginState = searchReplacePluginKey.getState(state);
            if (!pluginState || pluginState.results.length === 0) return null;

            const decorations = pluginState.results.map((result, i) => {
              const isCurrent = i === pluginState.currentResultIndex;
              return Decoration.inline(result.from, result.to, {
                class: isCurrent ? "search-result-current" : "search-result",
              });
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
