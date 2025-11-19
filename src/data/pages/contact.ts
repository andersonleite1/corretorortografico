import { Metadata } from "next";

import { i18n, Locale } from "../../../i18n-config";

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
      title: "Contato | Editor de Texto Online",
      description: "Entre em contato com a equipe do Editor de Texto Online",
    },
    title: "Contato",
    description:
      "Tem alguma dúvida, sugestão ou precisa de suporte? Preencha o formulário abaixo e responderemos o mais rápido possível.",
    form: {
      nameLabel: "Nome",
      emailLabel: "E-mail",
      messageLabel: "Mensagem",
      submitLabel: "Enviar Mensagem",
    },
    altContactPrefix: "Você também pode entrar em contato diretamente pelo e-mail:",
    altContactEmailLabel: "contato@editordetexto.online",
  },
  en: {
    locale: "en",
    metadata: {
      title: "Contact | Online Text Editor",
      description: "Get in touch with the Online Text Editor team",
    },
    title: "Contact",
    description:
      "Have a question, feedback, or need support? Fill out the form below and we'll get back to you as soon as possible.",
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
      title: "Contacto | Editor de Texto en Línea",
      description: "Comunícate con el equipo de Editor de Texto en Línea",
    },
    title: "Contacto",
    description:
      "¿Tienes dudas, sugerencias o necesitas soporte? Completa el formulario y responderemos lo antes posible.",
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
  return {
    title: content.metadata.title,
    description: content.metadata.description,
  };
}
