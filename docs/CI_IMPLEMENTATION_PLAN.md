# Plano de Implementação de CI/CD (GitHub Actions)

Este documento descreve o plano de implementação de Integração Contínua (CI) utilizando o **GitHub Actions** para o projeto Editor de Texto. O objetivo é garantir a qualidade do código a cada novo _Pull Request_ e _Push_ na _branch_ principal (e.g., `main`), executando verificações automatizadas antes de qualquer _merge_ ou _deploy_.

## 1. Análise do Cenário Atual do Projeto

O projeto utiliza as seguintes tecnologias relevantes para o CI baseadas no `package.json`:

- **Framework**: Next.js (`npm run build` / `npm run dev`)
- **Banco de Dados**: Prisma (`prisma generate`)
- **Linter**: ESLint (`npm run lint`)
- **Testes Unitários/Integração**: Vitest (`npm run test`)
- **Testes E2E (Ponta a Ponta)**: Cypress (`npm run test:e2e`)
- **Gerenciador de Pacotes**: npm (`package-lock.json` presente)

### Scripts Relevantes:

- `lint`: Executa o linter do Next.js.
- `test`: Executa a suíte do Vitest.
- `test:e2e`: Executa os testes do Cypress em background.
- `build`: Gera o Prisma Client e faz o build de produção do Next.js.

---

## 2. Estrutura Proposta para o Workflow (`.github/workflows/ci.yml`)

A pipeline será configurada para rodar em:

- **Pull Requests**: Direcionados para a branch `main`.
- **Pushes**: Na branch `main`.

A estrutura ideal da Action deve conter os seguintes **jobs**:

### Job 1: `lint-and-typecheck` (Análise Estática)

**Objetivo**: Garantir que o código não tem erros de sintaxe, formatação ou tipagem antes de gastar recursos rodando testes.

- **Passos**:
  1. _Checkout_ do repositório.
  2. _Setup_ do Node.js (versão 20.x, conforme especificado no `package.json`).
  3. Instalação de dependências (`npm ci`).
  4. Execução do Lint (`npm run lint`).
  5. Checagem de Tipos (`npx tsc --noEmit`) - _Opcional, mas recomendado para validação estrita_.

### Job 2: `unit-tests` (Testes Vitest)

**Objetivo**: Executar os testes unitários da aplicação de forma isolada e rápida.

- **Passos**:
  1. _Checkout_ do código e _Setup_ Node.js.
  2. Cache de dependências para acelerar.
  3. Instalação de dependências (`npm ci`).
  4. Execução dos testes unitários (`npm run test`).

### Job 3: `e2e-tests` (Testes Cypress)

**Objetivo**: Levantar a aplicação em ambiente de CI e rodar os fluxos reais de usuário do Cypress.

- **Passos**:
  1. _Checkout_ e _Setup_ do Node.js.
  2. Instalação de dependências (`npm ci`).
  3. Gerar client Prisma (`npx prisma generate`). _(Se os testes E2E precisarem do banco mockado, ou configuração similar local)_.
  4. Build da aplicação (`npm run build`).
  5. Iniciar a aplicação em background.
  6. Rodar os testes E2E (`npm run test:e2e`).
  7. _Opcional_: Fazer upload de artefatos de erro do Cypress (screenshots/vídeos) caso o teste falhe.

## 3. Variáveis de Ambiente e Segredos (`Secrets`)

A aplicação em Next.js depende de variáveis de ambiente (como banco de dados, chaves Stripe, OpenAI, Clerk, etc.), como visto no arquivo `.env.local` e `prisma/`. No CI:

- **Testes Unitários (Vitest)**: Geralmente são _mockados_. Dependendo da configuração atual do projeto, pode não ser necessário adicionar chaves reais.
- **Build / E2E**: Se o build no Next.js (`npm run build`) exigir conexão com banco de dados em tempo de build (devido a SSG/Static Params), ou se o Cypress precisar interagir com um DB real de staging, as seguintes _GitHub Secrets_ e _Environments_ deverão ser configuradas no repositório:
  - `DATABASE_URL` (Idealmente um banco de dados de teste ou local via Docker / PostgreSQL via GitHub Actions Service).
  - Outras chaves que o build exige (ex: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, chaves de Sentry, etc podem precisar de valores de _mock_ ou _homologação_ no repositório).

> **Sugestão Prática**: Para resolver o banco de dados no CI, podemos usar a ação `services:` do GitHub Actions para levantar um Postgres _on-the-fly_ só para a execução da _pipeline_, permitindo rodar `npx prisma db push` ali dentro, preenchendo o banco vazio para o teste do Cypress.

## 4. Plano de Evolução (Próximos Passos Sugeridos)

1. **Aprovação do Plano**: Validar com a equipe se a divisão em _Jobs_ (Lint -> Unit -> E2E) está de acordo e se os testes _E2E_ precisam de banco real no CI.
2. **Criação do Workwflow**: Adicionar arquivo base `.github/workflows/ci.yml`.
3. **Mocks/Env**: Criar um arquivo `.env.test` e configurar os mocks para o CI não depender de chaves de API pagas durante a esteira.
4. **Deploy de Staging (Vercel)**: Integrar a branch `main` à Vercel (se já não estiver) ou usar a Vercel GitHub App, para que a Vercel construa Preview Deployments paralelamente ao CI.

---

_Este documento é um rascunho. As implementações de cada passo dependem de aprofundamentos na configuração específica que os testes do Cypress estão exigindo hoje do banco de dados._
