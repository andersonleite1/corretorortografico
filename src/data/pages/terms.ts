import { Metadata } from "next";

import { i18n, Locale } from "../../../i18n-config";

const BASE_URL = "https://editordetexto.online";

const TERMS_PATHS: Record<Locale, string> = {
  pt: "/termos",
  en: "/en/termos",
  es: "/es/termos",
};

const HREF_LANG_MAP: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

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
      "Bem-vindo ao <strong>Editor de Texto Online</strong>. Ao acessar e utilizar este site, assinar nossos planos ou usar nossos recursos de inteligência artificial, você concorda legalmente com os presentes Termos de Uso. Caso não concorde com qualquer parte destes termos, você deve parar de utilizar nossa plataforma.",
    sections: [
      {
        title: "1. Criação de Conta e Cadastro",
        paragraphs: [
          "Para utilizar de forma plena a plataforma, como armazenar documentos online e usar recursos premium de IA, você precisará criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorram sob sua conta. Contas inativas por longos períodos podem ser suspensas a nosso critério.",
        ],
      },
      {
        title: "2. Propriedade Intelectual e Conteúdo",
        paragraphs: [
          "Nós não reivindicamos a propriedade dos textos e documentos que você cria no Editor de Texto Online. Você retém todos os direitos autorais do seu conteúdo gerado ou armazenado na plataforma.",
          "O código-fonte, a interface, a marca e as funcionalidades do site, por outro lado, são de propriedade exclusiva do Editor de Texto Online e protegidos por leis de propriedade intelectual.",
        ],
      },
      {
        title: "3. Responsabilidades e Uso Aceitável",
        paragraphs: [
          "É terminantemente proibido utilizar o Editor de Texto Online para gerar, processar ou hospedar conteúdos de natureza ilegal, difamatória, maliciosa, fraudulenta ou que viole direitos de terceiros.",
          "O desrespeito a essas regras poderá resultar no bloqueio permanente de sua conta sem aviso prévio.",
        ],
      },
      {
        title: "4. Uso de Inteligência Artificial",
        paragraphs: [
          "Oferecemos funcionalidades baseadas em Inteligência Artificial, providas por integrações de terceiros (como OpenAI). Você compreende e concorda que o conteúdo gerado pela IA pode apresentar erros, imprecisões lógicas ou falhas de formatação. O usuário humano se responsabiliza integralmente pela verificação dos textos antes de seu uso final.",
        ],
      },
      {
        title: "5. Assinaturas, Pagamentos e Cancelamento",
        paragraphs: [
          "Certos recursos do site exigem o pagamento de uma assinatura. Valores e planos são listados na plataforma. As transações são realizadas com segurança via provedor terceirizado (Stripe).",
          "O usuário pode cancelar a renovação de sua assinatura a qualquer momento; o cancelamento manterá os benefícios ativos até o final do ciclo já pago. Os valores de assinaturas mensais ou anuais não são reembolsáveis pro-rata.",
        ],
      },
      {
        title: "6. Isenção de Responsabilidade (Disclaimer)",
        paragraphs: [
          'O Editor de Texto Online e seus serviços associados são fornecidos na condição "como estão" (as is). Não oferecemos garantias de que os serviços operarão de forma ininterrupta ou totalmente livres de erros. Não seremos responsáveis por falhas de hardware, instabilidades de rede ou exclusão acidental de documentos decorrente da ação do próprio usuário.',
        ],
      },
      {
        title: "7. Jurisdição e Atualizações destes Termos",
        paragraphs: [
          "Temos o direito de modificar estes Termos de Uso periodicamente. Alterações significativas poderão ser comunicadas via sistema ou e-mail. Estes termos são regidos e interpretados segundo as leis brasileiras.",
        ],
      },
    ],
    contactHtml:
      'Em caso de dúvidas sobre estes Termos de Uso ou disputas comerciais, entre em contato pelo e-mail: <!--email_off--><a href="mailto:contato@editordetexto.online" class="text-blue-500 hover:underline">contato@editordetexto.online</a><!--/email_off-->.',
    lastUpdatedLabel: "Última atualização",
    lastUpdatedValue: "02 de Março de 2026",
  },
  en: {
    locale: "en",
    metadata: {
      title: "Terms of Use | Online Text Editor",
      description:
        "Terms and conditions for using the Online Text Editor platform.",
    },
    title: "Terms of Use",
    introHtml:
      "Welcome to <strong>Online Text Editor</strong>. By accessing and using this site, subscribing to our plans, or utilizing our AI features, you legally agree to these Terms of Use. If you do not agree with any part of these terms, you must stop using our platform immediately.",
    sections: [
      {
        title: "1. Account Creation",
        paragraphs: [
          "To fully use the platform, such as syncing documents online and accessing premium AI generation features, you will need to create an account. You are responsible for keeping your login credentials confidential and for all activities that occur under your account.",
        ],
      },
      {
        title: "2. Intellectual Property and Content",
        paragraphs: [
          "We do not claim ownership of the texts and documents you create on Online Text Editor. You retain all copyrights to your generated or stored content on the platform.",
          "However, the source code, interface design, brand, and features entirely belong to Online Text Editor and are protected by applicable intellectual property laws.",
        ],
      },
      {
        title: "3. Acceptable Use",
        paragraphs: [
          "It is strictly forbidden to use the Online Text Editor to generate, process, or host illegal, defamatory, malicious, fraudulent content, or content that infringes upon third-party rights.",
          "Violation of these rules may lead to a permanent suspension of your account without prior notice.",
        ],
      },
      {
        title: "4. Use of Artificial Intelligence",
        paragraphs: [
          "We offer features powered by artificial intelligence provided by third-party integrations (like OpenAI). You acknowledge that AI-generated content might include errors, logical inaccuracies, or formatting flaws. The human user is fully responsible for reviewing the generated texts before their final use.",
        ],
      },
      {
        title: "5. Subscriptions, Payments, and Cancellation",
        paragraphs: [
          "Certain premium features require a paid subscription. Pricing is displayed within the platform. Transactions are processed securely through a third-party gateway (Stripe).",
          "You may cancel your subscription renewal at any time; cancellation ensures benefits continue until the end of the paid billing cycle. We do not provide pro-rated refunds for subscription periods.",
        ],
      },
      {
        title: "6. Disclaimer of Warranties",
        paragraphs: [
          'The Online Text Editor and its services are provided on an "as is" basis. We do not guarantee that the services will be free of interruptions, errors, or delays. We will not be liable for hardware failures, network interruptions, or the accidental deletion of documents by the user.',
        ],
      },
      {
        title: "7. Governing Law and Term Modifications",
        paragraphs: [
          "We reserve the right to modify these Terms of Use from time to time. Continued use of the service constitutes acceptance. These terms are governed by and construed in accordance with the laws of Brazil.",
        ],
      },
    ],
    contactHtml:
      'If you have any questions about these Terms of Use, please email us at <!--email_off--><a href="mailto:contato@editordetexto.online" class="text-blue-500 hover:underline">contato@editordetexto.online</a><!--/email_off-->.',
    lastUpdatedLabel: "Last update",
    lastUpdatedValue: "March 02, 2026",
  },
  es: {
    locale: "es",
    metadata: {
      title: "Términos de Uso | Editor de Texto en Línea",
      description:
        "Términos y condiciones de uso del Editor de Texto en Línea.",
    },
    title: "Términos de Uso",
    introHtml:
      "Bienvenido al <strong>Editor de Texto en Línea</strong>. Al acceder y utilizar este sitio web, suscribirse a nuestros planes o usar las funciones de IA, acepta legalmente estos Términos de Uso. Si no está de acuerdo, le rogamos no utilice nuestra plataforma.",
    sections: [
      {
        title: "1. Creación de Cuenta",
        paragraphs: [
          "Para utilizar las funciones avanzadas como el almacenamiento en la nube y la inteligencia artificial, deberá crear una cuenta. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña de acceso. Nos reservamos el derecho de suspender cuentas sin actividad prolongada.",
        ],
      },
      {
        title: "2. Propiedad Intelectual y Contenidos",
        paragraphs: [
          "No reclamamos ser los dueños de los textos y documentos creados. Usted retiene todos los derechos de autor sobre su contenido original creado en la plataforma.",
          "Por el contrario, el código, el diseño del sistema y los elementos gráficos del sitio son propiedad exclusiva del Editor de Texto en Línea.",
        ],
      },
      {
        title: "3. Uso Aceptable y Responsabilidades",
        paragraphs: [
          "Queda rigurosamente prohibido emplear el Editor de Texto en Línea para procesar, redactar o distribuir contenidos de índole estrictamente ilegal, piratería, spam, fraude o material que vulnere derechos y marcas.",
          "El incumplimiento podrá derivar en la eliminación o suspensión definitiva de su acceso.",
        ],
      },
      {
        title: "4. Uso de la Inteligencia Artificial",
        paragraphs: [
          "Ofrecemos asistentas de corrección o generación potenciadas por modelos de Inteligencia Artificial de terceros (ej. OpenAI). Entienda que el resultado generado puede adolecer ocasionalmente de incorrecciones. Es fundamental que verifique el texto de salida antes de utilizarlo profesionalmente.",
        ],
      },
      {
        title: "5. Suscripciones y Pagos",
        paragraphs: [
          "Contamos con modalidades de suscripciones de pago mediante proveedores de cobros (Stripe). Usted se compromete a proporcionar información de facturación válida.",
          "Puede cancelar la renovación automática de la suscripción en cualquier instante. No hay reembolsos proporcionales si decide cancelar a mitad del período de facturación abonado.",
        ],
      },
      {
        title: "6. Exención de Garantías",
        paragraphs: [
          'El editor se suministra de modalidad "tal cual" (as is). No podemos asegurar que los servicios de servidor estén exentos de interrupciones técnicas. El usuario asume libremente la responsabilidad del uso y recomendamos mantener respaldos (backups) propios de documentos críticos.',
        ],
      },
      {
        title: "7. Actualización de Términos de Uso",
        paragraphs: [
          "Podremos actualizar estos términos ocasionalmente. El uso de la plataforma posteriormente a la actualización significará su asentimiento de los nuevos Términos. Están regidos por la legislación de Brasil.",
        ],
      },
    ],
    contactHtml:
      'Si tienes dudas o reclamos sobre estos Términos de Uso, escríbenos a <!--email_off--><a href="mailto:contato@editordetexto.online" class="text-blue-500 hover:underline">contato@editordetexto.online</a><!--/email_off-->.',
    lastUpdatedLabel: "Última actualización",
    lastUpdatedValue: "02 de Marzo de 2026",
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
  const normalizedLocale = (locale ?? i18n.defaultLocale) as Locale;

  const languages = Object.fromEntries(
    i18n.locales.map((loc) => [
      HREF_LANG_MAP[loc] ?? loc,
      `${BASE_URL}${TERMS_PATHS[loc]}`,
    ]),
  );

  languages["x-default"] = `${BASE_URL}${TERMS_PATHS[i18n.defaultLocale]}`;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: {
      canonical: `${BASE_URL}${TERMS_PATHS[normalizedLocale]}`,
      languages,
    },
  };
}
