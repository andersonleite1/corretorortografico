"use client";

import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import Icon from "../ui/Icon";

import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";

const ImportPdfButton = () => {
  const { messages } = useTiptapContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  return (
    <>
      <MenuButton
        icon="FilePdf"
        text={messages.toolbar.importPdf}
        tooltip={messages.toolbar.importPdf}
        onClick={handleClick}
        hideText
      />
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setIsDialogOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform hover:scale-110 duration-300">
              <Icon name="FilePdf" size={32} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Recurso em Desenvolvimento</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">
              Este recurso está em desenvolvimento e em breve estará disponível para ser utilizado.
            </p>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[16px] transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportPdfButton;
