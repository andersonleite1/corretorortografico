import { Metadata } from "next";

import { i18n, Locale } from "../../../i18n-config";

const BASE_URL = "https://editordetexto.online";

const PRIVACY_PATHS: Record<Locale, string> = {
  pt: "/privacidade",
  en: "/en/privacidade",
  es: "/es/privacidade",
};

const HREF_LANG_MAP: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

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
      description:
        "Política de Privacidade do Editor de Texto Online, em conformidade com a LGPD e o RGPD da UE.",
    },
    title: "Política de Privacidade",
    introHtml:
      "No <strong>Editor de Texto Online</strong> (https://editordetexto.online/), levamos a proteção dos seus dados muito a sério. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações, em total conformidade com a Lei Geral de Proteção de Dados do Brasil (LGPD, Lei nº 13.709/2018) e o Regulamento Geral sobre a Proteção de Dados da União Europeia (RGPD).",
    sections: [
      {
        title: "1. Informações que coletamos",
        paragraphs: [
          "Para fornecer nossos serviços, coletamos as seguintes informações:",
        ],
        list: [
          "Dados de Conta: Quando você se cadastra, coletamos seu nome, e-mail e foto de perfil através do nosso provedor de autenticação (Clerk).",
          "Conteúdo do Usuário: Armazenamos os documentos e rascunhos que você cria na plataforma em nosso banco de dados seguro, além de suas configurações de editor.",
          "Dados de Pagamento: Se você assinar um plano pago, processamos suas informações de pagamento através do nosso provedor parceiro (Stripe). Não armazenamos detalhes completos do seu cartão de crédito.",
          "Dados de Uso de IA: Se você utilizar nossos recursos de Inteligência Artificial, coletamos informações sobre as interações com a IA (tokens usados, palavras processadas, tempo de resposta) e enviamos os prompts para processamento.",
          "Dados Técnicos e de Navegação: Coletamos dados como endereço IP, navegador e métricas de desempenho para analytics e segurança.",
        ],
      },
      {
        title: "2. Como usamos suas informações",
        paragraphs: [
          "As bases legais para o processamento de seus dados (conforme LGPD e RGPD) incluem a execução de um contrato (fornecer o serviço), o seu consentimento e nosso legítimo interesse (melhoria e segurança do sistema). Utilizamos os dados para:",
        ],
        list: [
          "Permitir que você crie, salve, edite e gerencie seus documentos.",
          "Autenticar sua conta e manter seus dados sincronizados e seguros.",
          "Processar pagamentos e gerenciar assinaturas.",
          "Oferecer recursos melhorados com Inteligência Artificial, enviados anonimamente quando possível para nosso provedor (OpenAI).",
          "Analisar o uso da plataforma para corrigir bugs e melhorar a experiência (Bug Reports).",
        ],
      },
      {
        title: "3. Compartilhamento e Transferência Internacional",
        paragraphs: [
          "Não vendemos ou alugamos seus dados. Para o funcionamento da plataforma, compartilhamos dados com os seguintes subprocessadores (que podem transferir dados internacionalmente, como para os EUA, sob cláusulas contratuais padrão ou frameworks de adequação):",
        ],
        list: [
          "Clerk: Para gestão de autenticação e identidade de usuários.",
          "Stripe: Para processamento seguro de pagamentos e assinaturas.",
          "OpenAI: Para processamento das solicitações feitas aos recursos de IA no editor.",
          "Vercel & Upstash: Para hospedagem web, banco de dados (PostgreSQL/Redis) e infraestrutura de segurança.",
          "Cloudinary: Para armazenamento processamento temporário de mídias (como imagens).",
        ],
      },
      {
        title: "4. Seus Direitos (LGPD e RGPD)",
        paragraphs: [
          "Você tem controle sobre seus dados. A qualquer momento, você pode solicitar:",
        ],
        list: [
          "Acesso, confirmação e retificação dos dados armazenados (realizável na própria conta).",
          "Exclusão definitiva de sua conta, documentos e dados associados.",
          "Portabilidade dos seus documentos (que podem ser exportados via sistema).",
          "Revogação do consentimento para usos específicos.",
        ],
      },
      {
        title: "5. Retenção e Segurança",
        paragraphs: [
          "Seus dados são retidos apenas pelo tempo necessário para cumprir as finalidades descritas, ou até que você exclua sua conta. Empregamos medidas técnicas e organizacionais rígidas (criptografia e controle de acesso) para proteger seus dados contra acessos não autorizados ou vazamentos.",
        ],
      },
      {
        title: "6. Contato e Alterações",
        paragraphs: [
          "Reservamo-nos o direito de atualizar esta Política. A data da última alteração estará sempre no rodapé. Em caso de dúvidas sobre privacidade ou para exercer seus direitos, contate o encarregado de dados (DPO) através do e-mail:",
          "contato@editordetexto.online",
        ],
      },
    ],
    lastUpdatedLabel: "Última atualização",
    lastUpdatedValue: "02 de Março de 2026",
  },
  en: {
    locale: "en",
    metadata: {
      title: "Privacy Policy | Online Text Editor",
      description:
        "Privacy policy for Online Text Editor, written in compliance with Brazil's LGPD and the EU's GDPR.",
    },
    title: "Privacy Policy",
    introHtml:
      "At <strong>Online Text Editor</strong> (https://editordetexto.online/), we take data protection seriously. This Privacy Policy explains how we collect, use, store, and protect your information, in full compliance with Brazil's General Data Protection Law (LGPD) and the European Union's General Data Protection Regulation (GDPR).",
    sections: [
      {
        title: "1. Information we collect",
        paragraphs: [
          "To provide our services, we collect the following information:",
        ],
        list: [
          "Account Data: When you register, we collect your name, email, and profile picture through our authentication provider (Clerk).",
          "User Content: We store the documents and drafts you create on the platform in our secure database, along with your editor settings.",
          "Payment Data: If you subscribe to a paid plan, we process your payment information via our partner (Stripe). We do not store complete credit card details.",
          "AI Usage Data: If you use our AI features, we track usage metrics (tokens, word count) and send prompts to our AI provider for processing.",
          "Technical and Browsing Data: We collect IP addresses, browser types, and performance metrics for analytics and security.",
        ],
      },
      {
        title: "2. How we use your information",
        paragraphs: [
          "Our lawful bases for processing your data include the performance of a contract (providing the service), your consent, and our legitimate interest (system improvement and security). We use your data to:",
        ],
        list: [
          "Allow you to create, save, edit, and manage your documents.",
          "Authenticate your account and keep data securely synced.",
          "Process payments and manage subscriptions.",
          "Provide enhanced AI text generation features, sending prompts to our provider (OpenAI).",
          "Analyze platform usage to fix bugs and improve user experience.",
        ],
      },
      {
        title: "3. Data Sharing and International Transfers",
        paragraphs: [
          "We do not sell or rent your data. To operate our platform, we share data with the following sub-processors (who may transfer data internationally, e.g., to the USA, under standard contractual clauses or adequacy frameworks):",
        ],
        list: [
          "Clerk: For user authentication and identity management.",
          "Stripe: For secure payment and subscription processing.",
          "OpenAI: To process the text prompts submitted to the AI features.",
          "Vercel & Upstash: For web hosting, databases (PostgreSQL/Redis), and security infrastructure.",
          "Cloudinary: For temporary media storage and processing (e.g., images).",
        ],
      },
      {
        title: "4. Your Rights (LGPD and GDPR)",
        paragraphs: [
          "You are in control of your data. At any time, you can request:",
        ],
        list: [
          "Access, confirmation, and rectification of your stored data (available via your account settings).",
          "Permanent deletion of your account, documents, and associated data.",
          "Portability of your documents (capable of being exported within the application).",
          "Withdrawal of your consent for specific data uses.",
        ],
      },
      {
        title: "5. Retention and Security",
        paragraphs: [
          "Your data is kept only for as long as necessary to fulfill the operational purposes described, or until you delete your account. We employ strict technical safeguards (encryption, access controls) to protect your data from unauthorized access or breaches.",
        ],
      },
      {
        title: "6. Contact and Changes to this Policy",
        paragraphs: [
          "We may update this Policy periodically. The date of the last update is always at the bottom of this page. If you have privacy inquiries or wish to exercise your rights, please contact our Data Protection Officer (DPO) at:",
          "contato@editordetexto.online",
        ],
      },
    ],
    lastUpdatedLabel: "Last update",
    lastUpdatedValue: "March 02, 2026",
  },
  es: {
    locale: "es",
    metadata: {
      title: "Política de Privacidad | Editor de Texto en Línea",
      description:
        "Política de privacidad del Editor de Texto en Línea, en conformidad con la LGPD de Brasil y el RGPD de la UE.",
    },
    title: "Política de Privacidad",
    introHtml:
      "En el <strong>Editor de Texto en Línea</strong> (https://editordetexto.online/), nos tomamos muy en serio la protección de datos. Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos su información, en pleno cumplimiento de la Ley General de Protección de Datos de Brasil (LGPD) y el Reglamento General de Protección de Datos de la Unión Europea (RGPD).",
    sections: [
      {
        title: "1. Información que recopilamos",
        paragraphs: [
          "Para proporcionar nuestros servicios, recopilamos la siguiente información:",
        ],
        list: [
          "Datos de Cuenta: Al registrarte, recopilamos tu nombre, correo y foto de perfil mediante nuestro proveedor de autenticación (Clerk).",
          "Contenido del Usuario: Almacenamos los documentos y borradores que creas en nuestra base de datos segura, junto con tus preferencias de edición.",
          "Datos de Pago: Si te suscribes a un plan de pago, procesamos tu información a través de nuestro socio (Stripe). Nunca guardamos los detalles completos de la tarjeta de crédito.",
          "Datos de Uso de IA: Si utilizas funciones de Inteligencia Artificial, hacemos un seguimiento del uso (tokens, cantidad de palabras) y enviamos las solicitudes para su procesamiento.",
          "Datos Técnicos y de Navegación: Recopilamos direcciones IP, navegador web y métricas de rendimiento para seguridad y análisis.",
        ],
      },
      {
        title: "2. Cómo usamos su información",
        paragraphs: [
          "Las bases legales para el procesamiento (según LGPD y RGPD) son la ejecución de un contrato (proveer el servicio), su consentimiento y nuestro interés legítimo (mejorar la plataforma). Utilizamos sus datos para:",
        ],
        list: [
          "Permitirle crear, guardar, editar y exportar sus documentos.",
          "Autenticar su cuenta y mantener la sincronización segura en la nube.",
          "Procesar pagos y habilitar funciones premium.",
          "Ofrecer sugerencias generadas por IA, procesadas por nuestro proveedor (OpenAI).",
          "Analizar el uso de la plataforma para depurar errores y mejorarla.",
        ],
      },
      {
        title: "3. Compartición y Transferencia Internacional de Datos",
        paragraphs: [
          "No vendemos ni alquilamos tus datos. Compartimos datos estrictamente para la operación del sitio con los siguientes subprocesadores (que pueden transferir datos a EE.UU., bajo acuerdos contractuales estándar):",
        ],
        list: [
          "Clerk: Para la gestión de autenticación.",
          "Stripe: Para el procesamiento seguro de pagos.",
          "OpenAI: Para el procesamiento del texto en solicitudes de IA.",
          "Vercel & Upstash: Para alojamiento, bases de datos y seguridad.",
          "Cloudinary: Para almacenamiento y procesamiento de imágenes.",
        ],
      },
      {
        title: "4. Sus Derechos (LGPD y RGPD)",
        paragraphs: ["Tienes control sobre tus datos. Puedes solicitar:"],
        list: [
          "Acceso, ratificación o modificación de los datos almacenados.",
          "Eliminación permanente de la cuenta y sus documentos asociados.",
          "Portabilidad de documentos (fácilmente exportables desde el sistema).",
          "Retirada del consentimiento para tratamientos específicos.",
        ],
      },
      {
        title: "5. Retención y Seguridad",
        paragraphs: [
          "Sus datos se conservan mientras tenga una cuenta activa o hasta que solicite su eliminación. Implementamos cifrado, control de accesos y prácticas de desarrollo seguro para proteger sus datos.",
        ],
      },
      {
        title: "6. Contacto y Modificaciones",
        paragraphs: [
          "Nos reservamos el derecho de modificar esta política en el futuro. Ante dudas de privacidad o para ejercer derechos, contacte a nuestro equipo de datos vía correo:",
          "contato@editordetexto.online",
        ],
      },
    ],
    lastUpdatedLabel: "Última actualización",
    lastUpdatedValue: "02 de Marzo de 2026",
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
  const normalizedLocale = (locale ?? i18n.defaultLocale) as Locale;

  const languages = Object.fromEntries(
    i18n.locales.map((loc) => [
      HREF_LANG_MAP[loc] ?? loc,
      `${BASE_URL}${PRIVACY_PATHS[loc]}`,
    ]),
  );

  languages["x-default"] = `${BASE_URL}${PRIVACY_PATHS[i18n.defaultLocale]}`;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: {
      canonical: `${BASE_URL}${PRIVACY_PATHS[normalizedLocale]}`,
      languages,
    },
  };
}
