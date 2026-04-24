# SPEC-002 — Identidade Visual e UI/UX Minimalista

<!-- ================================================================
  TEMPLATE OFICIAL — editordetexto.online
  Versão: 1.0.0
================================================================ -->

---

## 1. Metadados

| Campo | Valor |
|---|---|
| **Título** | Identidade Visual e UI/UX Minimalista (Padrão Apple) |
| **ID** | SPEC-002 |
| **Status** | `approved` |
| **Data de Criação** | 2026-04-24 |
| **Última Atualização** | 2026-04-24 |
| **Autor** | Antigravity AI |
| **Revisor** | Anderson Leite |
| **Feature Relacionada** | Design System Core |
| **ADRs Referenciados** | nenhum |

---

## 2. Contexto e Objetivo

### 2.1 Problema que esta feature resolve

Como o projeto é mantido por múltiplos agentes de IA e desenvolvedores, existe o risco de degradação da consistência visual. Sem uma documentação rigorosa, novos componentes podem divergir do padrão "Apple-inspired" original, resultando em uma interface fragmentada e amadora.

### 2.2 O que esta feature entrega

Este documento formaliza as regras de design para garantir que toda nova UI siga os princípios de:
- [x] **Clareza e Elegância**: Layouts limpos com espaços negativos generosos.
- [x] **Tipografia Premium**: Uso de fontes sans-serif modernas com hierarquia clara.
- [x] **Componentes Pill-shaped**: Botões e inputs com bordas arredondadas (estilo pílula).
- [x] **Glassmorphism**: Uso de desfoque de fundo (backdrop-blur) em elementos sobrepostos.
- [x] **Transições Suaves**: Micro-animações de entrada e hover consistentes.

### 2.3 O que está FORA do escopo

- Implementação de novos componentes (esta spec é apenas normativa/documental).
- Definição de logotipos ou branding externo.

### 2.4 Dependências

| Dependência | Tipo | Status |
|---|---|---|
| Tailwind CSS v3 | `blocker` | `done` |
| Framer Motion | `soft` | `done` |

---

## 3. Requisitos de Engenharia

### 3.1 Design Tokens (CSS Variables)

As variáveis core estão definidas em `src/app/[locale]/style.scss`. Devem ser preferencialmente utilizadas via Tailwind classes ou variáveis directas.

#### Cores Core
- **Primary**: `#059669` (Light) / `#10b981` (Dark) - Um verde esmeralda refinado.
- **Background**: White with subtle gradients (`#f5f5f7` to `#fff`).
- **Foreground (Text)**: `#1d1d1f` (Light) / `#f5f5f7` (Dark).
- **Secondary**: `#f0f1f3` (Light) / `#2e373e` (Dark).
- **Border**: `#d1d9e0` (Light) / `#3d444d` (Dark).

#### Tipografia
- **Font Sans**: `Open Sans`, `-apple-system`, `BlinkMacSystemFont`, `"SF Pro Display"`, `"Inter"`.
- **Font Mono**: `JetBrains Mono`.
- **Hero Headlines**: `clamp(2rem, 5vw, 3.25rem)` com `font-weight: 700` e `letter-spacing: -0.03em`.

#### Layout e Espaçamento
- **Borda Arredondada (Default)**: `2rem` para containers grandes (sections).
- **Borda Arredondada (Componentes)**: `980px` (pill) para botões e switches.
- **Section Padding**: `5rem 1.5rem` (mobile) / `6rem 2rem` (desktop).

### 3.2 Padrões de Implementação

#### 1. Glassmorphism (efeito vidro)
Todo elemento fixo ou overlay (Header, Modais, Menus) deve usar:
```scss
backdrop-filter: blur(12px);
background-color: rgba(255, 255, 255, 0.2); // Light
// ou rgba(13, 16, 24, 0.2); // Dark
```

#### 2. Animações Framer Motion
O padrão de entrada deve ser:
- **Initial**: `opacity: 0, y: 20`
- **Animate**: `opacity: 1, y: 0`
- **Transition**: `duration: 0.5, ease: [0.16, 1, 0.3, 1]` (Apple Curve)

#### 3. Botões (Landing)
Devem usar a classe `.landing-btn` definida no SCSS global, que inclui:
- `transition: transform 0.2s ease`
- `active: scale(0.98)`
- `hover: scale(1.025)`

---

## 4. Estrutura de Componentes

### 4.1 Header
- **Contexto**: `sticky top-0 z-50`.
- **Estilo**: Borda inferior fina, fundo semi-transparente com blur.
- **Logo**: Versão branca para dark mode, versão preta/colorida para light mode.

### 4.2 Botões
- **Padrão**: Rounded full (pill).
- **Primary**: Verde esmeralda com sombra suave (glow).
- **Outline**: Borda verde, fundo transparente, hover com opacity suave ou background light green.

### 4.3 Cards (Problem/Features)
- **Background**: `#fff` (Light) / `#1c2433` (Dark).
- **Border**: `1px solid rgba(0,0,0,0.07)` (Light) / `rgba(255,255,255,0.06)` (Dark).
- **Interação**: `translateY(-4px)` no hover.

---

## 5. Critérios de Aceite para a IA (Manutenção do Padrão)

### 5.1 Consistência Visual
- [ ] O componente usa as cores definidas no `style.scss` (`--rte-*`).
- [ ] O componente respeita o border-radius de 2rem para cards ou full para botões.
- [ ] A tipografia segue a hierarquia (Eyebrow > Heading > Subheadline).

### 5.2 Dark Mode
- [ ] O componente tem estilos específicos para a classe `.dark`.
- [ ] O contraste em dark mode segue o padrão de backgrounds profundos (`#0d1017`) em vez de preto puro.

### 5.3 Micro-interações
- [ ] Elementos clicáveis possuem feedback visual (scale ou mudança de cor suave).
- [ ] Modais e dropdowns utilizam `backdrop-blur`.

---

## 6. Histórico de Revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-04-24 | Antigravity AI | Criação inicial da norma de UI/UX |

---

*Documento normativo — editordetexto.online SDD Infrastructure*
