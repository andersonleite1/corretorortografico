import React from "react";

export const metadata = {
  title: "Política de Privacidade | Editor de Texto Online",
  description: "Política de Privacidade do Editor de Texto Online, em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>

      <p className="mb-4">
        No <strong>Editor de Texto Online</strong> (https://editordetexto.online/), sua
        privacidade é uma prioridade. Esta Política de Privacidade explica como coletamos,
        usamos e protegemos suas informações, em conformidade com a Lei Geral de Proteção de
        Dados (Lei nº 13.709/2018 - LGPD).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Informações coletadas</h2>
      <p className="mb-4">
        Nosso site não exige cadastro e não armazena o conteúdo digitado pelos usuários.
        Podemos coletar dados de forma automática, como endereço IP, tipo de navegador,
        páginas acessadas e tempo de permanência, para fins de análise e melhoria do serviço.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Uso das informações</h2>
      <p className="mb-4">Não vendemos, trocamos ou alugamos dados pessoais a terceiros.</p>
      <p className="mb-4">Podemos utilizar serviços de terceiros que processam informações técnicas de navegação, como:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Vercel (hospedagem e analytics).</li>
        <li>Cloudinary (armazenamento temporário de imagens enviadas pelo usuário, quando aplicável).</li>
        <li>Serviços de estatísticas/análises.</li>
      </ul>
      <p className="mb-4">Esses serviços seguem suas próprias políticas de privacidade.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Cookies</h2>
      <p className="mb-4">
        Utilizamos cookies para melhorar a navegação e personalizar a experiência. Você pode
        desativar os cookies nas configurações do seu navegador, mas isso pode limitar o uso
        de certas funcionalidades.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Compartilhamento de dados</h2>
      <p className="mb-4">
        Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto
        quando exigido por lei ou para cumprir obrigações legais.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Alterações nesta política</h2>
      <p className="mb-4">
        Podemos atualizar esta Política de Privacidade periodicamente. A data da última
        atualização será sempre indicada no início do documento.
      </p>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
        Última atualização: 13 de agosto de 2025
      </p>
    </main>
  );
}
