"use client";

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
      className="rounded-md bg-slate-200/80 px-2 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200"
    >
      {key}
    </kbd>
  ));
}

export default function AtalhosAccordion() {
  return (
    <section
      aria-label="Atalhos do teclado"
      className="mt-10 w-full text-slate-700 dark:text-slate-100"
    >
      <div className="rounded-[2.5rem] border border-slate-200 bg-white/95 px-5 py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              Atalhos do teclado
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Comandos rápidos para editar sem tirar as mãos do teclado.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.id}
              className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                {section.title}
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {section.shortcuts.map(({ command, windows, mac }) => (
                  <li
                    key={command}
                    className="rounded-lg border border-slate-100/80 px-3 py-2 dark:border-slate-800/80"
                  >
                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                      {command}
                    </p>
                    <div className="mt-1 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold uppercase tracking-[0.2em] text-[11px] text-slate-400 dark:text-slate-500">
                          Win / Linux
                        </span>
                        <div className="flex flex-wrap gap-1">{renderShortcut(windows)}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold uppercase tracking-[0.2em] text-[11px] text-slate-400 dark:text-slate-500">
                          macOS
                        </span>
                        <div className="flex flex-wrap gap-1">{renderShortcut(mac)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
