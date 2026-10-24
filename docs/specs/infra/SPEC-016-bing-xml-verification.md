# SPEC-016 — Verificação do Bing por arquivo XML

## 1. Metadados

| Campo | Valor |
|---|---|
| ID | SPEC-016 |
| Status | `approved` |
| Criação | 2026-10-24 |
| Autor | Codex |
| Revisor | Anderson Leite — arquivo de verificação fornecido no chat |
| Feature relacionada | Verificação do domínio no Bing Webmaster Tools |
| Dependências | SPEC-013 — preparação de verificação Bing |

## 2. Contexto e objetivo

Publicar no diretório estático `public/` o arquivo XML de autenticação Bing fornecido pelo usuário, para que o build sirva o conteúdo em `/BingSiteAuth.xml` na raiz do domínio.

Fora do escopo: deploy, configuração DNS/Cloudflare, acesso à conta Bing ou confirmação de propriedade dentro do painel.

## 3. Requisitos de engenharia

- Manter o nome e estrutura XML fornecidos pelo Bing: `BingSiteAuth.xml`, elemento raiz `users`, elemento `user` contendo o código.
- Não converter para outro formato nem adicionar dependências.
- Validar que o arquivo é empacotado como asset público no build.

### Arquivos permitidos

- `public/BingSiteAuth.xml`
- `README.md`
- `docs/architecture/PRE_LAUNCH_SEO_ROLLOUT.md`
- `docs/specs/_INDEX.md`
- `docs/specs/infra/SPEC-016-bing-xml-verification.md`

## 4. Contratos

- URL pública esperada: `https://corretorortografico.online/BingSiteAuth.xml`.
- Tipo de conteúdo XML; resposta HTTP esperada após deploy: 200.
- O código dentro do arquivo é token público de verificação, não credencial de autenticação.

## 5. Critérios de aceite

- [x] O arquivo local preserva o nome e o código fornecido.
- [x] Build inclui o asset na URL pública esperada; servidor local respondeu `200 OK` com o XML correto.
- [ ] Domínio público responde com o mesmo XML e o Bing confirma a propriedade.

Validação externa em 2026-10-24: `https://corretorortografico.online/BingSiteAuth.xml` respondeu `404`; o deployment público ainda não contém esta alteração. A verificação no painel Bing permanece pendente de publicar o build atual.

## 6. Histórico

2026-10-24 — Spec aprovada pela solicitação direta do usuário e arquivo XML anexado.
