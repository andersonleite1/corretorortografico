# Inventário técnico e plano de simplificação — v1

## Escopo confirmado

A landing terá o editor como funcionalidade central, com revisão integrada pelo LanguageTool. O texto é salvo localmente no navegador. Não haverá login, banco de dados, documentos em nuvem, dashboard, pagamento ou recursos de IA.

## Arquitetura resultante

- Home server-rendered com conteúdo SEO e o editor Tiptap carregado no cliente.
- API própria para intermediar as chamadas do editor ao LanguageTool e uma rota sem banco para exportação em PDF.
- A rota LanguageTool valida a origem, limita o tamanho do texto e aplica rate limit em memória.
- Salvamento local no navegador, sem sincronização entre dispositivos.
- Idioma da interface, conteúdo da landing e revisão pública: português brasileiro. Mapeamentos internos para inglês e espanhol não representam opções selecionáveis nesta versão.
- Nenhuma dependência ativa de Clerk, Prisma ou `DATABASE_URL`.

## Removido da aplicação

- Páginas de login, cadastro, dashboard, configurações de conta e rotas localizadas antigas.
- APIs de documentos, dashboard, configurações persistidas, usuário/plano, Stripe, IA, webhooks, imagens, relatórios, limpeza agendada e lista de espera.
- Integração Clerk e proxy de autenticação.
- Service worker antigo.
- Scripts de build/deploy que executavam Prisma (`prisma generate` e `db:push`).
- Opções visíveis de documentos em nuvem, IA e relato de problemas na interface do editor.

## Preservado

- Editor Tiptap e sua revisão LanguageTool.
- Rascunho e preferências guardados no navegador.
- Formatação, importação/exportação local suportada pelo editor e exportação PDF via serviço configurado.
- Conteúdo SEO da landing, metadados, canonical, sitemap, robots, favicon e schema para o domínio novo.
- Proteções HTTP e canonicalização de `www`.

## Dependências a limpar

O `package.json` ainda declara pacotes da aplicação original, incluindo Clerk, Prisma, Stripe, AI SDK e dependências de funcionalidades removidas. A remoção do manifesto e do lockfile deve ser feita depois de auditar os módulos restantes do editor e reconciliar as alterações preexistentes no `package-lock.json`. Ter esses pacotes instalados não deve criar conexão com banco: o build já não gera Prisma e nenhuma rota ativa deve importar `src/lib/db.ts`.

## Pontos de revisão

- A API LanguageTool envia o texto ao serviço configurado em `LANGUAGETOOL_ENDPOINTS`; explicar isso na política de privacidade.
- A exportação PDF envia o documento ao serviço configurado em `GOTENBERG_URL`; explicar esse processamento na política de privacidade.
- Rate limit em memória é local a cada instância de servidor. Se houver múltiplas instâncias, o limite efetivo agregado pode ser maior.
- O editor ainda contém módulos antigos sem rota pública e recursos auxiliares que podem importar serviços removidos. Auditar e ocultar qualquer controle que faça chamadas a uma API inexistente.
- A interface usa armazenamento local. Informar que os rascunhos não são sincronizados e podem desaparecer quando os dados do navegador forem apagados.
- Rever favicon, imagens e identidade visual, que ainda podem vir da cópia do EditorDeTexto.
- Rever as páginas legais antes de publicar; não devem mencionar Clerk, Stripe, contas ou banco de dados.

## Critérios de conclusão

1. O editor e o LanguageTool funcionam sem login.
2. As sugestões são obtidas pela API LanguageTool e o texto não é persistido no servidor.
3. As rotas de documentos, dashboard, Stripe e IA não existem.
4. Nenhum fluxo ativo exige `DATABASE_URL`, Prisma ou credenciais de autenticação.
5. A página principal e os sinais técnicos de SEO usam o domínio e o tema do novo corretor.
6. A landing explica claramente o armazenamento local e o processamento no LanguageTool/PDF.
