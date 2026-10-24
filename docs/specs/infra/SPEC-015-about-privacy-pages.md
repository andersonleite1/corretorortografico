# SPEC-015 — Páginas Sobre e Privacidade

## 1. Metadados

| Campo | Valor |
|---|---|
| ID | SPEC-015 |
| Status | `approved` |
| Criação | 2026-10-24 |
| Autor | Codex |
| Revisor | Anderson Leite — solicitação no chat |
| Feature relacionada | Páginas institucionais da landing pública |
| Dependências | SPEC-013, SPEC-014 — implementadas |

## 2. Contexto e objetivo

Criar páginas públicas `/sobre` e `/privacidade` em português brasileiro, explicando a proposta do CorretorOrtografico.online e os tratamentos de dados observáveis no produto atual. Usar somente informações confirmadas no código e o endereço de contato já autorizado.

Fora do escopo: inventar nome civil ou razão social do operador, afirmar conformidade jurídica, definir retenção de serviços externos, criar formulários, contas, banco ou consentimento novo.

## 3. Requisitos de engenharia

- Implementar como páginas server-rendered, acessíveis e responsivas no App Router.
- Adicionar title, description e canonical próprios em cada página.
- Reutilizar um layout visual leve para cabeçalho, navegação e rodapé.
- Atualizar os links institucionais do rodapé da home para as novas rotas.
- Incluir as duas URLs no sitemap.
- Descrever rascunhos em localStorage, envio do texto ao endpoint LanguageTool e ao serviço upstream, envio do HTML para PDF quando solicitado, analytics Umami e meios de contato.
- Não afirmar política de retenção, anonimato absoluto ou garantia legal de fornecedores sem evidência.

### Arquivos permitidos

- `src/app/sobre/page.tsx`
- `src/app/privacidade/page.tsx`
- `src/app/sitemap.ts`
- `src/app/page.tsx`
- `src/components/shared/SiteInfoPage.tsx`
- `docs/specs/_INDEX.md`
- `docs/specs/infra/SPEC-015-about-privacy-pages.md`

## 4. Contratos

- Rotas canônicas: `https://corretorortografico.online/sobre` e `/privacidade`.
- Idioma: `pt-BR` herdado do Root Layout.
- Contato público: `contato@corretorortografico.online`.
- Conteúdo é estático e não recebe texto, títulos ou parâmetros de documento.
- Nenhum dado novo é persistido ou transmitido pelas páginas institucionais.

## 5. Critérios de aceite

- [x] Ambas as rotas retornam páginas completas com metadados e canonical.
- [x] Conteúdo de privacidade corresponde ao comportamento implementado e não promete retenção/anonimato não confirmados.
- [x] Navegação entre páginas e home funciona por links comuns.
- [x] Sitemap lista as rotas institucionais.
- [x] Build, TypeScript e lint concluem sem erro.

Evidência: `npm run build` gerou `/sobre` e `/privacidade` como páginas estáticas; HTML local contém títulos e canonical; bundle do sitemap inclui ambas as URLs. ESLint dos arquivos alterados e `git diff --check` passaram.

## 6. Histórico

2026-10-24 — Spec aprovada pela solicitação direta do usuário para gerar as páginas Sobre e Privacidade.
