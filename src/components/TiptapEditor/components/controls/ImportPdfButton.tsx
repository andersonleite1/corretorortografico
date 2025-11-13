"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";

import MenuButton from "../MenuButton";

const ImportPdfButton = () => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push("/editar-pdf");
  }, [router]);

  return (
    <MenuButton
      icon="FilePdf"
      text="Importar PDF"
      tooltip="Importar PDF"
      onClick={handleClick}
      hideText
    />
  );
};

export default ImportPdfButton;
