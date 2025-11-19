import { Metadata } from "next";

import { i18n, Locale } from "../../../i18n-config";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type PrivacyPageContent = {
  locale: Locale;
  metadata: {
    title: string;
    description: string;
  };
  title: string;
  introHtml: string;
  sections: LegalSection[];
  lastUpdatedLabel: string;
  lastUpdatedValue: string;
};

const privacyContentMap: Record<Locale, PrivacyPageContent> = {
  pt: {
    locale: "pt",
    metadata: {
      title: "Política de Privacidade | Editor de Texto Online",
      description: "Política de Privacidade do Editor de Texto Online, em conformidade com a LGPD.",
    },
    title: "Política de Privacidade",
    introHtml:
      'No <strong>Editor de Texto Online</strong> (https://editordetexto.online/), sua privacidade é uma prioridade. Esta Política de Privacidade explica como coletamos, usamos e protegemos suas informações, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).',
    sections: [
      {
        title: "1. Informações coletadas",
        paragraphs: [
          "Nosso site não exige cadastro e não armazena o conteúdo digitado pelos usuários. Podemos coletar dados de forma automática, como endereço IP, tipo de navegador, páginas acessadas e tempo de permanência, para fins de análise e melhoria do serviço.",
        ],
      },
      {
        title: "2. Uso das informações",
        paragraphs: [
          "Não vendemos, trocamos ou alugamos dados pessoais a terceiros.",
          "Podemos utilizar serviços de terceiros que processam informações técnicas de navegação, como:",
        ],
        list: ["Vercel (hospedagem e analytics).", "Cloudinary (armazenamento temporário de imagens enviadas pelo usuário, quando aplicável).", "Serviços de estatísticas/análises."],
      },
      {
        title: "3. Cookies",
        paragraphs: [
          "Utilizamos cookies para melhorar a navegação e personalizar a experiência. Você pode desativar os cookies nas configurações do seu navegador, mas isso pode limitar o uso de certas funcionalidades.",
        ],
      },
      {
        title: "4. Compartilhamento de dados",
        paragraphs: [
          "Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto quando exigido por lei ou para cumprir obrigações legais.",
        ],
      },
      {
        title: "5. Alterações nesta política",
        paragraphs: [
          "Podemos atualizar esta Política de Privacidade periodicamente. A data da última atualização será sempre indicada no fim desta página.",
        ],
      },
    ],
    lastUpdatedLabel: "Última atualização",
    lastUpdatedValue: "13 de agosto de 2025",
  },
  en: {
    locale: "en",
    metadata: {
      title: "Privacy Policy | Online Text Editor",
      description: "Privacy policy for Online Text Editor, written in compliance with data protection best practices.",
    },
    title: "Privacy Policy",
    introHtml:
      "At <strong>Online Text Editor</strong> (https://editordetexto.online/), your privacy is a priority. This Privacy Policy explains how we collect, use, and protect your information in compliance with Brazil's General Data Protection Law (LGPD) and global privacy standards.",
    sections: [
      {
        title: "1. Information we collect",
        paragraphs: [
          "We do not require registration and we never store the text you type. We may automatically collect technical data such as IP address, browser type, visited pages, and session duration to analyze and improve the service.",
        ],
      },
      {
        title: "2. How we use information",
        paragraphs: [
          "We do not sell, trade, or rent personal data to third parties.",
          "We may rely on third-party services that process technical browsing data, such as:",
        ],
        list: [
          "Vercel (hosting and analytics).",
          "Cloudinary (temporary storage for uploaded images, when applicable).",
          "Analytics/statistics providers.",
        ],
      },
      {
        title: "3. Cookies",
        paragraphs: [
          "We use cookies to enhance navigation and personalize the experience. You can disable cookies in your browser settings, but some features may stop working properly.",
        ],
      },
      {
        title: "4. Data sharing",
        paragraphs: [
          "We do not sell, rent, or share personal data with third parties, except when required by law or to comply with legal obligations.",
        ],
      },
      {
        title: "5. Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy periodically. The date of the last update is always displayed at the end of this page.",
        ],
      },
    ],
    lastUpdatedLabel: "Last update",
    lastUpdatedValue: "August 13, 2025",
  },
  es: {
    locale: "es",
    metadata: {
      title: "Política de Privacidad | Editor de Texto en Línea",
      description: "Política de privacidad del Editor de Texto en Línea en conformidad con la LGPD.",
    },
    title: "Política de Privacidad",
    introHtml:
      "En <strong>Editor de Texto en Línea</strong> (https://editordetexto.online/), tu privacidad es prioridad. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información, en cumplimiento con la Ley General de Protección de Datos de Brasil (LGPD).",
    sections: [
      {
        title: "1. Información recopilada",
        paragraphs: [
          "No exigimos registro ni almacenamos el contenido escrito por los usuarios. Podemos recopilar automáticamente datos como dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia para analizar y mejorar el servicio.",
        ],
      },
      {
        title: "2. Uso de la información",
        paragraphs: [
          "No vendemos, intercambiamos ni alquilamos datos personales a terceros.",
          "Podemos utilizar servicios de terceros que procesan información técnica de navegación, tales como:",
        ],
        list: [
          "Vercel (hosting y analytics).",
          "Cloudinary (almacenamiento temporal de imágenes cargadas, cuando corresponda).",
          "Servicios de estadísticas y análisis.",
        ],
      },
      {
        title: "3. Cookies",
        paragraphs: [
          "Usamos cookies para mejorar la navegación y personalizar la experiencia. Puedes desactivarlas en la configuración de tu navegador, pero algunas funciones pueden quedar limitadas.",
        ],
      },
      {
        title: "4. Compartir datos",
        paragraphs: [
          "No vendemos, alquilamos ni compartimos tus datos personales con terceros, salvo cuando la ley lo exija o para cumplir obligaciones legales.",
        ],
      },
      {
        title: "5. Cambios en esta política",
        paragraphs: [
          "Podemos actualizar esta Política de Privacidad periódicamente. La fecha de la última actualización siempre se muestra al final de esta página.",
        ],
      },
    ],
    lastUpdatedLabel: "Última actualización",
    lastUpdatedValue: "13 de agosto de 2025",
  },
};

export function getPrivacyContent(locale: string): PrivacyPageContent {
  const normalized = (locale ?? i18n.defaultLocale) as Locale;
  if (privacyContentMap[normalized]) {
    return privacyContentMap[normalized];
  }
  return privacyContentMap[i18n.defaultLocale];
}

export function buildPrivacyMetadata(locale: string): Metadata {
  const content = getPrivacyContent(locale);
  return {
    title: content.metadata.title,
    description: content.metadata.description,
  };
}
