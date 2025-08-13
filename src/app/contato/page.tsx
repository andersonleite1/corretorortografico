import React from "react";

export const metadata = {
  title: "Contato | Editor de Texto Online",
  description: "Entre em contato com a equipe do Editor de Texto Online",
};

export default function ContatoPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Contato</h1>

      <p className="mb-6">
        Tem alguma dúvida, sugestão ou precisa de suporte? Preencha o formulário abaixo
        e responderemos o mais rápido possível.
      </p>

      <form className="space-y-6" action="#" method="POST">
        <div>
          <label htmlFor="nome" className="block mb-2 font-medium">
            Nome
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
            E-mail
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
            Mensagem
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
          Enviar Mensagem
        </button>
      </form>

      <div className="mt-12 text-gray-500 dark:text-gray-400 text-sm">
        <p>
          Você também pode entrar em contato diretamente pelo e-mail:{" "}
          <a href="mailto:contato@editordetexto.online" className="text-green-400 hover:underline">
            contato@editordetexto.online
          </a>
        </p>
      </div>
    </main>
  );
}
