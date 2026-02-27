"use client";

import dynamic from "next/dynamic";
import { HomeContent } from "@/data/home";
import { useSidebar } from "@/components/providers/SidebarProvider";
import clsx from "clsx";

import "./style.scss";
import LandingHero from "@/components/landing/LandingHero";
import LandingProblem from "@/components/landing/LandingProblem";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingCTA from "@/components/landing/LandingCTA";

const EditForm = dynamic(() => import("./_components/EditForm"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-6 order-2 min-w-full h-screen prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-4 md:px-8">
      <div className="h-6 w-24 bg-gray-100 dark:bg-gray-700 rounded mb-2" />
      <div className="w-full h-11 bg-gray-50 dark:bg-gray-700 rounded-md shadow border border-[#d1d9e0] dark:border-[#3d444d]" />
      <div className="flex flex-col gap-4">
        <div className="h-6 w-28 bg-gray-100 dark:bg-gray-700 rounded" />
        <div className="w-full rounded-md shadow border border-[#d1d9e0] dark:border-[#3d444d] bg-gray-50/70 dark:bg-[#111625] min-h-[480px]" />
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
      <EditForm locale={content.locale} userPlan={userPlan} />

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
