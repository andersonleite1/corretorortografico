# SPEC-013 — SEO e conteúdo para o pré-lançamento

## 1. Metadados

| Campo                 | Valor                                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| ID                    | SPEC-013                                                                 |
| Status                | `approved`                                                               |
| Criação / atualização | 2026-10-24                                                               |
| Autor                 | Codex                                                                    |
| Revisor               | Anderson Leite — aprovação do relatório no chat: “aplique esses ajustes” |
| Feature relacionada   | `docs/SEO_AI_AUDIT_PRE_LAUNCH.md`                                        |
| ADRs                  | nenhum                                                                   |

## 2. Contexto e objetivo

Preparar a landing de corretor ortográfico para descoberta no Google, Bing e experiências de busca com IA, aplicando as recomendações da auditoria aprovada. O produto continua uma landing em português brasileiro com o editor como parte central, sem login ou banco.

Entregas: alinhar idiomas anunciados ao português brasileiro disponível; acrescentar benefícios, instruções, casos de uso e exemplos editoriais próprios; esclarecer o processamento dos textos; publicar contato autorizado; preparar tokens opcionais de verificação dos buscadores e imagem de compartilhamento; documentar lançamento e medição.

Fora do escopo: deploy, DNS/Cloudflare, cadastro nos painéis de busca, ranking/citações garantidos, analytics com IDs herdados, coleta do conteúdo dos rascunhos, novas APIs de produto, páginas repetidas para sinônimos, alterações no editor e novas dependências.

Dependências: escopo v1 e auditoria aprovados; e-mail público autorizado no chat: `contato@corretorortografico.online`. Nome civil/razão social não informado; não inventar pessoa jurídica, responsável nominal, credenciais ou schema de organização.

## 3. Requisitos de engenharia

Next.js App Router com conteúdo público em Server Component. Estender `page.tsx`, `layout.tsx` e documentação existente. Preservar título, H1, canonical, editor, domínio e cinco FAQs existentes. JSON-LD deve continuar escapando `<` e refletir conteúdo visível.

Imagem social gerada com `ImageResponse` e a fonte embutida no Next, sem download externo nem biblioteca nova. Verificação do Google/Bing opcional por variáveis de ambiente vazias por padrão, sem tokens fictícios. Não montar analytics ou alterar CSP nesta entrega.

### Arquivos permitidos

- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/opengraph-image.tsx`
- `src/components/TiptapEditor/styles/_languagetool-sidebar.scss` (contraste identificado no Lighthouse, sem alteração de lógica)
- `public/llms.txt`
- `.env.example`
- `README.md`
- `docs/PRODUCT_SCOPE_V1.md`
- `docs/REMOVAL_PLAN_V1.md`
- `docs/SEO_AI_AUDIT_PRE_LAUNCH.md` (registro posterior à auditoria, sem apagar o retrato inicial)
- `docs/architecture/PRE_LAUNCH_SEO_ROLLOUT.md`
- `docs/specs/infra/SPEC-013-pre-launch-seo.md`
- `docs/specs/_INDEX.md`

### Harness Impact Map

| Campo    | Valor                                                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Risco    | baixo a médio: conteúdo indexável, metadata e imagem gerada no build                                                                                           |
| Entradas | `/`, `/?docId=...`, `/opengraph-image`, `/llms.txt`                                                                                                            |
| Dados    | conteúdo público estático e tokens públicos de verificação; nenhum acesso a rascunhos                                                                          |
| Externos | contato mailto e link informativo para LanguageTool; sem coleta nova                                                                                           |
| Sensores | TypeScript, lint dos arquivos alterados, build de produção, inspeção HTTP de HTML/JSON-LD/PNG e browser desktop/mobile; Lighthouse se ferramenta já disponível |
| Rollback | reverter somente os arquivos desta spec; preservar auditoria anterior e demais mudanças do usuário                                                             |

### Reuse Assessment

`extend-existing`: página server-rendered, FAQ e schema derivados da mesma lista, metadata nativa Next e tokens opcionais. `reuse-existing`: fonte embutida no Next e editor atual. A rota de imagem usa a convenção nativa do Next, sem camada genérica de SEO. Exemplos editoriais devem ser confrontados com o serviço antes de atribuir o resultado ao corretor; na ausência de validação, não afirmar detecção garantida.

## 4. Contratos e tipagens

- `GOOGLE_SITE_VERIFICATION`: string pública opcional para `metadata.verification.google`; omitir se vazia.
- `BING_SITE_VERIFICATION`: string pública opcional para `metadata.verification.other['msvalidate.01']`; omitir se vazia.
- Imagem Open Graph: PNG de 1200 × 630, alt descritivo em português, conteúdo estático do produto, nenhum dado de query ou rascunho.
- Links de contato: endereço autorizado, sem formulário e sem envio automático.
- Privacidade: informar salvamento local, análise por LanguageTool via servidor, PDF via serviço configurado e ausência de sincronização em nuvem; não afirmar retenção ou descarte por serviços externos sem evidência.
- Nenhum contrato Zod/API, schema Prisma ou contexto Tiptap alterado.

## 5. Critérios de aceite

- [x] Português brasileiro consistente na landing e documentação atual.
- [x] Passo a passo, exemplos, casos de uso, limitações e contato legíveis no HTML inicial.
- [x] Título/H1/canonical e funcionamento do editor preservados.
- [x] FAQ e JSON-LD correspondentes; nenhum review ou responsável inventado.
- [x] Tokens ausentes não geram metatags vazias; Google/Bing podem ser configurados por ambiente.
- [x] Imagem de compartilhamento responde PNG com dimensões corretas e metadata aponta para ela.
- [x] Conteúdo responsivo sem overflow em desktop e mobile; texto de status e sugestões com azul legível nos fundos claro e escuro.
- [x] Build, TypeScript, lint e inspeções concluídos ou limitação documentada.
- [x] Nenhuma coleta de texto, dependência, login ou banco adicionado.
- [x] Pendências de publicação e medição registradas sem afirmar ranking.

## 6. Evidências

Implementação e evidências registradas em `docs/architecture/PRE_LAUNCH_SEO_ROLLOUT.md`. O editor montou no browser, HTML/JSON-LD/imagem/redirect foram conferidos no build de produção local e o e-mail publicado foi autorizado pelo usuário. Verificação efetiva das propriedades e dados de busca continuam pendentes da publicação.

## 7. Histórico

2026-10-24 — Recomendações apresentadas na auditoria e aprovadas no chat para implementação; contato público fornecido pelo usuário.

2026-10-24 — A instalação posterior do Umami foi especificada separadamente em SPEC-014, autorizada pelo usuário; a exclusão original de analytics não descreve mais o estado atual do projeto.
