import {Metadata} from "next";
import {notFound} from "next/navigation";

import {buildAboutMetadata, getAboutContent} from "@/data/pages/about";
import {i18n, Locale} from "../../../../i18n-config";

type PageParams = {
  params: {locale: Locale};
};

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({locale}));
}

export function generateMetadata({params}: PageParams): Metadata {
  if (!i18n.locales.includes(params.locale)) {
    return buildAboutMetadata(i18n.defaultLocale);
  }

  return buildAboutMetadata(params.locale);
}

export default function AboutPage({params}: PageParams) {
  const {locale} = params;

  if (!i18n.locales.includes(locale)) {
    notFound();
  }

  const content = getAboutContent(locale);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 text-slate-900 dark:text-slate-100">
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">
          {content.hero.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">
          {content.hero.title}
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          {content.hero.subtitle}
        </p>
      </header>

      <section className="space-y-6">
        {content.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
          >
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {section.title}
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              {section.description}
            </p>
            {section.items && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-300">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-8 text-emerald-900 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-50">
        <h3 className="text-2xl font-semibold">{content.closing.title}</h3>
        <p className="mt-3 text-base">{content.closing.description}</p>
      </section>
    </main>
  );
}
