import { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildContactMetadata, getContactContent } from "@/data/pages/contact";
import { i18n, Locale } from "../../../../i18n-config";

type PageParams = {
  params: { locale: Locale };
};

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  if (!i18n.locales.includes(params.locale)) {
    return buildContactMetadata(i18n.defaultLocale);
  }

  return buildContactMetadata(params.locale);
}

export default function ContactPage({ params }: PageParams) {
  const { locale } = params;

  if (!i18n.locales.includes(locale)) {
    notFound();
  }

  const content = getContactContent(locale);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">{content.title}</h1>
      <p className="mb-6">{content.description}</p>

      <form className="space-y-6" action="#" method="POST">
        <div>
          <label htmlFor="nome" className="block mb-2 font-medium">
            {content.form.nameLabel}
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-2 font-medium">
            {content.form.emailLabel}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="mensagem" className="block mb-2 font-medium">
            {content.form.messageLabel}
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            rows={6}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {content.form.submitLabel}
        </button>
      </form>

      <div className="mt-12 text-gray-500 dark:text-gray-400 text-sm">
        <p>
          {content.altContactPrefix}{" "}
          <a href="mailto:contato@editordetexto.online" className="text-green-400 hover:underline">
            {content.altContactEmailLabel}
          </a>
        </p>
      </div>
    </main>
  );
}
