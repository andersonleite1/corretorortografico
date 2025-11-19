"use client";
import React from "react";

import editorContent from "@/data/editorContent.json";
import EditForm from "./_components/EditForm";

import "./style.scss";
import AtalhosAccordion from "@/components/AtalhosAccordion/atalhos-accordion";

const { title, intro, sections, finalNote } = editorContent;

const faqItems = [
  {
    question: "O que é um editor de texto?",
    answer:
      "Um editor de texto é uma ferramenta essencial voltada para a criação e manipulação de arquivos simples (plain text). Diferente de processadores complexos, o foco aqui é a agilidade e a limpeza do código ou da escrita.",
  },
  {
    question: "Qual a diferença entre um editor de texto e o Word?",
    answer:
      "O Word é um processador completo voltado a layouts de impressão. Já um editor de texto puro é leve, carrega mais rápido e prioriza o conteúdo — ideal para rascunhos, anotações rápidas, limpeza de formatação ou códigos.",
  },
  {
    question: "Este editor de texto é gratuito?",
    answer:
      "Sim, o editordetexto.online é 100% gratuito. Você pode utilizar recursos de contagem de caracteres, formatação básica e download dos arquivos sem pagar nada e sem precisar de cadastro.",
  },
  {
    question: "Posso usar este editor de texto no celular?",
    answer:
      "Com certeza. A plataforma é otimizada para Android e iOS, permitindo digitar notas, listas ou textos acadêmicos direto no navegador com a agilidade de um app, porém sem ocupar memória.",
  },
];

export default function EditPage() {
  return (
    <div className="max-w-[56rem] w-full mx-auto py-10 px-3 md:px-6 sm:px-0">
      <EditForm />
      <section className="order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-3 sm:px-4 md:px-8 pt-0">
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

          <AtalhosAccordion />
      </section>
      <section
        id="faq"
        className="order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-3 sm:px-4 md:px-8 pt-7 pb-10"
        aria-labelledby="faq-heading"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        <div className="rounded-[2.5rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 px-4 py-8 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/40 sm:px-6 md:px-12">
          <div className="mx-auto max-w-3xl text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              FAQ
            </p>
            <h2 id="faq-heading" className="mt-2 text-3xl font-semibold">
              Dúvidas frequentes sobre o editor de texto online
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
              Encontre respostas rápidas sobre recursos, diferenciais e como usar o editor de forma produtiva em qualquer dispositivo.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl divide-y divide-slate-200 rounded-3xl border border-slate-100 bg-white/80 shadow-lg backdrop-blur-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/50">
            {faqItems.map(({ question, answer }, index) => (
              <details
                key={question}
                className="group relative"
                open={index === 0}
                itemProp="mainEntity"
                itemScope
                itemType="https://schema.org/Question"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-left text-lg font-medium text-slate-900 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 dark:text-slate-50 dark:hover:bg-slate-800/70">
                  <span itemProp="name">{question}</span>
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
                  <p itemProp="text">{answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
