"use client";

import EditForm from "./_components/EditForm";
import AtalhosAccordion from "@/components/AtalhosAccordion/atalhos-accordion";
import { HomeContent } from "@/data/home";
import { SidebarCarousel } from "@/components/SidebarCarousel/SidebarCarousel";
import { ProductData } from "@/services/productMetadata";

import "./style.scss";

type Props = {
  content: HomeContent;
  mobileProducts?: ProductData[];
  mobileOthersProducts?: ProductData[];
};

export default function EditPageContent({
  content,
  mobileProducts,
  mobileOthersProducts,
}: Props) {
  const { article, faq } = content;

  return (
    <div className="max-w-[56rem] w-full mx-auto py-10 px-3 md:px-6 sm:px-0">
      <EditForm locale={content.locale} />
      {mobileProducts?.length ? (
        <div className="mt-4 w-full xl:hidden mb-6">
          <SidebarCarousel
            products={mobileProducts}
            className="px-1 sm:px-0"
            variant="mobile"
          />
        </div>
      ) : null}
      <section className="order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-3 sm:px-4 md:px-8 pt-0 pb-4">
        <h1 className="text-4xl font-semibold text-center text-gray-900 dark:text-gray-100">
          {article.title}
        </h1>
        <p
          className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.introHtml }}
        ></p>

        {article.sections.map((section, index) => (
          <div key={index}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {section.title}
            </h2>
            {section.description && (
              <p
                className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.description }}
              ></p>
            )}
            {section.points && (
              <ul className="space-y-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
                {section.points.map((point, i) =>
                  typeof point === "string" ? (
                    <li key={i}>{point}</li>
                  ) : (
                    <li key={i}>
                      <strong>{point.highlight}</strong> {point.text}
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        ))}
        <p
          className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.finalNoteHtml }}
        ></p>

        {mobileOthersProducts?.length ? (
          <div className="mt-4 w-full xl:hidden mb-6">
            <SidebarCarousel
              products={mobileOthersProducts}
              className="px-1 sm:px-0"
              variant="mobile"
            />
          </div>
        ) : null}

        <AtalhosAccordion locale={content.locale} />
      </section>
      <section
        id="faq"
        className="order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-3 sm:px-4 md:px-8 mt-0 py-6"
        aria-labelledby="faq-heading"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        <div className="rounded-[2.5rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 px-4 py-8 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/40 sm:px-6 md:px-12">
          <div className="mx-auto max-w-3xl text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              {faq.label}
            </p>
            <h2 id="faq-heading" className="mt-2 text-3xl font-semibold">
              {faq.heading}
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
              {faq.description}
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl divide-y divide-slate-200 rounded-3xl border border-slate-100 bg-white/80 shadow-lg backdrop-blur-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/50">
            {faq.items.map((item, index) => (
              <details
                key={item.question}
                className="group relative"
                open={index === 0}
                itemProp="mainEntity"
                itemScope
                itemType="https://schema.org/Question"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-left text-lg font-medium text-slate-900 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 dark:text-slate-50 dark:hover:bg-slate-800/70">
                  <span itemProp="name">{item.question}</span>
                  <span className="text-slate-400 transition-transform group-open:-rotate-180 dark:text-slate-500">
                    <svg
                      className="h-5 w-5"
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
                  </span>
                </summary>
                <div
                  className="px-6 pb-6 text-base text-slate-600 dark:text-slate-300"
                  itemProp="acceptedAnswer"
                  itemScope
                  itemType="https://schema.org/Answer"
                >
                  <p itemProp="text">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
