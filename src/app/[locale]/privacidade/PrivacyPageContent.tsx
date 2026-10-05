import { PublicContactEmail } from "@/components/shared/PublicContactEmail";
import { BackHomeButton } from "@/components/shared/BackHomeButton";
import { getPrivacyContent } from "@/data/pages/privacy";
import { Locale } from "../../../../i18n-config";

type PrivacyPageContentProps = {
  locale: Locale;
};

export default function PrivacyPageContent({
  locale,
}: PrivacyPageContentProps) {
  const content = getPrivacyContent(locale);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 text-slate-900 dark:text-slate-100">
      <BackHomeButton locale={locale} className="self-start" />
      <header className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">
          {content.title}
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">
          {content.title}
        </h1>
        <p
          className="mt-4 text-base text-slate-600 dark:text-slate-300"
          dangerouslySetInnerHTML={{
            __html: content.introHtml,
          }}
        />
      </header>

      <section className="space-y-6">
        {content.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-base text-slate-600 dark:text-slate-300">
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.title}-paragraph-${index}`}>
                  {paragraph === "contato@editordetexto.online" ? (
                    <PublicContactEmail className="hover:underline" />
                  ) : (
                    paragraph
                  )}
                </p>
              ))}
              {section.list && (
                <ul className="list-disc space-y-2 pl-5">
                  {section.list.map((item, index) => (
                    <li key={`${section.title}-list-${index}`}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </section>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <p>
          {content.lastUpdatedLabel}:{" "}
          <strong>{content.lastUpdatedValue}</strong>
        </p>
      </footer>
    </main>
  );
}
