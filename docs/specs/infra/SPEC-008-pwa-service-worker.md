# SPEC-008 — PWA e Pipeline de Service Worker (Serwist)

<!-- ================================================================
  TEMPLATE OFICIAL — editordetexto.online
  Versão: 1.0.0
================================================================ -->

---

## 1. Metadados

| Campo | Valor |
|---|---|
| **Título** | PWA e Pipeline de Service Worker |
| **ID** | SPEC-008 |
| **Status** | `approved` |
| **Data de Criação** | 2026-04-24 |
| **Última Atualização** | 2026-04-24 |
| **Autor** | Antigravity AI |
| **Revisor** | Anderson Leite |
| **Feature Relacionada** | Offline Support & PWA |
| **ADRs Referenciados** | nenhum |

---

## 2. Contexto e Objetivo

### 2.1 Problema que esta feature resolve

Um editor de texto moderno precisa ser instalável (PWA) e funcionar offline para garantir que o usuário não perca acesso ao trabalho por instabilidade de rede. O uso de Service Workers genéricos pode quebrar o roteamento do Next.js; por isso, usamos o **Serwist** (sucessor do Next-PWA/Workbox).

### 2.2 O que esta feature entrega

- [ ] Instalação do site como App (Desktop/Mobile).
- [ ] Suporte básico offline (cache de assets estáticos e páginas principais).
- [ ] Pipeline de build automatizado que gera o `sw.js` em `public/`.
- [ ] Manifest dinâmico compatível com as normas de UI/UX.

### 2.3 O que está FORA do escopo

- Sincronização de Background Sync profunda entre abas.
- Notificações Push (Web Push API) — não implementadas no momento.

### 2.4 Dependências

| Dependência | Tipo | Status |
|---|---|---|
| `@serwist/next` | `blocker` | `done` |
| Web Vitals | `optional` | `done` |

---

## 3. Requisitos de Engenharia

### 3.1 Arquitetura do Service Worker (`src/app/sw.ts`)

O Service Worker deve ser gerenciado pelo Serwist para garantir compatibilidade com o App Router do Next.js.
- **Manifest Injection**: Usar `self.__SW_MANIFEST` para precaching de assets gerados pelo Webpack.
- **Caching Runtime**: Utilizar o `defaultCache` do `@serwist/next/worker`, que já possui as regras otimizadas para roteamento do Next.js.

### 3.2 Pipeline de Build (`next.config.mjs`)

O Service Worker NÃO deve ser editado manualmente na pasta `public/`. Ele é gerado durante o build:
- `swSrc`: `src/app/sw.ts`
- `swDest`: `public/sw.js`
- **Ambiente**: O Service Worker é desativado em `development` para evitar problemas de cache durante a codificação.

### 3.3 Manifesto do App (`src/app/manifest.ts`)

A configuração do manifesto deve refletir os tokens de marca definidos na [SPEC-002](file:///home/anderson/Projects/editordetexto/docs/specs/ui-ux/SPEC-002-visual-identity.md):
- `display`: `standalone` (Experiência de App nativo).
- `theme_color`: Deve seguir a cor primária Emerald (`#10b981`).
- `background_color`: Deve seguir o fundo principal (`#0d1017`).

---

## 4. Contratos e Tipagens

### 4.1 Interface do Service Worker
```typescript
/// <reference lib="webworker" />
import { Serwist } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: defaultCache,
});
```

---

## 5. Critérios de Aceite para a IA

### 5.1 Integridade do Build
- [ ] NUNCA apagar o wrapper `withSerwist` no `next.config.mjs`.
- [ ] Qualquer mudança no `manifest.ts` deve respeitar as cores definidas na SPEC-002.

### 5.2 Comportamento Offline
- [ ] O Service Worker deve ser capaz de servir a página inicial e a página do editor (`/`) quando o dispositivo estiver offline.
- [ ] Assets estáticos (fontes, ícones) devem ser precacheados obrigatoriamente.

### 5.3 UX de Instalação
- [ ] Ícones em `public/` devem incluir versões de 192px e 512px com a propriedade `purpose: "maskable"` para suporte a Android.

---

## 6. Histórico de Revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-04-24 | Antigravity AI | Especificação de PWA e Serwist Pipeline |

---

*Documento normativo — editordetexto.online SDD Infrastructure*
