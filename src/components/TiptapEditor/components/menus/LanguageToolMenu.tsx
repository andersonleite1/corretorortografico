// Componente de menu do LanguageTool: exibe sugestões e ações de correção
// Este arquivo controla: como detectar o erro clicado, decidir se o diálogo deve aparecer,
// ancorar a posição do menu, e renderizar o conteúdo de sugestões.
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { BubbleMenu } from "../BubbleMenu";
import { useTiptapContext } from "../Provider";
import { useEditorState } from "@tiptap/react";

// Cor primária utilizada nos botões e identidade visual do diálogo
const PrimaryColor = "#389E74";

// Componente principal do menu do LanguageTool
// Observa o estado do editor (storage.languageTool), resolve a issue ativa a partir do clique
// e renderiza o BubbleMenu com as sugestões e ações.
const LanguageToolMenu = () => {
  // Editor e referência ao container do conteúdo (para posicionar o menu)
  const { editor, contentElement } = useTiptapContext();
  // Elemento clicado/ativo com erro (decoração .lt-error) e seu ID (data-lt-id)
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);

  // Estado derivado do editor: pega o storage.languageTool (enabled + lista de issues)
  const ltState = useEditorState({
    editor,
    selector: (ctx) => {
      const storage = (ctx.editor.storage as any).languageTool;
      return {
        enabled: storage?.enabled ?? false,
        issues: storage?.issues ?? [],
      };
    },
  });

  // Log auxiliar para depuração: mostra se o corretor está ativo e quantas issues existem
  useEffect(() => {
    console.log("[LT] state", {
      enabled: ltState.enabled,
      issuesCount: (ltState.issues as any[])?.length || 0,
    });
  }, [ltState.enabled, ltState.issues]);

  /*
   [LT] Dialog open-on-click flow
   - Registers a click listener on `editor.view.dom`.
   - On click, resolves the closest element with class `.lt-error` (a LanguageTool decoration).
   - If found:
     - Reads its `data-lt-id` and sets `hoveredEl` and `hoveredIssueId`.
     - This re-computes `issue` (useMemo) and provides an anchor for the BubbleMenu (getReferencedVirtualElement).
     - Visibility é decidida por `shouldShow`.
       Modo de teste (forçado): abre com `enabled === true`.
       Produção (somente clique no erro): exija `enabled && hoveredEl && hoveredIssueId && issue`.
   - If not found:
     - Clears `hoveredEl`/`hoveredIssueId` to ensure the dialog is hidden.
   - Cleanup: removes the click listener when the component unmounts or dependencies change.
  */
  useEffect(() => {
    const dom = editor?.view?.dom as HTMLElement | undefined;
    if (!dom) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      // Resolve a decoração de erro (.lt-error) mais próxima do alvo do clique
      const el = target?.closest?.(".lt-error") as HTMLElement | null;
      if (!el) {
        if (hoveredEl) {
          setHoveredEl(null);
          setHoveredIssueId(null);
          console.log("[LT] click cleared"); // Clique não foi em erro; esconder diálogo
        }
        return;
      }
      // Captura o ID da issue aplicado na decoração
      const id = el.getAttribute("data-lt-id");
      setHoveredEl(el);
      setHoveredIssueId(id);
      console.log("[LT] click on error", { id }); // Clique em erro; exibir diálogo para esta issue
    };
    dom.addEventListener("click", handleClick);
    return () => {
      dom.removeEventListener("click", handleClick as any);
    };
  }, [editor, hoveredEl]);

  // Fallback por seleção: resolve a issue que intersecta a seleção atual
  const getActiveIssue = useCallback(() => {
    if (!ltState.enabled) return null;
    const { from, to } = editor.state.selection;
    console.log("[LT] selection", { from, to });
    const issues = ltState.issues as Array<{
      id: string;
      from: number;
      to: number;
      message: string;
      replacements: string[];
      ruleDescription?: string;
      typeName?: string;
      sentence?: string;
    }>;
    for (const issue of issues) {
      const overlap = !(to < issue.from || from > issue.to);
      if (overlap) {
        console.log("[LT] active issue", issue);
        return issue;
      }
    }
    console.log("[LT] no active issue for current selection");
    return null;
  }, [editor, ltState.enabled, ltState.issues]);

  // Issue atual exibida no diálogo:
  // 1) Primeiro tenta pelo ID do elemento clicado (hoveredIssueId)
  // 2) Se não houver, tenta pelo intervalo da seleção
  // 3) Por fim, usa a primeira issue disponível como fallback
  const issue = useMemo(() => {
    if (hoveredIssueId) {
      const list = (ltState.issues as any[]) || [];
      const i = list.find((x) => x.id === hoveredIssueId) || null;
      if (i) {
        console.log("[LT] issue from hover", i);
        return i;
      }
      console.log("[LT] issue id not found in storage", { hoveredIssueId, listLen: list.length });
    }
    const bySelection = getActiveIssue();
    if (bySelection) return bySelection;
    const first = ((ltState.issues as any[]) || [])[0] || null;
    if (first) console.log("[LT] fallback first issue", first);
    return first;
  }, [hoveredIssueId, ltState.issues, getActiveIssue]);

  // Regra de visibilidade do diálogo:
  // Modo de teste (forçado): mostra quando o corretor está habilitado
  // Para uso somente no clique do erro, substitua por:
  //   const show = Boolean(ltState.enabled && hoveredEl && hoveredIssueId && issue);
  const shouldShow = useCallback(() => {
    const show = Boolean(ltState.enabled);
    // const show = Boolean(ltState.enabled && hoveredEl && hoveredIssueId && issue);
    console.log('------------------------------------------------------------');
    console.log("[LT] shouldShow [CLICK RIGHT]", {
      enabled: ltState.enabled,
      hasEl: Boolean(hoveredEl),
      hoveredIssueId,
      hasIssue: Boolean(issue),
      show,
    });
    console.log('------------------------------------------------------------');
    console.log('\n');
    console.log('ltState.enabled:', ltState.enabled);
    console.log('hoveredEl:', hoveredEl);
    console.log('hoveredIssueId:', hoveredIssueId);
    console.log('issue:', issue);
console.log('------------------------------------------------------------');
    return show;
  }, [ltState.enabled, hoveredEl, hoveredIssueId, issue]);

  // Elemento virtual para posicionar o BubbleMenu:
  // 1) Usa o boundingClientRect do elemento de erro clicado
  // 2) Se não houver, cria um retângulo mínimo dentro do container (fallback)
  const getReferencedVirtualElement = useCallback(() => {
    const container = (contentElement.current as HTMLElement | null) ?? editor?.view?.dom;
    if (!container) return null;
    const containerRect = container.getBoundingClientRect();
    const elRect = hoveredEl?.getBoundingClientRect();
    const gap = 16;
    const x = containerRect.right + gap;
    const y = (elRect?.top ?? (containerRect.top + 80));
    const w = 1;
    const h = 1;
    const sideRect = {
      width: w,
      height: h,
      x,
      y,
      top: y,
      left: x,
      right: x + w,
      bottom: y + h,
      toJSON: () => ({ x, y, width: w, height: h, top: y, left: x, right: x + w, bottom: y + h }),
    } as DOMRect;
    console.log("[LT] side anchor", sideRect);
    return {
      getBoundingClientRect: () => sideRect,
      contextElement: document.body,
    } as any;
  }, [hoveredEl, contentElement, editor]);

  // Aplica uma sugestão na faixa da issue e marca a issue como ignorada
  const applyReplacement = useCallback(
    (text: string) => {
      if (!issue) return;
      console.log("[LT] apply replacement", { text, issue });
      editor.commands.applyLanguageToolSuggestion({ from: issue.from, to: issue.to, text });
      editor.commands.ignoreLanguageToolIssue?.(issue.id);
    },
    [editor, issue]
  );

  // Apenas ignora a issue atual (remove decorações e da lista)
  const ignoreIssue = useCallback(() => {
    if (!issue) return;
    console.log("[LT] ignore issue", issue);
    editor.commands.ignoreLanguageToolIssue?.(issue.id);
  }, [editor, issue]);

  // Renderiza o BubbleMenu com conteúdo e ações de correção
  return (
    <BubbleMenu
      editor={editor}
      pluginKey={"languageTool-bubble"}
      shouldShow={shouldShow as any}
      updateDelay={80}
      appendTo={() => document.body}
      getReferencedVirtualElement={getReferencedVirtualElement as any}
      options={{
        placement: "right-start",
        strategy: "fixed",
        flip: false,
        offset: () => ({ mainAxis: 0, crossAxis: 0 }),
      }}
    >
      {/* Layout do diálogo: cabeçalho, descrição da regra/mensagem e bloco de sugestões */}
      <div style={{ width: 360, maxWidth: 380, padding: "0.6rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: 6,
                backgroundColor: PrimaryColor,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              LT
            </span>
            <span style={{ fontWeight: 600 }}>Correct</span>
          </div>
        </div>

        <div style={{ marginTop: 8, border: "1px solid var(--rte-border)", borderRadius: 8, overflow: "hidden" }}>
          {/* Mensagem da regra e descrição do erro */}
          <div style={{ padding: "0.5rem" }}>
            <div className="rte-label" style={{ marginBottom: 4 }}>
              {(issue && (issue.ruleDescription || issue.typeName)) || "Ortografia"}
            </div>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.4 }}>{issue?.message || "Selecione um erro para ver as sugestões"}</p>
          </div>
          {/* Lista de sugestões (máx. 6) e ação de ignorar */}
          <div style={{ borderTop: "1px solid var(--rte-border)", padding: "0.5rem", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(issue?.replacements || []).slice(0, 6).map((rep) => (
              <button
                key={String(rep)}
                className="rte-button rte-button--primary"
                style={{ backgroundColor: PrimaryColor, borderColor: PrimaryColor }}
                onClick={() => applyReplacement(String(rep))}
              >
                {rep}
              </button>
            ))}
            {issue && (!issue.replacements || issue.replacements.length === 0) && (
              <span className="rte-label" style={{ color: "var(--rte-muted-fg)" }}>Nenhuma sugestão</span>
            )}
            <button className="rte-button rte-button--outline" onClick={ignoreIssue}>Ignorar</button>
          </div>
        </div>

      </div>
    </BubbleMenu>
  );
};

// Memoização para evitar re-renderizações desnecessárias do menu
export default memo(LanguageToolMenu);
