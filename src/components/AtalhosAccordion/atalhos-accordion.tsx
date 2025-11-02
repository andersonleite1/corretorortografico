"use client";

import React from "react";
import clsx from "clsx";

type Shortcut = {
  command: string;
  windows: string;
  mac: string;
};

const sections: Array<{
  id: string;
  title: string;
  shortcuts: Shortcut[];
}> = [
  {
    id: "fundamentos",
    title: "Fundamentos de comandos",
    shortcuts: [
      { command: "Copiar", windows: "Ctrl + C", mac: "Cmd + C" },
      { command: "Recortar", windows: "Ctrl + X", mac: "Cmd + X" },
      { command: "Colar", windows: "Ctrl + V", mac: "Cmd + V" },
      {
        command: "Colar sem formatação",
        windows: "Ctrl + Shift + V",
        mac: "Cmd + Shift + V",
      },
      { command: "Desfazer", windows: "Ctrl + Z", mac: "Cmd + Z" },
      { command: "Refazer", windows: "Ctrl + Shift + Z", mac: "Cmd + Shift + Z" },
      {
        command: "Adicionar quebra de linha",
        windows: "Shift + Enter",
        mac: "Shift + Enter",
      },
    ],
  },
  {
    id: "formatacao",
    title: "Formatação de texto",
    shortcuts: [
      { command: "Negrito", windows: "Ctrl + B", mac: "Cmd + B" },
      { command: "Itálico", windows: "Ctrl + I", mac: "Cmd + I" },
      { command: "Sublinhado", windows: "Ctrl + U", mac: "Cmd + U" },
      { command: "Tachado", windows: "Ctrl + Shift + S", mac: "Cmd + Shift + S" },
      { command: "Destaque", windows: "Ctrl + Shift + H", mac: "Cmd + Shift + H" },
      { command: "Código", windows: "Ctrl + E", mac: "" },
    ],
  },
];

function renderShortcut(shortcut: string) {
  if (!shortcut) {
    return <span className="text-xs text-slate-400 dark:text-slate-500">—</span>;
  }

  return shortcut.split(" + ").map((key, index) => (
    <kbd
      key={`${key}-${index}`}
      className="rounded-md bg-slate-200/80 px-2 py-1 font-mono text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
    >
      {key}
    </kbd>
  ));
}

export default function AtalhosAccordion() {
  const [openIndex, setOpenIndex] = React.useState<number>(0);

  const toggleSection = (index: number) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section
      aria-label="Atalhos do teclado"
      className="mt-10 w-full text-slate-700 dark:text-slate-100"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
        Atalhos do teclado
      </h3>

      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {sections.map((section, index) => {
          const isOpen = openIndex === index;
          const headingId = `atalhos-heading-${section.id}`;
          const panelId = `atalhos-panel-${section.id}`;

          return (
            <div
              key={section.id}
              className={clsx(
                "divide-y divide-transparent dark:divide-transparent",
                index !== sections.length - 1 &&
                  "border-b border-slate-200 dark:border-slate-800/60"
              )}
            >
              <button
                type="button"
                id={headingId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => toggleSection(index)}
                className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:text-slate-100 dark:hover:bg-slate-800/60"
              >
                {section.title}
                <svg
                  className={clsx(
                    "h-4 w-4 text-slate-500 transition-transform duration-200 dark:text-slate-300",
                    isOpen ? "rotate-180" : "rotate-0"
                  )}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 8l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={headingId}
                className={clsx(
                  "bg-slate-50 px-6 pb-6 pt-2 text-sm text-slate-600 transition-all dark:bg-slate-900 dark:text-slate-200",
                  !isOpen && "hidden"
                )}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <th className="px-2 py-2 font-semibold">Comando</th>
                        <th className="px-2 py-2 font-semibold">Windows / Linux</th>
                        <th className="px-2 py-2 font-semibold">macOS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700 dark:divide-slate-800 dark:text-slate-100">
                      {section.shortcuts.map(({ command, windows, mac }) => (
                        <tr
                          key={command}
                          className="align-top transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                        >
                          <td className="px-2 py-2 font-medium">{command}</td>
                          <td className="px-2 py-2">
                            <div className="flex flex-wrap items-center gap-1">
                              {renderShortcut(windows)}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex flex-wrap items-center gap-1">
                              {renderShortcut(mac)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
