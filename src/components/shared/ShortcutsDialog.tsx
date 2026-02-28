import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../TiptapEditor/components/ui/Icon";
import Dialog from "../TiptapEditor/components/ui/Dialog";

type Tab = "arquivo" | "formatacao" | "paragrafo" | "insercao" | "revisao";

interface ShortcutEntry {
  label: string;
  keys: string[];
  note?: string;
}

/** Detects macOS to decide whether to show ⌘ or Ctrl */
function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

/** Translates a key token into a readable label */
function renderKey(key: string, mac: boolean): string {
  switch (key) {
    case "Ctrl":
      return mac ? "⌘" : "ctrl";
    case "Shift":
      return "⇧";
    case "Alt":
      return mac ? "⌥" : "alt";
    case "Delete":
      return "del";
    case "Backspace":
      return "⌫";
    case "Enter":
      return "↵";
    default:
      return key.toLowerCase();
  }
}

const Kbd = ({ keys }: { keys: string[] }) => {
  const mac = isMac();
  return (
    <span className="flex items-center gap-1 flex-shrink-0">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 text-[12px] font-bold bg-white dark:bg-white/10 border-b-[3px] border-gray-200 dark:border-black/50 rounded-lg shadow-sm text-gray-700 dark:text-gray-200 font-sans tracking-tight">
            {renderKey(key, mac)}
          </kbd>
          {i < keys.length - 1 && (
            <span className="text-gray-300 dark:text-gray-600 font-bold">
              +
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

const ShortcutRow = ({ shortcut }: { shortcut: ShortcutEntry }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between gap-4 py-3 px-4 border-b border-gray-50 dark:border-white/5 last:border-0 group hover:bg-gray-50/80 dark:hover:bg-white/5 rounded-2xl transition-all"
  >
    <div className="flex-1 min-w-0">
      <span className="text-[15px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {shortcut.label}
      </span>
      {shortcut.note && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mt-0.5">
          {shortcut.note}
        </p>
      )}
    </div>
    <Kbd keys={shortcut.keys} />
  </motion.div>
);

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "arquivo", label: "Arquivo", icon: "Save" },
  { id: "formatacao", label: "Formatação", icon: "Bold" },
  { id: "paragrafo", label: "Parágrafo", icon: "AlignLeft" },
  { id: "insercao", label: "Inserção", icon: "Plus" },
  { id: "revisao", label: "Revisão", icon: "CheckboxChecked" },
];

const SHORTCUTS: Record<Tab, ShortcutEntry[]> = {
  arquivo: [
    { label: "Desfazer", keys: ["Ctrl", "Z"] },
    { label: "Refazer", keys: ["Ctrl", "Y"] },
    { label: "Salvar Documento", keys: ["Ctrl", "S"] },
    { label: "Rascunhos", keys: ["Ctrl", "Shift", "S"] },
    { label: "Meus Documentos", keys: ["Ctrl", "O"] },
    { label: "Copiar Tudo", keys: ["Ctrl", "Shift", "C"] },
    { label: "Limpar Editor", keys: ["Ctrl", "Shift", "Delete"] },
    {
      label: "Importar PDF",
      keys: ["Ctrl", "Shift", "I"],
      note: "Pode conflitar com DevTools",
    },
    { label: "Exportar", keys: ["Ctrl", "P"] },
    { label: "Pré-visualizar", keys: ["Ctrl", "Shift", "P"] },
    { label: "Configurações", keys: ["Ctrl", ","] },
    { label: "Reescrever com IA", keys: ["Ctrl", "J"] },
  ],
  formatacao: [
    { label: "Negrito", keys: ["Ctrl", "B"] },
    { label: "Itálico", keys: ["Ctrl", "I"] },
    { label: "Sublinhado", keys: ["Ctrl", "U"] },
    { label: "Tachado", keys: ["Ctrl", "Shift", "X"] },
    { label: "Código Inline", keys: ["Ctrl", "E"] },
    { label: "Subscrito", keys: ["Ctrl", "="] },
    { label: "Sobrescrito", keys: ["Ctrl", "Shift", "+"] },
    { label: "Cor de Fundo (Highlight)", keys: ["Ctrl", "Shift", "H"] },
    { label: "Limpar Formatação", keys: ["Ctrl", "\\"] },
  ],
  paragrafo: [
    { label: "Título H1", keys: ["Ctrl", "Alt", "1"] },
    { label: "Título H2", keys: ["Ctrl", "Alt", "2"] },
    { label: "Título H3", keys: ["Ctrl", "Alt", "3"] },
    { label: "Título H4", keys: ["Ctrl", "Alt", "4"] },
    { label: "Título H5", keys: ["Ctrl", "Alt", "5"] },
    { label: "Título H6", keys: ["Ctrl", "Alt", "6"] },
    { label: "Alinhar à Esquerda", keys: ["Ctrl", "Shift", "L"] },
    { label: "Centralizar", keys: ["Ctrl", "Shift", "E"] },
    { label: "Alinhar à Direita", keys: ["Ctrl", "Shift", "R"] },
    { label: "Justificar", keys: ["Ctrl", "Shift", "J"] },
    { label: "Lista com Marcadores", keys: ["Ctrl", "Shift", "8"] },
    { label: "Lista Numerada", keys: ["Ctrl", "Shift", "7"] },
    { label: "Bloco de Citação", keys: ["Ctrl", "Shift", "9"] },
  ],
  insercao: [
    { label: "Inserir Link", keys: ["Ctrl", "K"] },
    { label: "Inserir Imagem", keys: ["Ctrl", "Alt", "I"] },
    { label: "Inserir Tabela", keys: ["Ctrl", "Alt", "T"] },
    { label: "Bloco de Código", keys: ["Ctrl", "Alt", "C"] },
  ],
  revisao: [
    { label: "Verificação Gramatical (Toggle)", keys: ["F7"] },
    { label: "Painel de Verificação Gramatical", keys: ["Shift", "F7"] },
  ],
};

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsDialog = ({ isOpen, onClose }: ShortcutsDialogProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("arquivo");
  const mac = useMemo(() => isMac(), []);

  const modKey = mac ? "⌘" : "ctrl";

  /** Replace "Ctrl" display token with platform key in rendered rows */
  const resolvedShortcuts = SHORTCUTS[activeTab].map((s) => ({
    ...s,
    keys: s.keys.map((k) => (k === "Ctrl" ? modKey : k)),
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <div className="w-full max-w-4xl flex flex-col md:flex-row relative outline-none">
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-gray-50/50 dark:bg-black/20 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 flex flex-col">
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Icon name="Keyboard" size={20} className="text-white" />
              </div>
              Atalhos
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-widest leading-relaxed">
              {mac ? "Padrão macOS (⌘/⌥)" : "Padrão Windows/Linux (ctrl/alt)"}
            </p>
          </div>

          <nav className="flex-1 px-4 pb-8 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all relative ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25 active:scale-95"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <Icon name={tab.icon as any} size={18} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicatorShortcuts"
                    className="absolute inset-0 bg-blue-500 rounded-2xl -z-10"
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#1c1c1e]">
          <div className="flex-1 p-8 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                {resolvedShortcuts.map((shortcut, i) => (
                  <ShortcutRow key={i} shortcut={shortcut} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/10 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 italic">
              Inspirado em Google Docs & Word
            </p>
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-bold rounded-full hover:opacity-90 transition-opacity active:scale-95"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ShortcutsDialog;
