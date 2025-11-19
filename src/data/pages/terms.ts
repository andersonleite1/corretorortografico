import { Metadata } from "next";

import { i18n, Locale } from "../../../i18n-config";

export type TermsSection = {
  title: string;
  paragraphs: string[];
};

export type TermsPageContent = {
  locale: Locale;
  metadata: {
    title: string;
    description: string;
  };
  title: string;
  introHtml: string;
  sections: TermsSection[];
  contactHtml: string;
  lastUpdatedLabel: string;
  lastUpdatedValue: string;
};

const termsContentMap: Record<Locale, TermsPageContent> = {
  pt: {
    locale: "pt",
    metadata: {
      title: "Termos de Uso | Editor de Texto Online",
      description: "Termos e condições de uso do Editor de Texto Online.",
    },
    title: "Termos de Uso",
    introHtml:
      "Bem-vindo ao <strong>Editor de Texto Online</strong>. Ao acessar e utilizar este site, você concorda com os presentes Termos de Uso. Caso não concorde, recomendamos que não utilize nossa plataforma.",
    sections: [
      {
        title: "1. Uso permitido",
        paragraphs: [
          "Este site é destinado para uso pessoal e profissional, sem necessidade de cadastro. É proibido utilizá-lo para qualquer finalidade ilegal ou que viole direitos de terceiros.",
        ],
      },
      {
        title: "2. Propriedade intelectual",
        paragraphs: [
          "Todo o conteúdo, design, logotipo e funcionalidades do site são de propriedade do Editor de Texto Online, protegidos por leis de direitos autorais e propriedade intelectual.",
        ],
      },
      {
        title: "3. Isenção de responsabilidade",
        paragraphs: [
          "O conteúdo digitado no editor não é armazenado em nossos servidores. O usuário é responsável por salvar e gerenciar seus próprios textos.",
        ],
      },
      {
        title: "4. Alterações nos termos",
        paragraphs: [
          "Podemos modificar estes Termos de Uso a qualquer momento. O uso contínuo do site após alterações significa que você aceita os novos termos.",
        ],
      },
    ],
    contactHtml:
      'Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail: <a href="mailto:contato@editordetexto.online" class="text-blue-500 hover:underline">contato@editordetexto.online</a>.',
    lastUpdatedLabel: "Última atualização",
    lastUpdatedValue: "13 de agosto de 2025",
  },
  en: {
    locale: "en",
    metadata: {
      title: "Terms of Use | Online Text Editor",
      description: "Terms and conditions for using the Online Text Editor platform.",
    },
    title: "Terms of Use",
    introHtml:
      "Welcome to <strong>Online Text Editor</strong>. By accessing and using this site, you agree to these Terms of Use. If you do not agree, we recommend that you do not use our platform.",
    sections: [
      {
        title: "1. Permitted use",
        paragraphs: [
          "This site is intended for personal and professional use without the need for registration. It is forbidden to use it for illegal purposes or to infringe on the rights of third parties.",
        ],
      },
      {
        title: "2. Intellectual property",
        paragraphs: [
          "All content, design, logos, and features are owned by Online Text Editor and protected by copyright and intellectual property laws.",
        ],
      },
      {
        title: "3. Disclaimer",
        paragraphs: [
          "The text typed in the editor is not stored on our servers. Users are responsible for saving and managing their own files.",
        ],
      },
      {
        title: "4. Changes to these terms",
        paragraphs: [
          "We may modify these Terms of Use at any time. Continued use of the site after changes indicates that you accept the new terms.",
        ],
      },
    ],
    contactHtml:
      'If you have any questions about these Terms of Use, please email us at <a href="mailto:contato@editordetexto.online" class="text-blue-500 hover:underline">contato@editordetexto.online</a>.',
    lastUpdatedLabel: "Last update",
    lastUpdatedValue: "August 13, 2025",
  },
  es: {
    locale: "es",
    metadata: {
      title: "Términos de Uso | Editor de Texto en Línea",
      description: "Términos y condiciones de uso del Editor de Texto en Línea.",
    },
    title: "Términos de Uso",
    introHtml:
      "Bienvenido a <strong>Editor de Texto en Línea</strong>. Al acceder y utilizar este sitio, aceptas estos Términos de Uso. Si no estás de acuerdo, te recomendamos no utilizar nuestra plataforma.",
    sections: [
      {
        title: "1. Uso permitido",
        paragraphs: [
          "Este sitio está destinado para uso personal y profesional sin necesidad de registro. Está prohibido utilizarlo con fines ilegales o que violen derechos de terceros.",
        ],
      },
      {
        title: "2. Propiedad intelectual",
        paragraphs: [
          "Todo el contenido, diseño, logotipo y funcionalidades del sitio son propiedad de Editor de Texto en Línea y están protegidos por las leyes de derechos de autor y propiedad intelectual.",
        ],
      },
      {
        title: "3. Exención de responsabilidad",
        paragraphs: [
          "El contenido escrito en el editor no se almacena en nuestros servidores. Cada usuario es responsable de guardar y administrar sus propios textos.",
        ],
      },
      {
        title: "4. Cambios en los términos",
        paragraphs: [
          "Podemos modificar estos Términos de Uso en cualquier momento. El uso continuo del sitio después de los cambios significa que aceptas los nuevos términos.",
        ],
      },
    ],
    contactHtml:
      'Si tienes dudas sobre estos Términos de Uso, escríbenos al correo <a href="mailto:contato@editordetexto.online" class="text-blue-500 hover:underline">contato@editordetexto.online</a>.',
    lastUpdatedLabel: "Última actualización",
    lastUpdatedValue: "13 de agosto de 2025",
  },
};

export function getTermsContent(locale: string): TermsPageContent {
  const normalized = (locale ?? i18n.defaultLocale) as Locale;
  if (termsContentMap[normalized]) {
    return termsContentMap[normalized];
  }
  return termsContentMap[i18n.defaultLocale];
}

export function buildTermsMetadata(locale: string): Metadata {
  const content = getTermsContent(locale);
  return {
    title: content.metadata.title,
    description: content.metadata.description,
  };
}
