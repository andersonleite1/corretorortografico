"use client";
import React from "react";

import editorContent from "@/data/editorContent.json";
import EditForm from "./_components/EditForm";

import "./style.scss";
import AtalhosAccordion from "@/components/AtalhosAccordion/atalhos-accordion";

const { title, intro, sections, finalNote } = editorContent;

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
      <section id="faq" className="order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-3 sm:px-4 md:px-8 mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dúvidas frequentes sobre nosso Editor de Texto</h2>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">O que é um editor de texto?</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">Um editor de texto  é uma ferramenta essencial voltada para a criação e manipulação de arquivos de texto simples (plain text). Diferente de processadores complexos, o foco aqui é a agilidade e a limpeza do código ou da escrita. Nosso editor de texto  online permite que você digite, copie, cole e formate suas ideias instantaneamente, funcionando como um bloco de notas  digital aprimorado, sem a necessidade de baixar programas pesados.</p>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Qual a diferença entre um editor de texto e o Word?</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">O Word é um processador de documentos focado em layouts complexos para impressão. Já um editor de texto  puro foca no conteúdo. Ele é mais leve, carrega mais rápido e é ideal para rascunhos, anotações rápidas, limpeza de formatação ou códigos de programação. Se você precisa apenas escrever ou editar texto  sem distrações e menus complicados, esta ferramenta online é a melhor escolha.</p>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Este editor de texto é gratuito?</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">Sim, o editordetexto.online  é uma ferramenta 100% gratuita. Nossa missão é oferecer um editor de texto simples  e acessível a qualquer momento. Você pode utilizar todos os recursos de contagem de caracteres, formatação básica e download do arquivo sem pagar nada e sem precisar fazer cadastro.</p>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Posso usar este editor de texto no celular?</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">Com certeza. Nossa plataforma foi otimizada para funcionar perfeitamente como um editor de texto mobile . Seja no Android ou no iPhone (iOS), você consegue digitar suas notas, listas ou textos acadêmicos diretamente pelo navegador do celular, com a mesma eficiência de um aplicativo, mas sem ocupar memória do seu aparelho.</p>
      </section>
    </div>
  );
}
