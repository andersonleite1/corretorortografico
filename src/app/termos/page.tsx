import React from "react";

export const metadata = {
  title: "Termos de Uso | Editor de Texto Online",
  description: "Termos e condições de uso do Editor de Texto Online.",
};

export default function TermosPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Termos de Uso</h1>

      <p className="mb-4">
        Bem-vindo ao <strong>Editor de Texto Online</strong>. Ao acessar e utilizar este
        site, você concorda com os presentes Termos de Uso. Caso não concorde, recomendamos
        que não utilize nossa plataforma.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Uso permitido</h2>
      <p className="mb-4">
        Este site é destinado para uso pessoal e profissional, sem necessidade de cadastro.
        É proibido utilizá-lo para qualquer finalidade ilegal ou que viole direitos de
        terceiros.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Propriedade intelectual</h2>
      <p className="mb-4">
        Todo o conteúdo, design, logotipo e funcionalidades do site são de propriedade do
        Editor de Texto Online, protegidos por leis de direitos autorais e propriedade
        intelectual.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Isenção de responsabilidade</h2>
      <p className="mb-4">
        O conteúdo digitado no editor não é armazenado em nossos servidores. O usuário é
        responsável por salvar e gerenciar seus próprios textos.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Alterações nos termos</h2>
      <p className="mb-4">
        Podemos modificar estes Termos de Uso a qualquer momento. O uso contínuo do site após
        alterações significa que você aceita os novos termos.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Contato</h2>
      <p className="mb-4">
        Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail:
        <a
          href="mailto:contato@editordetexto.online"
          className="text-blue-500 hover:underline"
        >
          {" "}
          contato@editordetexto.online
        </a>
        .
      </p>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
        Última atualização: 13 de agosto de 2025
      </p>
    </main>
  );
}
