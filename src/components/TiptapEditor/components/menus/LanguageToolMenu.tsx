// Componente de menu do LanguageTool
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BubbleMenu } from "../BubbleMenu";
import { useTiptapContext } from "../Provider";
import { useEditorState } from "@tiptap/react";

const PrimaryColor = "#389E74";

const LanguageToolMenu = () => {
  const { editor, contentElement } = useTiptapContext();
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);
  const showDialogRef = useRef(false);

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

  const lastDownRef = useRef(0);

  const findErrorElement = useCallback((e: MouseEvent): HTMLElement | null => {
    const raw = e.target as Node | null;
    const elem = (raw && (raw as any).nodeType === 3 ? (raw as any).parentElement : (raw as Element | null));
    let el = elem?.closest?.(".lt-error") as HTMLElement | null;
    if (!el && (e as any).composedPath) {
      const path = (e as any).composedPath() as Array<EventTarget>;
      for (const t of path) {
        const et = t as Element;
        if (et && (et as any).classList && (et as any).classList.contains("lt-error")) {
          el = et as HTMLElement;
          break;
        }
      }
    }
    return el;
  }, []);
  useEffect(() => {
    const dom = editor?.view?.dom as HTMLElement | undefined;
    if (!dom) return;
    const handleDown = (e: MouseEvent) => {
      const now = Date.now();
      const delta = now - lastDownRef.current;
      if (delta < 500) {
        return;
      }
      lastDownRef.current = now;
      const el = findErrorElement(e);
      if (!el) {
        showDialogRef.current = false;
        if (hoveredEl) {
          setHoveredEl(null);
          setHoveredIssueId(null);
        }
        editor?.view?.dispatch(editor.view.state.tr);
        return;
      }
      showDialogRef.current = true;
      const id = el.getAttribute("data-lt-id");
      setHoveredEl(el);
      setHoveredIssueId(id);
      editor?.view?.dispatch(editor.view.state.tr);
    };
    dom.addEventListener("mousedown", handleDown, { capture: true });
    const handleMove = (e: MouseEvent) => {
      const el = findErrorElement(e);
      if (el) {
        const id = el.getAttribute("data-lt-id");
        setHoveredEl(el);
        setHoveredIssueId(id);
        showDialogRef.current = true;
        editor?.view?.dispatch(editor.view.state.tr);
      }
    };
    const handleLeave = () => {
      // mantém a última seleção exibida; não limpa estados nem fecha o diálogo
    };
    dom.addEventListener("mousemove", handleMove, { passive: true });
    dom.addEventListener("mouseleave", handleLeave, { passive: true });
    return () => {
      dom.removeEventListener("mousedown", handleDown, true as any);
      dom.removeEventListener("mousemove", handleMove as any);
      dom.removeEventListener("mouseleave", handleLeave as any);
    };

  }, [editor]);

  const getActiveIssue = useCallback(() => {
    if (!ltState.enabled) return null;
    const { from, to } = editor.state.selection;
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
        return issue;
      }
    }
    return null;
  }, [editor, ltState.enabled, ltState.issues]);

  const issue = useMemo(() => {
    if (hoveredIssueId) {
      const list = (ltState.issues as any[]) || [];
      const i = list.find((x) => x.id === hoveredIssueId) || null;
      if (i) {
        return i;
      }
    }
    const bySelection = getActiveIssue();
    if (bySelection) return bySelection;
    const first = ((ltState.issues as any[]) || [])[0] || null;
    return first;
  }, [hoveredIssueId, ltState.issues, getActiveIssue]);

  const shouldShow = useCallback(() => {
    return Boolean(ltState.enabled && (showDialogRef.current || hoveredEl));
  }, [ltState.enabled, hoveredEl]);

  const getReferencedVirtualElement = useCallback(() => {
    const container = (contentElement.current as HTMLElement | null) ?? editor?.view?.dom;
    if (!container) return null;
    const containerRect = container.getBoundingClientRect();
    const elRect = hoveredEl?.getBoundingClientRect();
    const gap = 16;
    const estimatedWidth = 380;
    const estimatedHeight = 260;
    const maxX = Math.max(0, (window?.innerWidth ?? containerRect.right) - estimatedWidth - 8);
    const x = Math.min(containerRect.right + gap, maxX);
    const baseY = elRect?.top ?? (containerRect.top + 80);
    const maxY = Math.max(0, (window?.innerHeight ?? containerRect.bottom) - estimatedHeight - 8);
    const y = Math.min(Math.max(baseY, 8), maxY);
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
    return {
      getBoundingClientRect: () => sideRect,
      contextElement: document.body,
    } as any;
  }, [hoveredEl, contentElement, editor]);

  const applyReplacement = useCallback(
    (text: string) => {
      if (!issue) return;
      editor.commands.applyLanguageToolSuggestion({ from: issue.from, to: issue.to, text });
      editor.commands.ignoreLanguageToolIssue?.(issue.id);
    },
    [editor, issue]
  );

  const ignoreIssue = useCallback(() => {
    if (!issue) return;
    editor.commands.ignoreLanguageToolIssue?.(issue.id);
  }, [editor, issue]);

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
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              EDT
            </span>
            <span style={{ fontWeight: 600 }}>Corretor</span>
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
            {(issue?.replacements || []).slice(0, 6).map((rep: string) => (
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
