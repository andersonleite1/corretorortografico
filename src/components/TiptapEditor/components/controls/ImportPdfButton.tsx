"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";

import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";

const ImportPdfButton = () => {
  const router = useRouter();
  const { messages } = useTiptapContext();

  const handleClick = useCallback(() => {
    router.push("/editar-pdf");
  }, [router]);

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
