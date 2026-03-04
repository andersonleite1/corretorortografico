import { Metadata } from "next";

import { i18n, Locale } from "../../../i18n-config";

const BASE_URL = "https://editordetexto.online";

const CONTACT_PATHS: Record<Locale, string> = {
  pt: "/contato",
  en: "/en/contato",
  es: "/es/contato",
};

const HREF_LANG_MAP: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

export type ContactFormContent = {
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  submitLabel: string;
};

export type ContactPageContent = {
  locale: Locale;
  metadata: {
    title: string;
    description: string;
  };
  heroTitle: string;
  heroSubtitle: string;
  title: string;
  description: string;
  form: ContactFormContent;
  altContactPrefix: string;
  altContactEmailLabel: string;
};

const contactContentMap: Record<Locale, ContactPageContent> = {
  pt: {
    locale: "pt",
    metadata: {
      title: "Fale conosco | Editor de Texto Online",
      description:
        "Fale conosco e converse com a equipe do Editor de Texto Online",
    },
    heroTitle: "Fale diretamente com nossa equipe",
    heroSubtitle: "Fale diretamente",
    title: "Fale conosco",
    description:
      "Tem alguma dúvida, sugestão ou precisa de suporte? Fale conosco preenchendo o formulário abaixo e responderemos o mais rápido possível.",
    form: {
      nameLabel: "Nome",
      emailLabel: "E-mail",
      messageLabel: "Mensagem",
      submitLabel: "Enviar Mensagem",
    },
    altContactPrefix:
      "Você também pode entrar em contato diretamente pelo e-mail:",
    altContactEmailLabel: "contato@editordetexto.online",
  },
  en: {
    locale: "en",
    metadata: {
      title: "Talk to us | Online Text Editor",
      description: "Talk to us and reach the Online Text Editor team",
    },
    heroTitle: "Talk directly with our team",
    heroSubtitle: "Talk directly",
    title: "Talk to us",
    description:
      "Have a question, feedback, or need support? Talk to us using the form below and we'll get back to you as soon as possible.",
    form: {
      nameLabel: "Name",
      emailLabel: "Email",
      messageLabel: "Message",
      submitLabel: "Send Message",
    },
    altContactPrefix: "You can also reach us directly by email:",
    altContactEmailLabel: "contato@editordetexto.online",
  },
  es: {
    locale: "es",
    metadata: {
      title: "Hable con nosotros | Editor de Texto en Línea",
      description:
        "Hable con nosotros y contacte al equipo de Editor de Texto en Línea",
    },
    heroTitle: "Hable directamente con nuestro equipo",
    heroSubtitle: "Hable directamente",
    title: "Hable con nosotros",
    description:
      "¿Tienes dudas, sugerencias o necesitas soporte? Hable con nosotros completando el formulario y responderemos lo antes posible.",
    form: {
      nameLabel: "Nombre",
      emailLabel: "Correo electrónico",
      messageLabel: "Mensaje",
      submitLabel: "Enviar Mensaje",
    },
    altContactPrefix: "También puedes escribirnos directamente al correo:",
    altContactEmailLabel: "contato@editordetexto.online",
  },
};

export function getContactContent(locale: string): ContactPageContent {
  const normalized = (locale ?? i18n.defaultLocale) as Locale;
  if (contactContentMap[normalized]) {
    return contactContentMap[normalized];
  }
  return contactContentMap[i18n.defaultLocale];
}

export function buildContactMetadata(locale: string): Metadata {
  const content = getContactContent(locale);
  const normalizedLocale = (locale ?? i18n.defaultLocale) as Locale;

  const languages = Object.fromEntries(
    i18n.locales.map((loc) => [
      HREF_LANG_MAP[loc] ?? loc,
      `${BASE_URL}${CONTACT_PATHS[loc]}`,
    ]),
  );

  languages["x-default"] = `${BASE_URL}${CONTACT_PATHS[i18n.defaultLocale]}`;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: {
      canonical: `${BASE_URL}${CONTACT_PATHS[normalizedLocale]}`,
      languages,
    },
  };
}
