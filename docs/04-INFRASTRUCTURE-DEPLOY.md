# 🚀 Parte 4: Infraestrutura, Deploy e Checklist de Lançamento

> **Stack:** Vercel (Deploy) + Neon (PostgreSQL Serverless) + Sentry (Monitoramento)

---

## 🌐 4.1 Variáveis de Ambiente no Vercel

Acesse: **Vercel Dashboard → Seu Projeto → Settings → Environment Variables**

| Variável                              | Environments | Descrição                         |
| :------------------------------------ | :----------: | :-------------------------------- |
| `DATABASE_URL`                        |     All      | Connection string do banco (Neon) |
| `DIRECT_URL`                          |     All      | URL direta para Prisma Migrations |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   |     All      | Chave pública do Clerk            |
| `CLERK_SECRET_KEY`                    |     All      | Chave secreta do Clerk            |
| `CLERK_WEBHOOK_SECRET`                |     All      | Secret do webhook Clerk           |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`       |     All      | `/sign-in`                        |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`       |     All      | `/sign-up`                        |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` |     All      | `/editor`                         |
| `STRIPE_SECRET_KEY`                   |     All      | Chave secreta Stripe              |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  |     All      | Chave pública Stripe              |
| `STRIPE_WEBHOOK_SECRET`               |     All      | Secret do webhook Stripe          |
| `STRIPE_PRO_PRICE_ID`                 |     All      | Price ID plano Pro                |
| `NEXT_PUBLIC_APP_URL`                 |  Production  | `https://seudominio.com`          |
| `NEXT_PUBLIC_APP_URL`                 |   Preview    | `https://seuapp.vercel.app`       |
| `OPENAI_API_KEY`                      |     All      | Chave da API OpenAI               |
| `AI_MODEL`                            |     All      | `gpt-4o-mini`                     |
| `CLOUDINARY_CLOUD_NAME`               |     All      | Cloud name Cloudinary             |
| `CLOUDINARY_API_KEY`                  |     All      | API Key Cloudinary                |
| `CLOUDINARY_API_SECRET`               |     All      | API Secret Cloudinary             |

> ⚠️ **NUNCA** commite o arquivo `.env.local` no git. Confirme que ele está no `.gitignore`.

---

## ⚡ 4.2 Otimização com Edge Runtime

### Quais rotas usar Edge Runtime?

- ✅ **Edge:** Rotas de IA com streaming (`/api/ai/rewrite`, `/api/ai/translate`) — reduz latência em ~300ms
- ❌ **Node.js:** Rotas com uploads de arquivo, Prisma ORM, e processamento pesado

```typescript
// Adicione ao topo da api route para usar Edge:
export const runtime = "edge";

// Edge NÃO suporta: Prisma Client, fs, path, child_process
// Edge SUPORTA: fetch, crypto, TextEncoder, Web Streams API
```

### Por que Edge é mais rápido para IA?

O Edge Runtime executa nas bordas da rede global da Vercel (+ de 100 regiões). Uma requisição de São Paulo vai para o servidor mais próximo em vez de ir para us-east-1 e voltar. Para streaming, isso é a diferença entre o texto "aparecer" em 50ms vs 400ms.

---

## 🗄️ 4.3 Configuração do Banco (Neon PostgreSQL)

[Neon.tech](https://neon.tech) é gratuito para projetos pequenos com pausas automáticas.

```bash
# 1. Criar projeto em neon.tech
# 2. Copiar as duas connection strings para .env.local:
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# 3. Atualizar schema.prisma:
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

# 4. Aplicar o schema:
npx prisma db push

# 5. Verificar:
npx prisma studio
```

---

## 🔨 4.4 `next.config.mjs` Configurações de Produção

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar React Server Components otimizados
  experimental: {
    serverActions: { bodySizeLimit: "10mb" }, // Para uploads de arquivo
  },

  // Cache de imagens externas (Cloudinary, GitHub avatars)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Redirecionar www → domínio raiz (SEO)
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

---

## 📊 4.5 Monitoramento com Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

Isso configura o Sentry automaticamente. Adicione no `.env.local`:

```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx  # Para source maps
```

### Capturar erros nas rotas de API

```typescript
// Wrapper simples para API Routes
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    // ... sua lógica aqui
  } catch (error) {
    Sentry.captureException(error); // Envia para o Sentry Dashboard
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
```

---

## 📈 4.6 Analytics de Produto (Posthog)

Para entender como os usuários usam a IA e converter Free → Pro:

```bash
npm install posthog-js
```

```typescript
// src/lib/posthog.ts
import posthog from "posthog-js";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "https://app.posthog.com",
    capture_pageview: false, // Captura manual para controle
  });
}

export { posthog };

// Uso em componentes:
posthog.capture("ai_rewrite_used", {
  tone: "professional",
  isProUser: true,
  wordCount: 150,
});

posthog.capture("upgrade_clicked", {
  from: "rate_limit_error",
  plan: "pro",
});
```

---

## 🔖 4.7 SEO: Metadata Dinâmica

### `src/app/layout.tsx`

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: {
    default: "EditorTexto Pro — Editor com IA para Criadores de Conteúdo",
    template: "%s | EditorTexto Pro",
  },
  description:
    "Editor de texto WYSIWYG profissional com Inteligência Artificial. Reescreva, traduza e analise SEO do seu conteúdo. Grátis para começar.",
  keywords: [
    "editor de texto",
    "IA",
    "inteligência artificial",
    "WYSIWYG",
    "SEO",
    "escrita assistida",
  ],
  authors: [{ name: "EditorTexto Pro" }],
  creator: "EditorTexto Pro",

  // Open Graph (compartilhamento nas redes sociais)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "EditorTexto Pro",
    title: "EditorTexto Pro — Editor com IA para Criadores de Conteúdo",
    description:
      "Escreva mais rápido e melhor com IA. Exportação para PDF, DOCX. Grátis para começar.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EditorTexto Pro",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "EditorTexto Pro — Editor com IA",
    description: "Escreva mais rápido e melhor com IA integrada.",
    images: ["/og-image.png"],
    creator: "@seuusuario", // Substitua pelo seu handle
  },

  // Verificação de propriedade
  // verification: { google: "xxx", yandex: "xxx" },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
    },
  },
};
```

### `src/app/sitemap.ts` (Automático)

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/editor`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
```

### Gerar OG Image com Next.js (dinâmico)

### `src/app/opengraph-image.tsx`

```typescript
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "EditorTexto Pro";
export const size = { width: 1200, height: 630 };

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, color: "white", marginBottom: 16 }}>
          ✍️ EditorTexto Pro
        </div>
        <div style={{ fontSize: 28, color: "#a78bfa", textAlign: "center", maxWidth: 800 }}>
          Editor de texto com IA para Criadores de Conteúdo
        </div>
        <div style={{ marginTop: 32, fontSize: 18, color: "#6b7280" }}>
          Grátis para começar · Upgrade para Pro com IA Ilimitada
        </div>
      </div>
    ),
    { ...size }
  );
}
```

---

## 🚀 4.8 Deploy no Vercel (Passo a Passo)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy (pela primeira vez, configura o projeto)
vercel

# 4. Deploy em produção
vercel --prod
```

**OU** conecte o repositório GitHub diretamente:

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório do GitHub
3. Configure as variáveis de ambiente
4. Clique em Deploy ✅

### Configuração do `build command` no Vercel

No `package.json`, adicione o comando que inclui as migrações do Prisma:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postbuild": "next-sitemap"
  }
}
```

---

## ✅ 4.9 Checklist Completo de Pré-Lançamento

### 🔐 Segurança

- [ ] Todas as variáveis de ambiente configuradas no Vercel
- [ ] `.env.local` no `.gitignore` (**nunca commitar!**)
- [ ] Headers de segurança em `next.config.mjs`
- [ ] Webhook secrets validados (Clerk + Stripe)
- [ ] Rate limiting nas APIs de IA

### 🗄️ Banco de Dados

- [ ] `npx prisma db push` executado no banco de produção
- [ ] Backup automático habilitado (Neon faz isso por padrão)
- [ ] Testar criação de usuário via webhook Clerk
- [ ] Testar criação de subscription via webhook Stripe

### 💳 Pagamentos

- [ ] Testar checkout com cartão `4242 4242 4242 4242` (Stripe Test)
- [ ] Testar pagamento recusado com `4000 0000 0000 0002`
- [ ] Verificar Portal do Assinante
- [ ] Webhook Stripe apontando para URL de produção
- [ ] Ativar modo **Live** no Stripe (quando pronto para produção real)

### 🤖 IA

- [ ] Rate limit de 5 requisições/dia funcionando no plano Free
- [ ] Erro com `upgradeUrl` retornado corretamente ao limite
- [ ] Streaming funcionando corretamente no edge
- [ ] Custos OpenAI monitorados em [platform.openai.com/usage](https://platform.openai.com/usage)
- [ ] Budget Alert configurado na OpenAI ($50/mês como limite)

### 🔍 SEO & Performance

- [ ] Lighthouse Score > 90 (Performance, Accessibility, SEO)
- [ ] OG Image gerada corretamente (testar em [opengraph.xyz](https://opengraph.xyz))
- [ ] Sitemap acessível em `/sitemap.xml`
- [ ] `robots.txt` configurado
- [ ] Google Search Console configurado
- [ ] Analytics (Vercel Analytics já instalado no projeto ✅)

### 📱 UI/UX

- [ ] Testar fluxo completo: cadastro → editor → checkout → IA
- [ ] Página de preços (`/pricing`) funcionando
- [ ] Redirecionamento para `/sign-in` em rotas protegidas
- [ ] Toast de "Limite atingido" com botão de upgrade funcionando
- [ ] Testar em mobile (responsividade)

### 🚀 Deploy Final

- [ ] Variáveis de ambiente em produção no Vercel
- [ ] Build de produção sem erros: `npm run build`
- [ ] Webhook Stripe no modo **Live** apontando para URL de produção
- [ ] Domínio customizado configurado no Vercel (Settings → Domains)
- [ ] SSL/HTTPS automático pelo Vercel ✅

---

## 💡 Dicas Finais de Growth

### Estratégia de Lançamento (Semanas 1-4)

**Semana 1:** Beta fechado

- Convide 20-50 usuários beta manualmente
- Colete feedback com Typeform ou Google Forms

**Semana 2:** Product Hunt

- Prepare assets: ícone 120x120px, screenshots, tagline de 60 chars
- Lance numa terça-feira às 12:01 PST (horário de São Francisco)

**Semana 3-4:** SEO + Conteúdo

- Escreva 3 artigos sobre "editor de texto com IA para [nicho]"
- Construa backlinks em comunidades (Hacker News, Reddit r/productivity)

### Métricas a Monitorar (KPIs)

| Métrica                         |         Ferramenta         |  Meta Mês 1   |
| :------------------------------ | :------------------------: | :-----------: |
| MRR (Monthly Recurring Revenue) |      Stripe Dashboard      |     $500      |
| Usuários Ativos                 | Posthog / Vercel Analytics |    500 MAU    |
| Taxa de Conversão Free→Pro      |      Posthog Funnels       |     3-5%      |
| Uso de IA por Usuário           |        DB (AiUsage)        | 3 usos/semana |
| Churn Rate                      |           Stripe           |   < 5%/mês    |
