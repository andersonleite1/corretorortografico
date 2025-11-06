import React, { useCallback, useState, useEffect } from "react"; // 1. Importar useState e useEffect
import clsx from "clsx";
import { useEditorState } from "@tiptap/react";
import { useTiptapContext } from "../Provider";
import Tooltip from "../ui/Tooltip";
import Icon from "../ui/Icon";

const LanguageToolToggleButton = () => {
  const { editor, contentElement } = useTiptapContext();

  // 1. Buscamos o estado *real* do Tiptap (fonte da verdade)
  const tiptapState = useEditorState({
    editor,
    selector: (ctx) => {
      const storage = (ctx.editor.storage as any).languageTool;
      return {
        active: storage?.enabled ?? false,
        disabled: typeof ctx.editor.commands.setLanguageToolEnabled !== "function",
      };
    },
  });

  // 2. Criamos um estado *local* do React para a UI
  //    Este estado será atualizado IMEDIATAMENTE no clique.
  const [isActive, setIsActive] = useState(tiptapState.active);

  // 3. Sincronizamos o estado local se a fonte da verdade (Tiptap) mudar
  //    Isso garante que se algo *externo* mudar o estado, nosso botão reflita.
  useEffect(() => {
    setIsActive(tiptapState.active);
  }, [tiptapState.active]);

  // 4. O handleToggle agora atualiza o estado local (otimista)
  const handleToggle = useCallback(() => {
    if (tiptapState.disabled) { // Verificamos a desabilitação pelo Tiptap
      return;
    }

    // Invertemos o estado local
    const next = !isActive;

    // Atualizamos a UI do React *instantaneamente*
    setIsActive(next);

    // Mandamos o Tiptap fazer o trabalho dele em segundo plano
    editor.commands.setLanguageToolEnabled?.(next);

    // Não precisamos mais da transação falsa, pois o setIsActive já força o re-render

  }, [editor, isActive, tiptapState.disabled]); // Depende do 'isActive' local

  // 5. O resto do componente usa o estado local 'isActive' para a UI
  const tooltipLabel = isActive ? "Desativar verificador gramatical por IA" : "Ativar verificador gramatical por IA";
  const iconName = isActive ? "Check" : "Close";

  const button = (
    <button
      type="button"
      className={clsx("rte-toggle", isActive && "rte-toggle--active")} // Usa 'isActive'
      onClick={handleToggle}
      aria-pressed={isActive} // Usa 'isActive'
      aria-label={tooltipLabel}
      disabled={tiptapState.disabled} // Usa 'tiptapState.disabled'
    >
      <span className="rte-toggle__thumb">
        <Icon name={iconName} size={14} />
      </span>
    </button>
  );

  return (
    <div className="rte-toggle-group">
      <Tooltip
        content={tooltipLabel}
        options={{ collisionBoundary: contentElement.current?.parentElement }}
      >
        {button}
      </Tooltip>
      <span className="rte-toggle__label">Corretor ortográfico</span>
    </div>
  );
};

export default LanguageToolToggleButton;
