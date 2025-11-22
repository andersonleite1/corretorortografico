"use client";

import React, {useCallback} from "react";
import {useRouter} from "next/navigation";

import MenuButton from "../MenuButton";
import {useTiptapContext} from "../Provider";
import {getRouteHref} from "@/lib/localeRoutes";

const ImportPdfButton = () => {
  const router = useRouter();
  const {messages, locale} = useTiptapContext();

  const handleClick = useCallback(() => {
    router.push(getRouteHref("pdfEditor", locale));
  }, [locale, router]);

  return (
    <MenuButton
      icon="FilePdf"
      text={messages.toolbar.importPdf}
      tooltip={messages.toolbar.importPdf}
      onClick={handleClick}
      hideText
    />
  );
};

export default ImportPdfButton;
