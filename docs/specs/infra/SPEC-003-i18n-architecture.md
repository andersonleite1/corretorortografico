# SPEC-003 — Arquitetura de Internacionalização (i18n)

<!-- ================================================================
  TEMPLATE OFICIAL — editordetexto.online
  Versão: 1.0.0
================================================================ -->

---

## 1. Metadados

| Campo | Valor |
|---|---|
| **Título** | Arquitetura de Internacionalização (i18n) |
| **ID** | SPEC-003 |
| **Status** | `approved` |
| **Data de Criação** | 2026-04-24 |
| **Última Atualização** | 2026-04-24 |
| **Autor** | Antigravity AI |
| **Revisor** | Anderson Leite |
| **Feature Relacionada** | Sistema Core de Idiomas |
| **ADRs Referenciados** | nenhum |

---

## 2. Contexto e Objetivo

### 2.1 Problema que esta feature resolve

O projeto atende mercados globais (Brasil, Hispânicos e Internacionais). Precisamos de uma estrutura robusta que suporte múltiplos idiomas (`pt`, `en`, `es`) sem sacrificar a performance do Edge Runtime e garantindo SEO (URLs canônicas e hreflang).

### 2.2 O que esta feature entrega

- [ ] Suporte nativo a Português, Inglês e Espanhol.
- [ ] Detecção automática de idioma via Header `Accept-Language` e Cookie `NEXT_LOCALE`.
- [ ] Roteamento dinâmico via segmento `/[locale]` no App Router.
- [ ] Sistema de dicionários tipados em `src/data/` para SSR e Client Components.
- [ ] URLs limpas: o idioma padrão (`pt`) não exibe o prefixo na URL (usa Rewrite interno).

### 2.3 O que está FORA do escopo

- Uso de bibliotecas pesadas como `next-intl` ou `react-i18next`.
- Tradução de conteúdo dinâmico salvo no banco de dados (documentos do usuário).

### 2.4 Dependências

| Dependência | Tipo | Status |
|---|---|---|
| Next.js App Router | `blocker` | `done` |
| Clerk Middleware | `blocker` | `done` |

---

## 3. Requisitos de Engenharia

### 3.1 Configuração Base (`i18n-config.ts`)

O arquivo central de configuração define os idiomas suportados:
```typescript
export const i18n = {
  locales: ["pt", "en", "es"],
  defaultLocale: "pt",
} as const;
```

### 3.2 Lógica do Middleware (`src/middleware.ts`)

O middleware opera no Edge Runtime e deve seguir este fluxo de decisão:
1.  **Pular Arquivos**: Ignorar assets estáticos (`.png`, `.svg`, etc.) e rotas de API.
2.  **Detecção de Locale**:
    *   Verificar Cookie `NEXT_LOCALE`.
    *   Verificar Header `Accept-Language`.
    *   Fallback para `defaultLocale`.
3.  **Normalização de URL**:
    *   Se a URL contém o `defaultLocale` (ex: `/pt/dashboard`), redirecionar para a versão curta (`/dashboard`).
    *   Se a URL NÃO possui locale e NÃO é o `defaultLocale`, redirecionar para `/[locale]/path`.
    *   Se for o `defaultLocale`, realizar um **Rewrite** silencioso para `/[defaultLocale]/path`.

### 3.3 Estrutura de Dicionários (`src/data/`)

As traduções não são JSONs estáticos, são objetos TypeScript tipados para garantir segurança em tempo de compilação.

**Padrão de diretório:** `src/data/{feature}/index.ts`

**Exemplo de implementação:**
```typescript
// Define o tipo das mensagens
export type FeatureMessages = { title: string; desc: string };

// Mapeia os idiomas
const messages: Record<Locale, FeatureMessages> = {
  pt: { title: "Título", desc: "Descrição" },
  en: { title: "Title", desc: "Description" },
  es: { title: "Título", desc: "Descripción" },
};

// Exporta helper de acesso
export const getFeatureMessages = (locale?: Locale): FeatureMessages => {
  const normalized = locale && i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  return messages[normalized];
};
```

---

## 4. Contratos e Tipagens

### 4.1 Interface de Locale
```typescript
type Locale = "pt" | "en" | "es";
```

### 4.2 Contrato de Página Internacionalizada
Todas as páginas dentro de `src/app/[locale]` recebem o locale via params:
```typescript
interface PageProps {
  params: { locale: Locale };
}
```

---

## 5. Critérios de Aceite para a IA

### 5.1 Roteamento e Middleware
- [ ] Novas rotas devem ser criadas dentro de `src/app/[locale]/` para suportar i18n.
- [ ] O `middleware.ts` NUNCA deve usar APIs exclusivas de Node.js (ex: `fs`, `crypto` nativo) para não quebrar no Cloudflare/Edge.
- [ ] Ao trocar de idioma, o cookie `NEXT_LOCALE` deve ser atualizado para persistir a escolha.

### 5.2 Gerenciamento de Conteúdo
- [ ] NUNCA codificar strings de UI diretamente nos componentes.
- [ ] Todas as strings devem vir de um helper `get{Domain}Messages` em `src/data/`.
- [ ] Se um novo idioma for adicionado, todos os arquivos em `src/data/` devem ser atualizados simultaneamente.

### 5.3 SEO
- [ ] O atributo `lang` da tag `<html>` deve refletir o locale atual.
- [ ] URLs com o idioma padrão (`pt`) não devem exibir o prefixo na barra de endereços do navegador.

---

## 6. Histórico de Revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-04-24 | Antigravity AI | Especificação da Arquitetura de i18n |

---

*Documento normativo — editordetexto.online SDD Infrastructure*
