import { Metadata } from "next";

import { i18n, Locale } from "../../../i18n-config";

const BASE_URL = "https://editordetexto.online";

const ABOUT_PATHS: Record<Locale, string> = {
  pt: "/sobre",
  en: "/en/about",
  es: "/es/sobre",
};

const HREF_LANG_MAP: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

type AboutSection = {
  title: string;
  description: string;
  items?: string[];
};

export type AboutPageContent = {
  locale: Locale;
  metadata: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  sections: AboutSection[];
  closing: {
    title: string;
    description: string;
  };
};

const aboutContentMap: Partial<Record<Locale, AboutPageContent>> = {
  pt: {
    locale: "pt",
    metadata: {
      title: "Sobre | Editor de Texto Online",
      description:
        "Conheça o Editor de Texto Online, nossa missão, visão e como ajudamos criadores a produzir conteúdos melhores.",
    },
    hero: {
      eyebrow: "Sobre nós",
      title: "Simplificando a escrita para criadores e equipes",
      subtitle:
        "Construímos ferramentas acessíveis para quem escreve todos os dias, com foco em produtividade, colaboração e segurança dos dados.",
    },
    sections: [
      {
        title: "Nossa missão",
        description:
          "Entregar um ambiente de escrita rápido, confiável e seguro que se adapta a diferentes fluxos de trabalho, seja para blogs, equipes de marketing ou projetos acadêmicos.",
      },
      {
        title: "O que oferecemos",
        description:
          "Integramos recursos avançados como correção inteligente, exportação em múltiplos formatos e gerenciamento de mídia em uma única experiência.",
        items: [
          "Editor rico com suporte a Markdown, componentes multimídia e modo fonte.",
          "Fluxo simplificado para importar PDFs e gerar documentos prontos para publicação.",
          "Ferramentas colaborativas com histórico de versões e dicas contextuais.",
        ],
      },
      {
        title: "Compromisso com privacidade",
        description:
          "Seguimos as diretrizes da LGPD e mantemos nossos sistemas auditados para garantir a proteção das informações inseridas na plataforma.",
      },
    ],
    closing: {
      title: "Prontos para ajudar",
      description:
        "Nossa equipe está em constante evolução. Se quiser conhecer o roadmap ou sugerir melhorias, fale conosco pelo canal de contato.",
    },
  },
  en: {
    locale: "en",
    metadata: {
      title: "About | Online Text Editor",
      description:
        "Learn more about Online Text Editor, our mission, vision, and how we empower creators to write better content.",
    },
    hero: {
      eyebrow: "About us",
      title: "Simplifying writing for creators and teams",
      subtitle:
        "We build accessible tools for people who write every day, focusing on productivity, collaboration, and data protection.",
    },
    sections: [
      {
        title: "Our mission",
        description:
          "Deliver a fast, reliable, and secure writing environment that adapts to different workflows—blogs, marketing teams, or academic projects.",
      },
      {
        title: "What we offer",
        description:
          "We combine advanced features such as smart proofreading, multi-format exports, and media management in a single experience.",
        items: [
          "Rich editor with Markdown support, multimedia components, and source mode.",
          "Streamlined flow to import PDFs and generate publish-ready documents.",
          "Collaborative tools with version history and contextual hints.",
        ],
      },
      {
        title: "Privacy commitment",
        description:
          "We comply with LGPD guidelines and keep our systems audited to guarantee the protection of information entered in the platform.",
      },
    ],
    closing: {
      title: "Here to help",
      description:
        "Our team is constantly evolving. Want to see the roadmap or suggest improvements? Reach out through the contact channel.",
    },
  },
  es: {
    locale: "es",
    metadata: {
      title: "Acerca de | Editor de Texto en Línea",
      description:
        "Descubre el Editor de Texto en Línea, nuestra misión y cómo ayudamos a los creadores a mejorar sus contenidos.",
    },
    hero: {
      eyebrow: "Sobre nosotros",
      title: "Simplificando la escritura para creadores y equipos",
      subtitle:
        "Construimos herramientas accesibles para quienes escriben todos los días, con foco en productividad, colaboración y seguridad de los datos.",
    },
    sections: [
      {
        title: "Nuestra misión",
        description:
          "Entregar un entorno de escritura rápido, confiable y seguro que se adapte a diferentes flujos de trabajo, desde blogs hasta proyectos académicos.",
      },
      {
        title: "Qué ofrecemos",
        description:
          "Integramos funciones avanzadas como corrección inteligente, exportación en múltiples formatos y gestión de medios en una sola experiencia.",
        items: [
          "Editor avanzado con soporte para Markdown, componentes multimedia y modo fuente.",
          "Flujo simplificado para importar PDF y generar documentos listos para publicar.",
          "Herramientas colaborativas con historial de versiones y sugerencias contextuales.",
        ],
      },
      {
        title: "Compromiso con la privacidad",
        description:
          "Seguimos las directrices de la LGPD y mantenemos auditorías constantes para proteger la información ingresada en la plataforma.",
      },
    ],
    closing: {
      title: "Listos para ayudarte",
      description:
        "Nuestro equipo evoluciona constantemente. Si quieres conocer el roadmap o proponer mejoras, contáctanos por nuestro canal de soporte.",
    },
  },
};

export function getAboutContent(locale: string): AboutPageContent {
  const normalized = (locale ?? i18n.defaultLocale) as Locale;
  return (
    aboutContentMap[normalized] ??
    (aboutContentMap[i18n.defaultLocale] as AboutPageContent)
  );
}

export function buildAboutMetadata(locale: string): Metadata {
  const content = getAboutContent(locale);
  const normalizedLocale = (locale ?? i18n.defaultLocale) as Locale;

  const languages = Object.fromEntries(
    i18n.locales.map((loc) => [
      HREF_LANG_MAP[loc] ?? loc,
      `${BASE_URL}${ABOUT_PATHS[loc]}`,
    ])
  );

  languages["x-default"] = `${BASE_URL}${ABOUT_PATHS[i18n.defaultLocale]}`;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: {
      canonical: `${BASE_URL}${ABOUT_PATHS[normalizedLocale]}`,
      languages,
    },
  };
}
