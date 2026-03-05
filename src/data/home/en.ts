import { HomeContent } from "./types";

const en: HomeContent = {
  locale: "en",
  seo: {
    title: "Online Text Editor: Write, Format, and Publish Faster",
    description:
      "Use a modern online text editor optimized for writing blog posts, essays, newsletters, and code-friendly snippets without leaving the browser.",
    keywords: [
      "online text editor",
      "free online text editor",
      "write text online",
      "best online text editor",
      "blog post editor",
      "plain text editor",
    ],
    openGraphTitle: "Online Text Editor: Write, Format, and Publish Faster",
    openGraphDescription:
      "Draft, format, and export content directly from the browser with a lightweight online text editor—no installs or logins required.",
  },
  webAppSchema: {
    name: "Online Text Editor",
    description:
      "Free online tool to edit, format, and clean text. Includes word counter, case converter, and formatting removal.",
    applicationCategory: "UtilityApplication",
    featureList: [
      "Advanced text editing",
      "Export to PDF and DOCX",
      "Minimalist and intuitive interface",
      "Mobile compatible",
    ],
    keywords: [
      "online text editor",
      "write text online",
      "free text tool",
      "export text to PDF",
      "online document editor",
    ],
  },
  article: {
    title: "Write, Edit, and Export Content with the Online Text Editor",
    introHtml:
      "Welcome to the <strong>Online Text Editor</strong>, a frictionless space for drafting ideas, formatting long-form posts, or cleaning up copy before publishing. Marketers, students, technical writers, and developers can all stay focused with a tool built specifically for browser-first writing.",
    sections: [
      {
        title: "Why choose this online text editor?",
        points: [
          {
            highlight: "Simple by design:",
            text: "A clean interface that keeps the focus on words and structure instead of menus.",
          },
          {
            highlight: "Productive workflow:",
            text: "Preview post layouts, copy semantic HTML, or export to PDF/DOCX in seconds without extra plugins.",
          },
          {
            highlight: "Flexible:",
            text: "Great for blog drafts, study notes, newsletter snippets, or quick documentation for product teams.",
          },
          {
            highlight: "Free forever:",
            text: "All editing resources are available with no subscription, login, or watermarks.",
          },
        ],
      },
      {
        title: "Everything you need to write well",
        description:
          "From basic formatting to advanced export flows, the online editor adapts to your writing routine:",
        points: [
          "Structure and format paragraphs effortlessly with familiar keyboard shortcuts;",
          "Preview how the copy will look once published on a blog or CMS;",
          "Download PDF or DOCX versions instantly for easy sharing;",
          "Work from desktop, tablet, or mobile with the same experience anywhere.",
        ],
      },
      {
        title: "Lightweight yet powerful",
        description:
          "We combine <strong>speed</strong>, <strong>clarity</strong>, and <strong>focus</strong> so you do not have to install heavy software, synchronize files, or deal with distractions.",
      },
      {
        title: "Benefits for content teams",
        description: "Choosing this online text editor unlocks:",
        points: [
          "Browser-based access with zero setup or extensions;",
          "Compatibility with phones, tablets, Chromebooks, and desktops alike;",
          "A fast workflow even with limited connections or budget.",
        ],
      },
    ],
    finalNoteHtml:
      "Start using the <strong>Online Text Editor</strong> today and see how enjoyable writing can be when the interface works with you. Keep every draft, newsletter, and landing-page update moving without leaving your browser.",
  },
  faq: {
    label: "FAQ",
    heading: "Frequently asked questions about the editor",
    description:
      "Get quick answers about access, pricing, and how the editor behaves on different devices.",
    items: [
      {
        question: "What is a text editor?",
        answer:
          "It is a tool made to create and manipulate plain-text files. Unlike full document processors, this editor prioritizes speed, clarity, and code-friendly formatting.",
      },
      {
        question: "How is it different from Word?",
        answer:
          "Word focuses on complex layouts for printing. Our editor is lightweight, faster to load, and ideal for distraction-free drafting or cleaning formatting.",
      },
      {
        question: "Is the editor really free?",
        answer:
          "Yes. All counting, formatting, and export features are available without payments or sign-ups.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Absolutely. The interface is optimized for Android and iOS browsers, so you can capture ideas anywhere.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes. We use Clerk for secure authentication and Prisma with an encrypted database to store your documents. Your texts are never read or shared with third parties.",
      },
      {
        question: "Can I export to Word (.docx)?",
        answer:
          "Yes! The editor offers native export to .docx (Word), as well as PDF, TXT, and HTML. Just click 'Export' and choose your preferred format.",
      },
    ],
  },
  hero: {
    headline: "Where Professional Writing Meets Artificial Intelligence.",
    subheadline:
      "Transform your ideas into impeccable documents with an advanced text editor, analytical grammar checker, and intelligent AI rewriting — all in one place.",
    ctaLabel: "Start Writing for Free",
    ctaHref: "#editor",
    microcopy: "No credit card required · Available in PT, EN and ES",
  },
  problem: {
    eyebrow: "The problem",
    heading: "Tired of switching between different tools?",
    pains: [
      {
        icon: "⏳",
        title: "Time wasted on formatting",
        description:
          "Hours lost adjusting margins, fonts, and styles instead of focusing on what really matters: the content.",
      },
      {
        icon: "📝",
        title: "Grammar insecurity",
        description:
          "Sending emails, reports, or posts with grammar mistakes damages your professional image and credibility.",
      },
      {
        icon: "🎯",
        title: "Wrong tone for the audience",
        description:
          "Adapting the same text for a corporate email, blog post, or WhatsApp message takes unnecessary energy and time.",
      },
    ],
  },
  features: {
    eyebrow: "Features",
    heading: "Everything you need to write better, in one place",
    pillars: [
      {
        icon: "✍️",
        title: "Writing Without Barriers",
        description:
          "Advanced Rich Text formatting with support for tables, lists, code blocks with Syntax Highlighting, and much more. Writing text online has never been so fluid and professional.",
      },
      {
        icon: "🔍",
        title: "Analytical and Smart Review",
        description:
          "Integration with LanguageTool for real-time grammar corrections in PT, EN, and ES. Over 10 AI rewriting tones to instantly adapt your text — plus the ability to create custom tones.",
      },
      {
        icon: "☁️",
        title: "Portability and Flow",
        description:
          "Automatic saving, multi-language support, and direct export to PDF, DOCX, TXT, and HTML. Your documents always with you.",
      },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    heading: "Simple plans, professional results",
    tiers: [
      {
        name: "FREE",
        focus: "For those just getting started",
        price: null,
        items: [
          "Full Rich Text formatting",
          "5 AI rewrites per day",
          "5 rewriting tones",
          "Save documents locally",
          "PDF and DOCX export",
          "No credit card required",
        ],
        ctaLabel: "Start for Free",
        ctaHref: "/sign-up",
        highlighted: false,
      },
      {
        name: "PRO",
        focus: "For content professionals",
        price: "$5",
        priceNote: "/month",
        badge: "Most Popular",
        items: [
          "Everything in Free",
          "500 AI rewrites per month",
          "Customizable rewriting tones",
          "50 cloud documents",
          "Advanced grammar review",
          "Priority support",
        ],
        ctaLabel: "Get PRO",
        ctaHref: "/sign-up",
        highlighted: true,
      },
      {
        name: "TEAM",
        focus: "For teams and companies",
        price: "—",
        items: [
          "Everything in Pro",
          "Shared documents",
          "User management",
          "Advanced integrations",
        ],
        ctaLabel: "Coming soon",
        ctaHref: "#",
        highlighted: false,
        comingSoon: true,
      },
    ],
  },
  cta: {
    heading: "Ready to write faster and with much more quality?",
    ctaLabel: "Create My Free Account",
    ctaHref: "/sign-up",
    loggedIn: {
      heading: "Compare our plans and choose the best one for you",
      ctaLabel: "View Plans",
      ctaHref: "#pricing",
    },
  },
};

export default en;
