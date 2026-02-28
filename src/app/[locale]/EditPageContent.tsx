"use client";

import dynamic from "next/dynamic";
import { HomeContent } from "@/data/home";
import { useSidebar } from "@/components/providers/SidebarProvider";
import clsx from "clsx";

import "./style.scss";
import LandingHero from "@/components/landing/LandingHero";
const LandingProblem = dynamic(
  () => import("@/components/landing/LandingProblem"),
  {
    ssr: true,
  },
);
const LandingFeatures = dynamic(
  () => import("@/components/landing/LandingFeatures"),
  {
    ssr: true,
  },
);
const LandingPricing = dynamic(
  () => import("@/components/landing/LandingPricing"),
  {
    ssr: true,
  },
);
const LandingCTA = dynamic(() => import("@/components/landing/LandingCTA"), {
  ssr: true,
});

const EditForm = dynamic(() => import("./_components/EditForm"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-6 order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-2 md:px-8 sm:px-0 animate-pulse">
      {/* Title input */}
      <div className="w-full h-[50px] bg-gray-100 dark:bg-gray-700/60 rounded-full shadow border border-[#d1d9e0] dark:border-[#3d444d]" />

      {/* Editor container */}
      <div className="w-full rounded-[2rem] border border-[#d1d9e0] dark:border-[#3d444d] bg-white dark:bg-[#0d1017] shadow-sm overflow-hidden">
        {/* Toolbar row 1 */}
        <div className="h-[44px] border-b border-[#d1d9e0] dark:border-[#3d444d] px-3 flex items-center gap-2">
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="ml-auto h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {/* Toolbar row 2 */}
        <div className="h-[40px] border-b border-[#d1d9e0] dark:border-[#3d444d] px-3 flex items-center gap-2">
          <span className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <span className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <span className="ml-auto h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {/* Toolbar row 3 */}
        <div className="h-[40px] border-b border-[#d1d9e0] dark:border-[#3d444d] px-3 flex items-center gap-2">
          <span className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="ml-auto h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        {/* Body: text area + sidebar */}
        <div className="flex">
          <div className="flex-1 min-h-[320px] p-5">
            <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
            <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
            <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
          </div>
          <div className="hidden md:flex flex-col w-[319px] border-l border-[#d1d9e0] dark:border-[#3d444d] p-4 gap-4">
            <div className="flex gap-3 border-b border-[#d1d9e0] dark:border-[#3d444d] pb-3">
              <span className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <span className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <span className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <span className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <span className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="h-14 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
              <div className="h-14 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
              <div className="h-14 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
              <div className="h-14 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
            </div>
            <div className="mt-auto h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
        {/* Footer */}
        <div className="border-t border-[#d1d9e0] dark:border-[#3d444d] px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-4 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-4 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <span className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      {/* "Reportar Problema" button */}
      <div className="flex justify-center pb-2">
        <span className="h-9 w-40 bg-gray-100 dark:bg-gray-700/50 rounded-full border border-gray-200 dark:border-white/10" />
      </div>
    </div>
  ),
});

type Props = {
  content: HomeContent;
  userPlan: "free" | "pro" | "team";
};

export default function EditPageContent({ content, userPlan }: Props) {
  const { article, faq } = content;
  const { isSidebarOpen, isLTSidebarOpen } = useSidebar();

  // Base width: 56rem (896px)
  // Left Sidebar: 260px (16.25rem)
  // Right Sidebar: 320px (20rem)
  let maxWidthClass = "max-w-[56rem]";
  if (isSidebarOpen && isLTSidebarOpen) {
    maxWidthClass = "max-w-[92.25rem]";
  } else if (isSidebarOpen) {
    maxWidthClass = "max-w-[72.25rem]";
  } else if (isLTSidebarOpen) {
    maxWidthClass = "max-w-[76rem]";
  }

  return (
    <div
      className={clsx(
        "w-full mx-auto py-10 px-3 md:px-6 sm:px-0 transition-all duration-300 ease-in-out",
        maxWidthClass,
      )}
    >
      {/* ── Editor ─────────────────────────────────────────────────────────── */}
      <div className="landing-editor-section">
        <EditForm locale={content.locale} userPlan={userPlan} />
      </div>

      {/* ── New landing sections ────────────────────────────────────────────── */}
      {content.hero && <LandingHero data={content.hero} />}
      {content.problem && <LandingProblem data={content.problem} />}
      {content.features && <LandingFeatures data={content.features} />}
      {content.pricing && <LandingPricing data={content.pricing} />}

      {/* ── SEO Article ─────────────────────────────────────────────────────── */}
      <section className="landing-article" aria-labelledby="article-heading">
        <div className="landing-article__inner">
          <h1 id="article-heading" className="landing-article__title">
            {article.title}
          </h1>
          <p
            className="landing-article__intro"
            dangerouslySetInnerHTML={{ __html: article.introHtml }}
          />

          <div className="landing-article__grid">
            {article.sections.map((section, index) => (
              <div key={index} className="landing-article__card">
                <h2 className="landing-article__card-title">{section.title}</h2>
                {section.description && (
                  <p
                    className="landing-article__card-desc"
                    dangerouslySetInnerHTML={{ __html: section.description }}
                  />
                )}
                {section.points && (
                  <ul className="landing-article__list">
                    {section.points.map((point, i) =>
                      typeof point === "string" ? (
                        <li key={i} className="landing-article__list-item">
                          {point}
                        </li>
                      ) : (
                        <li key={i} className="landing-article__list-item">
                          <strong>{point.highlight}</strong> {point.text}
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <p
            className="landing-article__closing"
            dangerouslySetInnerHTML={{ __html: article.finalNoteHtml }}
          />
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="landing-faq"
        aria-labelledby="faq-heading"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        <div className="landing-faq__inner">
          <div className="landing-faq__header">
            <p className="landing-faq__eyebrow">{faq.label}</p>
            <h2 id="faq-heading" className="landing-faq__heading">
              {faq.heading}
            </h2>
            <p className="landing-faq__description">{faq.description}</p>
          </div>

          <div className="landing-faq__list">
            {faq.items.map((item, index) => (
              <details
                key={item.question}
                className="landing-faq__item"
                open={index === 0}
                itemProp="mainEntity"
                itemScope
                itemType="https://schema.org/Question"
              >
                <summary className="landing-faq__summary">
                  <span itemProp="name">{item.question}</span>
                  <svg
                    className="landing-faq__chevron"
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
                </summary>
                <div
                  className="landing-faq__answer"
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

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      {content.cta && <LandingCTA data={content.cta} />}
    </div>
  );
}
