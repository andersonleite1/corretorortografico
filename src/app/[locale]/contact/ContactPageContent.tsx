import {BackHomeButton} from "@/components/shared/BackHomeButton";
import {getContactContent} from "@/data/pages/contact";
import {Locale} from "../../../../i18n-config";

type ContactPageContentProps = {
  locale: Locale;
};

export default function ContactPageContent({locale}: ContactPageContentProps) {
  const content = getContactContent(locale);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 text-slate-900 dark:text-slate-100">
      <BackHomeButton locale={locale} className="self-start" />
      <header className="text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">
          {content.title}
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">
          {content.heroTitle}
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
          {content.description}
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-[minmax(0,1fr),24rem]">
        <form
          className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
          action="#"
          method="POST"
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="nome" className="mb-2 block text-sm font-medium">
                {content.form.nameLabel}
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-white dark:focus:border-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                {content.form.emailLabel}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-white dark:focus:border-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="mensagem" className="mb-2 block text-sm font-medium">
                {content.form.messageLabel}
              </label>
              <textarea
                id="mensagem"
                name="mensagem"
                rows={6}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700"
          >
            {content.form.submitLabel}
          </button>
        </form>

        <aside className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-900/40">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              {content.title}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
              {content.heroSubtitle}
            </h2>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              {content.altContactPrefix}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-50">
            <p className="text-xs uppercase tracking-[0.3em]">Email</p>
            <a
              href="mailto:contato@editordetexto.online"
              className="mt-2 inline-flex items-center gap-2 text-lg font-semibold hover:underline"
            >
              {content.altContactEmailLabel}
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
