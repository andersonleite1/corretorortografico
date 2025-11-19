"use client";

import { getEditMessages } from "@/data/edit/messages";
import { type Locale } from "../../../i18n-config";

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

type Props = {
  locale: Locale;
};

export default function AtalhosAccordion({ locale }: Props) {
  const { shortcuts } = getEditMessages(locale);

  return (
    <section
      aria-label={shortcuts.ariaLabel}
      className="mt-10 w-full text-slate-700 dark:text-slate-100"
    >
      <div className="rounded-[2.5rem] border border-slate-200 bg-white/95 px-5 py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              {shortcuts.eyebrow}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {shortcuts.description}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {shortcuts.sections.map((section) => (
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
                          {shortcuts.windowsLabel}
                        </span>
                        <div className="flex flex-wrap gap-1">{renderShortcut(windows)}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold uppercase tracking-[0.2em] text-[11px] text-slate-400 dark:text-slate-500">
                          {shortcuts.macLabel}
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
