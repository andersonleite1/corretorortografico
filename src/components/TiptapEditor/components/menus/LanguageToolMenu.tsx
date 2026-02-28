"use client";

// Componente de menu do LanguageTool
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BubbleMenu } from "../BubbleMenu";
import { useTiptapContext } from "../Provider";
import { useEditorState } from "@tiptap/react";
import { Icon } from "../ui/Icon";

const LanguageToolMenuComponent = () => {
  const { editor, messages } = useTiptapContext();
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);
  const showDialogRef = useRef(false);
  const suppressAutoOpenRef = useRef(false);

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
    const elem =
      raw && (raw as any).nodeType === 3
        ? (raw as any).parentElement
        : (raw as Element | null);
    let el = elem?.closest?.(".lt-error") as HTMLElement | null;
    if (!el && (e as any).composedPath) {
      const path = (e as any).composedPath() as Array<EventTarget>;
      for (const t of path) {
        const et = t as Element;
        if (
          et &&
          (et as any).classList &&
          (et as any).classList.contains("lt-error")
        ) {
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
        suppressAutoOpenRef.current = true;
        if (hoveredEl) {
          setHoveredEl(null);
          setHoveredIssueId(null);
        }
        editor?.view?.dispatch(editor.view.state.tr);
        return;
      }
      showDialogRef.current = true;
      suppressAutoOpenRef.current = false;
      const id = el.getAttribute("data-lt-id");
      setHoveredEl(el);
      setHoveredIssueId(id);
      editor?.view?.dispatch(editor.view.state.tr);
    };
    dom.addEventListener("mousedown", handleDown, { capture: true });
    const handleMove = (e: MouseEvent) => {
      if (suppressAutoOpenRef.current) return;
      const el = findErrorElement(e);
      if (el) {
        const id = el.getAttribute("data-lt-id");
        setHoveredEl(el);
        setHoveredIssueId(id);
        showDialogRef.current = true;
        editor?.view?.dispatch(editor.view.state.tr);
      }
    };
    const handleLeave = () => {};
    dom.addEventListener("mousemove", handleMove, { passive: true });
    dom.addEventListener("mouseleave", handleLeave, { passive: true });
    return () => {
      dom.removeEventListener("mousedown", handleDown, true as any);
      dom.removeEventListener("mousemove", handleMove as any);
      dom.removeEventListener("mouseleave", handleLeave as any);
    };
  }, [editor, findErrorElement, hoveredEl]);

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
    return Boolean(
      ltState.enabled &&
      !suppressAutoOpenRef.current &&
      (showDialogRef.current || hoveredEl),
    );
  }, [ltState.enabled, hoveredEl]);

  const getReferencedVirtualElement = useCallback(() => {
    if (!hoveredEl) return null;
    return {
      getBoundingClientRect: () => hoveredEl.getBoundingClientRect(),
      contextElement: hoveredEl,
    } as any;
  }, [hoveredEl]);

  const applyReplacement = useCallback(
    (text: string) => {
      if (!issue) return;
      editor.commands.applyLanguageToolSuggestion({
        from: issue.from,
        to: issue.to,
        text,
      });
      editor.commands.ignoreLanguageToolIssue?.(issue.id);
      showDialogRef.current = false;
      setHoveredEl(null);
      setHoveredIssueId(null);
    },
    [editor, issue],
  );

  const ignoreIssue = useCallback(() => {
    if (!issue) return;
    editor.commands.ignoreLanguageToolIssue?.(issue.id);
    showDialogRef.current = false;
    setHoveredEl(null);
    setHoveredIssueId(null);
    editor?.view?.dispatch(editor.view.state.tr);
  }, [editor, issue]);

  const closeDialog = useCallback(() => {
    showDialogRef.current = false;
    setHoveredEl(null);
    setHoveredIssueId(null);
    editor?.view?.dispatch(editor.view.state.tr);
  }, [editor]);

  return (
    <BubbleMenu
      editor={editor}
      pluginKey={"languageTool-bubble"}
      shouldShow={shouldShow as any}
      updateDelay={80}
      appendTo={() => document.body}
      getReferencedVirtualElement={getReferencedVirtualElement as any}
      options={{
        placement: "bottom-start",
        strategy: "fixed",
        flip: true,
        offset: [0, 8] as any,
      }}
    >
      <div className="lt-menu-card">
        <div className="lt-menu-card__header">
          <div className="lt-menu-card__header-left">
            <div className="lt-menu-card__logo">EDT</div>
            <span>Corrigir</span>
            <Icon name="ChevronDown" size={14} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="lt-menu-card__handle">
              <Icon name="Stretch" size={16} />
            </div>
            <button className="lt-menu-card__close" onClick={closeDialog}>
              <Icon name="Close" size={18} />
            </button>
          </div>
        </div>

        <div className="lt-menu-card__body">
          <div className="lt-menu-card__title">
            {(issue && (issue.ruleDescription || issue.typeName)) ||
              messages.languageTool.fallbackRule}
          </div>
          <p className="lt-menu-card__message">
            {issue?.message || messages.languageTool.empty}
          </p>

          <div className="lt-menu-card__suggestions">
            {(issue?.replacements || []).slice(0, 6).map((rep: string) => (
              <button
                key={String(rep)}
                className="lt-menu-card__suggestion-btn"
                onClick={() => applyReplacement(String(rep))}
              >
                {rep}
              </button>
            ))}
            {issue &&
              (!issue.replacements || issue.replacements.length === 0) && (
                <span
                  className="rte-label"
                  style={{ color: "var(--rte-muted-fg)" }}
                >
                  {messages.languageTool.noSuggestions}
                </span>
              )}
          </div>

          <div className="lt-menu-card__actions">
            <button
              className="lt-menu-card__action-btn lt-menu-card__action-btn--ignore"
              onClick={ignoreIssue}
            >
              <Icon name="Trash" size={14} />
              {messages.languageTool.ignore}
            </button>
          </div>
        </div>
      </div>
    </BubbleMenu>
  );
};

// Memoização para evitar re-renderizações desnecessárias do menu
export const LanguageToolMenu = memo(LanguageToolMenuComponent);

export default LanguageToolMenu;
