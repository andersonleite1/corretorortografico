import { HomeContent } from "./types";

const es: HomeContent = {
  locale: "es",
  seo: {
    title: "Editor de texto online: escribe, formatea y publica más rápido",
    description:
      "Usa un editor de texto online moderno para redactar artículos, guiones, newsletters y notas técnicas directamente en el navegador.",
    keywords: [
      "editor de texto online",
      "editor de texto en línea gratis",
      "escribir texto online",
      "mejor editor de texto online",
      "editor de blog online",
      "editor web para textos",
    ],
    openGraphTitle:
      "Editor de texto online: escribe, formatea y publica más rápido",
    openGraphDescription:
      "Organiza ideas, limpia el formato y exporta archivos PDF o DOCX con un editor de texto online ligero y sin instalaciones.",
  },
  webAppSchema: {
    name: "Editor de Texto Online",
    description:
      "El Editor de Texto Online es una herramienta gratuita para crear, editar y exportar textos de forma práctica y eficiente. Ideal para estudiantes, profesionales y escritores ocasionales.",
    applicationCategory: "UtilityApplication",
    featureList: [
      "Edición de texto avanzada",
      "Exportación a PDF y DOCX",
      "Interfaz minimalista e intuitiva",
      "Compatible con dispositivos móviles",
    ],
    keywords: [
      "editor de texto online",
      "escribir texto online",
      "herramienta gratuita para textos",
      "exportar texto a PDF",
      "editor de documentos online",
    ],
  },
  article: {
    title: "Escribe, edita y exporta con el editor de texto online",
    introHtml:
      "Bienvenido al <strong>Editor de Texto Online</strong>, un espacio pensado para redactar con agilidad, formatear publicaciones largas o depurar copys antes de enviarlos a un CMS. Estudiantes, equipos de marketing y desarrolladores mantienen el foco gracias a una herramienta creada para trabajar desde el navegador.",
    sections: [
      {
        title: "Ventajas del editor de texto online",
        points: [
          {
            highlight: "Enfoque simple:",
            text: "Una interfaz limpia que reduce distracciones y mantiene la concentración en las palabras.",
          },
          {
            highlight: "Flujo completo:",
            text: "Previsualiza publicaciones, copia HTML semántico o exporta a PDF/DOCX sin plugins.",
          },
          {
            highlight: "Versátil:",
            text: "Útil para blogs, resúmenes, guiones, correos, newsletters y documentación técnica.",
          },
          {
            highlight: "100 % gratuito:",
            text: "Todas las funciones están abiertas sin registro, pagos ni marcas de agua.",
          },
        ],
      },
      {
        title: "Funciones principales",
        description:
          "El editor ofrece lo esencial para trabajar con textos profesionales o personales en línea:",
        points: [
          "Formatea títulos, listas y párrafos en segundos con atajos conocidos;",
          "Visualiza la apariencia final antes de publicar en un blog o intranet;",
          "Descarga archivos PDF o DOCX con un clic para compartir;",
          "Trabaja desde móviles, tablets o computadoras sin perder rendimiento.",
        ],
      },
      {
        title: "Ligero y eficiente",
        description:
          "Nos enfocamos en la <strong>velocidad</strong>, la <strong>claridad</strong> y la <strong>productividad</strong> para que puedas escribir desde cualquier dispositivo sin instalar software pesado.",
      },
      {
        title: "Beneficios clave",
        description: "Al elegir este editor de texto online obtienes:",
        points: [
          "Acceso inmediato desde el navegador sin configuraciones;",
          "Compatibilidad con iOS, Android, Chromebooks y equipos de escritorio;",
          "Experiencia estable incluso con conexiones lentas o planes gratuitos.",
        ],
      },
    ],
    finalNoteHtml:
      "Prueba el <strong>Editor de Texto Online</strong> y descubre una manera más rápida de preparar y compartir documentos, newsletters y actualizaciones para tu sitio sin salir del navegador.",
  },
  faq: {
    label: "FAQ",
    heading: "Preguntas frecuentes sobre el editor",
    description:
      "Resolvemos dudas sobre uso, precio y funcionamiento en diferentes dispositivos.",
    items: [
      {
        question: "¿Qué es un editor de texto?",
        answer:
          "Es una herramienta para crear y modificar archivos en texto plano. Prioriza la agilidad y la limpieza del contenido frente a los procesadores tradicionales.",
      },
      {
        question: "¿En qué se diferencia de Word?",
        answer:
          "Word está orientado a maquetaciones complejas. Nuestro editor es ligero, rápido y se centra en el contenido, ideal para borradores sin distracciones.",
      },
      {
        question: "¿El editor es gratuito?",
        answer:
          "Sí, todas las funciones se ofrecen sin coste y sin necesidad de crear cuentas.",
      },
      {
        question: "¿Funciona en el móvil?",
        answer:
          "Sí. Está optimizado para navegadores en Android e iOS para que puedas escribir en cualquier lugar.",
      },
      {
        question: "¿Mis datos están seguros?",
        answer:
          "Sí. Usamos Clerk para la autenticación segura y Prisma con base de datos cifrada para guardar tus documentos. Tus textos nunca son leídos ni compartidos con terceros.",
      },
      {
        question: "¿Puedo exportar a Word (.docx)?",
        answer:
          "Sí. El editor ofrece exportación nativa a .docx (Word), además de PDF, TXT y HTML. Solo haz clic en 'Exportar' y elige el formato que prefieras.",
      },
    ],
  },
  hero: {
    headline:
      "Donde la Escritura Profesional se Encuentra con la Inteligencia Artificial.",
    subheadline:
      "Transforma tus ideas en documentos impecables con un editor de texto avanzado, corrector gramatical analítico y reescritura inteligente con IA — todo en un solo lugar.",
    ctaLabel: "Empezar a Escribir Gratis",
    ctaHref: "#editor",
    microcopy: "Sin tarjeta de crédito · Disponible en PT, EN y ES",
  },
  problem: {
    eyebrow: "El problema",
    heading: "¿Cansado de cambiar entre diferentes herramientas?",
    pains: [
      {
        icon: "⏳",
        title: "Tiempo perdido con el formato",
        description:
          "Horas perdidas ajustando márgenes, fuentes y estilos en lugar de centrarte en lo que realmente importa: el contenido.",
      },
      {
        icon: "📝",
        title: "Inseguridad gramatical",
        description:
          "Enviar correos, informes o publicaciones con errores gramaticales daña tu imagen profesional y credibilidad.",
      },
      {
        icon: "🎯",
        title: "Tono incorrecto para la audiencia",
        description:
          "Adaptar el mismo texto para un correo corporativo, entrada de blog o mensaje de WhatsApp consume energía y tiempo innecesarios.",
      },
    ],
  },
  features: {
    eyebrow: "Funcionalidades",
    heading: "Todo lo que necesitas para escribir mejor, en un solo lugar",
    pillars: [
      {
        icon: "✍️",
        title: "Escritura Sin Barreras",
        description:
          "Formato Rich Text avanzado con soporte para tablas, listas, bloques de código con Syntax Highlighting y mucho más. Escribir texto online nunca fue tan fluido y profesional.",
      },
      {
        icon: "🔍",
        title: "Revisión Analítica e Inteligente",
        description:
          "Integración con LanguageTool para correcciones gramaticales en tiempo real en PT, EN y ES. Más de 10 tonos de reescritura con IA para adaptar tu texto al instante, con la posibilidad de crear tonos personalizados.",
      },
      {
        icon: "☁️",
        title: "Portabilidad y Fluidez",
        description:
          "Guardado automático, soporte multiidioma y exportación directa a PDF, DOCX, TXT y HTML. Tus documentos siempre contigo.",
      },
    ],
  },
  pricing: {
    eyebrow: "Precios",
    heading: "Planes simples, resultados profesionales",
    tiers: [
      {
        name: "FREE",
        focus: "Para quienes están empezando",
        price: null,
        items: [
          "Formato Rich Text completo",
          "5 reescrituras con IA por día",
          "5 tonos de reescritura",
          "Guardar documentos localmente",
          "Exportación PDF y DOCX",
          "Sin tarjeta de crédito",
        ],
        ctaLabel: "Empezar Gratis",
        ctaHref: "/sign-up",
        highlighted: false,
      },
      {
        name: "PRO",
        focus: "Para profesionales del contenido",
        price: "$5",
        priceNote: "/mes",
        badge: "Más Popular",
        items: [
          "Todo del plan Free",
          "500 reescrituras con IA/mes",
          "Tonos de reescritura personalizables",
          "50 documentos en la nube",
          "Revisión gramatical avanzada",
          "Soporte prioritario",
        ],
        ctaLabel: "Obtener PRO",
        ctaHref: "/sign-up",
        highlighted: true,
      },
      {
        name: "TEAM",
        focus: "Para equipos y empresas",
        price: "—",
        items: [
          "Todo del plan Pro",
          "Documentos compartidos",
          "Gestión de usuarios",
          "Integraciones avanzadas",
        ],
        ctaLabel: "Próximamente",
        ctaHref: "#",
        highlighted: false,
        comingSoon: true,
      },
    ],
  },
  cta: {
    heading: "¿Listo para escribir más rápido y con mucha más calidad?",
    ctaLabel: "Crear Mi Cuenta Gratis",
    ctaHref: "/sign-up",
  },
};

export default es;
