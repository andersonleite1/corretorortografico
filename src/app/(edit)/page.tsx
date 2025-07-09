"use client";


import editorContent from "@/data/editorContent.json";
import EditForm from "./_components/EditForm";

import "./style.scss";

const { title, intro, sections, finalNote } = editorContent;

export default function EditPage() {
  return (
    <div className="max-w-[56rem] w-full mx-auto py-10 px-6">
      <EditForm />
      <section className="order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-4 md:px-8 pt-7">
          <h1 className="text-4xl font-semibold text-center text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          <p
            className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: intro.text }}
          ></p>

          {sections.map((section, index) => (
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
            dangerouslySetInnerHTML={{ __html: finalNote }}
          ></p>
        </section>
    </div>
  );
}
