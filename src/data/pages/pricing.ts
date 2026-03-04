import { Locale } from "../../../i18n-config";

export const getPricingContent = (locale: Locale) => {
  const content = {
    pt: {
      title: "Planos e Preços",
      subtitle: "Comece grátis. Faça upgrade quando precisar de mais poder.",
      plans: [
        {
          name: "Free",
          price: "$0",
          period: "para sempre",
          description:
            "Editor completo, sem login. Seus dados ficam no seu dispositivo.",
          features: [
            "Editor WYSIWYG completo",
            "Exportação PDF/TXT/DOCX",
            "Modo Fonte (HTML)",
            "Salvar documentos localmente",
            "5 usos de IA por dia",
          ],
          cta: "Usar gratuitamente",
          highlighted: false,
        },
        {
          name: "Pro",
          price: "$12",
          period: "por mês",
          description:
            "Para criadores de conteúdo sérios que precisam de IA e Cloud.",
          features: [
            "Tudo do Free",
            "IA Ilimitada (Reescrita, Tradução, SEO)",
            "Transcrição de áudio",
            "Sync em nuvem (Cross-device)",
            "Histórico de versões",
            "Suporte prioritário",
          ],
          cta: "Começar Pro",
          highlighted: true,
        },
        {
          name: "Team Business",
          price: "$25",
          period: "por mês",
          description:
            "Ideal para equipes pequenas que colaboram em projetos de conteúdo.",
          features: [
            "Tudo do Pro",
            "Até 5 usuários",
            "Espaço de trabalho compartilhado",
            "Gerenciamento de equipe",
            "Faturamento centralizado",
            "Treinamento dedicado",
          ],
          cta: "Em breve",
          highlighted: false,
        },
      ],
      mostPopular: "Mais Popular",
    },
    en: {
      title: "Plans and Pricing",
      subtitle: "Start for free. Upgrade when you need more power.",
      plans: [
        {
          name: "Free",
          price: "$0",
          period: "forever",
          description:
            "Full editor, no login required. Your data stays on your device.",
          features: [
            "Full WYSIWYG Editor",
            "Export PDF/TXT/DOCX",
            "Source Mode (HTML)",
            "Save documents locally",
            "5 AI uses per day",
          ],
          cta: "Use for free",
          highlighted: false,
        },
        {
          name: "Pro",
          price: "$12",
          period: "per month",
          description: "For serious content creators who need AI and Cloud.",
          features: [
            "Everything in Free",
            "Unlimited AI (Rewrite, Translate, SEO)",
            "Audio transcription",
            "Cloud sync (Cross-device)",
            "Version history",
            "Priority support",
          ],
          cta: "Start Pro",
          highlighted: true,
        },
        {
          name: "Team Business",
          price: "$25",
          period: "per month",
          description:
            "Ideal for small teams collaborating on content projects.",
          features: [
            "Everything in Pro",
            "Up to 5 users",
            "Shared workspace",
            "Team management",
            "Centralized billing",
            "Dedicated training",
          ],
          cta: "Coming soon",
          highlighted: false,
        },
      ],
      mostPopular: "Most Popular",
    },
    es: {
      title: "Planes y Precios",
      subtitle: "Comienza gratis. Actualiza cuando necesites más potencia.",
      plans: [
        {
          name: "Free",
          price: "$0",
          period: "para siempre",
          description:
            "Editor completo, sin inicio de sesión. Tus datos se quedan en tu dispositivo.",
          features: [
            "Editor WYSIWYG completo",
            "Exportación PDF/TXT/DOCX",
            "Modo Fuente (HTML)",
            "Guardar documentos localmente",
            "5 usos de IA al día",
          ],
          cta: "Usar gratis",
          highlighted: false,
        },
        {
          name: "Pro",
          price: "$12",
          period: "por mes",
          description:
            "Para creadores de contenido serios que necesitan IA y la Nube.",
          features: [
            "Todo en el Free",
            "IA Ilimitada (Reescritura, Traducción, SEO)",
            "Transcripción de audio",
            "Sincronización en la nube (Cross-device)",
            "Historial de versiones",
            "Soporte prioritario",
          ],
          cta: "Empezar Pro",
          highlighted: true,
        },
        {
          name: "Team Business",
          price: "$25",
          period: "por mes",
          description:
            "Ideal para equipos pequeños que colaboran en proyectos de contenido.",
          features: [
            "Todo en el Pro",
            "Hasta 5 usuarios",
            "Espacio de trabajo compartido",
            "Gestión de equipo",
            "Facturación centralizada",
            "Entrenamiento dedicado",
          ],
          cta: "Próximamente",
          highlighted: false,
        },
      ],
      mostPopular: "Más Popular",
    },
  };

  return content[locale] || content.pt;
};
