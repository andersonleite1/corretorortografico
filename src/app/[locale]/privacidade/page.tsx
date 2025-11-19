import { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildPrivacyMetadata, getPrivacyContent } from "@/data/pages/privacy";
import { i18n, Locale } from "../../../../i18n-config";

type PageParams = {
  params: { locale: Locale };
};

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  if (!i18n.locales.includes(params.locale)) {
    return buildPrivacyMetadata(i18n.defaultLocale);
  }

  return buildPrivacyMetadata(params.locale);
}

export default function PrivacyPolicyPage({ params }: PageParams) {
  const { locale } = params;

  if (!i18n.locales.includes(locale)) {
    notFound();
  }

  const content = getPrivacyContent(locale);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">{content.title}</h1>

      <p
        className="mb-4"
        dangerouslySetInnerHTML={{
          __html: content.introHtml,
        }}
      />

      {content.sections.map((section) => (
        <section key={section.title} className="mt-8">
          <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={`${section.title}-paragraph-${index}`} className="mb-4">
              {paragraph}
            </p>
          ))}
          {section.list && (
            <ul className="list-disc list-inside mb-4">
              {section.list.map((item, index) => (
                <li key={`${section.title}-list-${index}`}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
        {content.lastUpdatedLabel}: {content.lastUpdatedValue}
      </p>
    </main>
  );
}
