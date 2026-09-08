"use client";

import React, { forwardRef, useCallback, useEffect, useMemo } from "react";
import { Content, type Editor } from "@tiptap/react";

import dynamic from "next/dynamic";
import TiptapProvider, {
  type EditorPageMode,
  type ExportActions,
} from "./Provider";
import { type UseTiptapEditorOptions } from "../hooks/useTiptapEditor";

const MenuBar = dynamic(() => import("./MenuBar"), { ssr: false });
const StatusBar = dynamic(() => import("./StatusBar"), { ssr: false });
const Resizer = dynamic(() => import("./Resizer"), { ssr: false });

const LinkMenu = dynamic(
  () => import("./menus/LinkMenu").then((mod) => mod.LinkMenu),
  { ssr: false },
);
const ImageMenu = dynamic(
  () => import("./menus/ImageMenu").then((mod) => mod.ImageMenu),
  { ssr: false },
);
const CodeBlockMenu = dynamic(
  () => import("./menus/CodeBlockMenu").then((mod) => mod.CodeBlockMenu),
  { ssr: false },
);
const TableMenu = dynamic(() => import("./menus/TableMenu"), { ssr: false });
const LanguageToolMenu = dynamic(() => import("./menus/LanguageToolMenu"), {
  ssr: false,
});
const AiBubbleMenu = dynamic(
  () => import("./menus/AiBubbleMenu").then((mod) => mod.AiBubbleMenu),
  { ssr: false },
);

import getExtensionKit from "../kit";
import { cssVar } from "../utils/cssVar";
import { type Locale } from "../../../../i18n-config";

import "../styles/index.scss";

export type TiptapEditorRef = {
  getInstance: () => Editor | null;
};

export interface TiptapEditorProps {
  ssr?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  initialContent?: Content;
  placeholder?: {
    paragraph?: string;
    imageCaption?: string;
  };
  output?: "html" | "json";
  hideMenuBar?: boolean;
  hideStatusBar?: boolean;
  hideBubbleMenu?: boolean;
  containerClass?: string;
  menuBarClass?: string;
  contentClass?: string;
  contentMinHeight?: string | number;
  contentMaxHeight?: string | number;
  onContentChange?: (value: Content) => void;
  exportActions?: ExportActions;
  locale?: Locale;
  userPlan?: "free" | "pro" | "team";
  documentTitle?: string;
  onImportMarkdown?: () => void | Promise<void>;
  pageMode?: EditorPageMode;
}

const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  (
    {
      ssr = false,
      output = "html",
      readonly = false,
      disabled = false,
      initialContent,
      placeholder,
      hideMenuBar = false,
      hideStatusBar = false,
      hideBubbleMenu = false,
      contentMinHeight = 200,
      contentMaxHeight,
      onContentChange,
      exportActions,
      locale,
      userPlan = "free",
      documentTitle,
      onImportMarkdown,
      pageMode = "fluid",
    },
    ref,
  ) => {
    const isEditable = !readonly && !disabled;
    const displayBubbleMenu = isEditable && !hideBubbleMenu;

    const handleUpdate = useCallback(
      (editor: Editor) => {
        const content =
          output === "html"
            ? editor.isEmpty
              ? ""
              : editor.getHTML()
            : editor.getJSON();
        onContentChange?.(content);
      },
      [onContentChange, output],
    );

    const extensions = useMemo(() => getExtensionKit(locale), [locale]);

    const editorOptions: UseTiptapEditorOptions = {
      ref,
      placeholder,
      extensions,
      content: initialContent,
      editable: isEditable,
      immediatelyRender: !ssr,
      shouldRerenderOnTransaction: false,
      autofocus: false,
      onUpdate: ({ editor }) => handleUpdate(editor),
      editorProps: {
        attributes: {
          spellcheck: "false",
        },
      },
    };

    useEffect(() => {
      cssVar("--rte-editor-min-height", `${contentMinHeight}px`);
      cssVar("--rte-editor-max-height", `${contentMaxHeight}px`);
    }, [contentMaxHeight, contentMinHeight]);

    const menus = displayBubbleMenu && (
      <>
        {/* <TextMenu  /> */}
        <LinkMenu />
        <ImageMenu />
        <CodeBlockMenu />
        <TableMenu />
        <LanguageToolMenu />
        <AiBubbleMenu />
      </>
    );

    return (
      <TiptapProvider
        editorOptions={editorOptions}
        slotBefore={!hideMenuBar && <MenuBar />}
        slotAfter={!hideStatusBar && <StatusBar />}
        exportActions={exportActions}
        locale={locale}
        userPlan={userPlan}
        documentTitle={documentTitle}
        onImportMarkdown={onImportMarkdown}
        pageMode={pageMode}
      >
        {menus}
        <Resizer />
      </TiptapProvider>
    );
  },
);

TiptapEditor.displayName = "TiptapEditor";

export default TiptapEditor;
