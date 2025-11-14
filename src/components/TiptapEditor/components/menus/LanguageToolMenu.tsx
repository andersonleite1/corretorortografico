import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { BubbleMenu } from "../BubbleMenu";
import { useTiptapContext } from "../Provider";
import { useEditorState } from "@tiptap/react";

const PrimaryColor = "#389E74";

const LanguageToolMenu = () => {
  const { editor, contentElement } = useTiptapContext();
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);

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

  useEffect(() => {
    console.log("[LT] state", {
      enabled: ltState.enabled,
      issuesCount: (ltState.issues as any[])?.length || 0,
    });
  }, [ltState.enabled, ltState.issues]);

  useEffect(() => {
    const dom = editor?.view?.dom as HTMLElement | undefined;
    if (!dom) return;
    const handleMove = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest?.(".lt-error") as HTMLElement | null;
      if (!el) {
        if (hoveredEl) {
          setHoveredEl(null);
          setHoveredIssueId(null);
          console.log("[LT] hover cleared");
        }
        return;
      }
      const id = el.getAttribute("data-lt-id");
      setHoveredEl(el);
      setHoveredIssueId(id);
      const rect = el.getBoundingClientRect();
      console.log("[LT] hover element", { id, rect });
    };
    const handleLeave = () => {
      setHoveredEl(null);
      setHoveredIssueId(null);
      console.log("[LT] hover leave");
    };
    dom.addEventListener("mousemove", handleMove, { passive: true });
    dom.addEventListener("mouseleave", handleLeave, { passive: true });
    return () => {
      dom.removeEventListener("mousemove", handleMove as any);
      dom.removeEventListener("mouseleave", handleLeave as any);
    };
  }, [editor, hoveredEl]);

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

  const shouldShow = useCallback(() => {
    const show = Boolean(ltState.enabled);
    console.log("[LT] shouldShow [FORCE]", { enabled: ltState.enabled, show });
    return show;
  }, [ltState.enabled]);

  const getReferencedVirtualElement = useCallback(() => {
    const el = hoveredEl;
    if (el) {
      return {
        getBoundingClientRect: () => el.getBoundingClientRect(),
        contextElement: el,
      } as any;
    }
    const container = (contentElement.current as HTMLElement | null) ?? editor?.view?.dom;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const x = rect.left + 24;
    const y = rect.top + 24;
    const w = 1;
    const h = 1;
    const fallback = {
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
    console.log("[LT] fallback anchor", fallback);
    return {
      getBoundingClientRect: () => fallback,
      contextElement: container,
    } as any;
  }, [hoveredEl, contentElement, editor]);

  const applyReplacement = useCallback(
    (text: string) => {
      if (!issue) return;
      console.log("[LT] apply replacement", { text, issue });
      editor.commands.applyLanguageToolSuggestion({ from: issue.from, to: issue.to, text });
      editor.commands.ignoreLanguageToolIssue?.(issue.id);
    },
    [editor, issue]
  );

  const ignoreIssue = useCallback(() => {
    if (!issue) return;
    console.log("[LT] ignore issue", issue);
    editor.commands.ignoreLanguageToolIssue?.(issue.id);
  }, [editor, issue]);

  return (
    <BubbleMenu
      editor={editor}
      pluginKey={"languageTool-bubble"}
      shouldShow={shouldShow as any}
      updateDelay={80}
      appendTo={() =>
        (contentElement.current as HTMLElement | null) ??
        editor.view.dom.parentElement ??
        document.body
      }
      getReferencedVirtualElement={getReferencedVirtualElement as any}
      options={{ placement: "top", offset: 10 }}
    >
      <div style={{ width: 280, maxWidth: 320, padding: "0.5rem" }}>
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

        <div style={{ marginTop: 8, border: "1px solid var(--rte-border)", borderRadius: 8 }}>
          <div style={{ padding: "0.5rem" }}>
            <div className="rte-label" style={{ marginBottom: 4 }}>
              {(issue && (issue.ruleDescription || issue.typeName)) || "Ortografia"}
            </div>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>{issue?.message || "Selecione um erro para ver as sugestões"}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {(issue?.replacements || []).slice(0, 6).map((rep: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | React.Key | null | undefined) => (
            <button
              key={String(rep)}
              className="rte-button rte-button--primary"
              style={{ backgroundColor: PrimaryColor, borderColor: PrimaryColor }}
              onClick={() => applyReplacement(String(rep))}
            >
              {rep}
            </button>
          ))}
          <button className="rte-button rte-button--outline" onClick={ignoreIssue}>Ignorar</button>
        </div>
      </div>
    </BubbleMenu>
  );
};

export default memo(LanguageToolMenu);
