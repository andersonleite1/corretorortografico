# Publicação do editor público e aquisição para o Zerus

Referência: SPEC-009. Implementação local concluída em 2026-10-04; não publicada.

## Fluxo entregue

Google → landing/editor gratuito → CTA explícito → página pública do Zerus.

O editor continua disponível sem conta. O visitante pode escrever antes de decidir usar o Zerus. “Começar a Escrever Grátis” aponta a #editor; cabeçalho, chamada contextual, IA e CTA final apontam ao Zerus. O texto atual não é enviado entre os sites.

Rotas antigas de cadastro/login/SSO e preços recebem redirect temporário ao Zerus; dashboard/settings retornam à landing com aviso de conta antiga. Links de documentos remotos mostram ajuda para recuperação, sem carregar ou sobrescrever dados remotos. Clerk continua nas APIs legadas, com 401 sem sessão e 503 quando o middleware não consegue autorizar.

## Dados antigos e assinaturas: condição de publicação

Antes da publicação, levantar contas, documentos remotos e assinaturas ativas. Garantir um processo de recuperação/exportação com verificação de titularidade pelo atendimento, ou uma janela de exportação no produto anterior. O aviso de contato implementado não migra nem recupera dados sozinho.

A retirada da interface não cancela cobranças. Definir tratamento das assinaturas e comunicação aos clientes antes de desativar o fluxo antigo. Manter banco, segredos Clerk/Stripe, webhooks e rotinas de backend necessários até concluir essa transição. Esta entrega não alterou dados ou cobrança.

## Atribuição

- utm_source: editordetexto
- utm_medium: referral
- utm_campaign: public_editor
- utm_content: header, mobile_header, mobile_menu, editor_bridge, editor_ai, selection_ai, footer_cta ou legacy_auth
- Eventos Umami: zerus_cta_view e zerus_cta_click, com locale e placement.

Os eventos novos não incluem texto, título, docId ou parâmetros de URL. Eventos dependem do tracker existente estar disponível; bloqueadores e falhas de rede podem causar subcontagem. Links funcionam mesmo sem analytics.

Para medir cadastro e ativação, o Zerus precisa preservar a origem durante o fluxo de autenticação e associá-la aos eventos de conversão. O redirect atual de /sign-up do Zerus descarta UTMs; isso requer trabalho próprio no Zerus. Esta entrega mede exposição/clique no EditorDeTexto e identifica a entrada por URL, sem alegar atribuição completa entre produtos.

Acompanhar clique/exposição por posição e dispositivo, chegada ao Zerus, cadastro e primeiro documento criado. Comparar também impressões, cliques, CTR e posição por consulta/página no Search Console com uma janela anterior equivalente. Considerar sazonalidade e diferenças de volume; nenhum aumento ou manutenção de ranking é garantido por preservar o conteúdo.

## SEO

Comparação semântica com HEAD confirmou em PT/EN/ES: seo, article, hero.headline, perguntas do FAQ e WebApplication schema iguais. Canonical/hreflang, sitemap e robots não foram alterados. Respostas do FAQ de conta/privacidade, subheadline e descrição de IA receberam correções factuais pontuais. O FAQ schema usa essas respostas atualizadas.

## Evidências locais

- TypeScript: tsc --noEmit --incremental false, exit 0.
- Lint: next lint --no-cache, exit 0, com avisos no projeto.
- Produção: next build, exit 0 em cópia isolada /private/tmp, usando dependências e Prisma client já instalados; sem regenerar banco ou instalar pacotes.
- git diff --check: exit 0.
- Navegador: editor carregado sem UI Clerk; toolbar desktop e mobile 390×844; Mais/Menos revela/oculta ferramentas; CTAs e notas Zerus visíveis; /dashboard redireciona a /?legacy=account e mostra contato.
- Suíte automatizada não executada. Os cenários existentes de middleware foram adaptados ao novo contrato; não há afirmação de cobertura integral de persistência/exportação, auth e conversão ponta a ponta nesta entrega.

## Reversão e preservação

Reuse Assessment: extensão dos componentes, toolbar, i18n e salvamento existentes; helper/link compartilhado centraliza destino e atribuição. Não houve migration, remoção de chaves local_documents/post ou instalação de dependências. A alteração preexistente em package-lock.json foi preservada.

Reverter somente arquivos da SPEC-009 para retornar à interface anterior. Não reverter package-lock.json junto: ele já estava modificado antes desta tarefa. A documentação da spec lista os arquivos da entrega. Executar novamente compilação e checagens após a reversão.

## Atualização de usabilidade — SPEC-010

- TypeScript e lint conferidos; lint sem erros, com avisos existentes no projeto. Build de produção em cópia isolada, sem instalar dependências ou regenerar banco.
- Navegador: desktop claro/escuro e mobile 390×844; painel ancorado na toolbar, submenus sobre o painel, sem overflow horizontal da página. Na largura de 390px, formatação em uma linha com sete alvos de 44×44px.
- Documento sintético: estado pendente seguido de salvo com horário; título, conteúdo e formatação preservados após reload. Renomeação atualiza o editor ativo e mantém o conteúdo; biblioteca mostra trechos, data PT-BR e Abrir sempre visível. Prévia como texto; Escape devolve foco.
- Placeholder verificado no DOM vazio. Identificado e corrigido o descarte de editorProps.placeholder ao atualizar spellcheck/opções; inicialização agora conserva ambas as opções.
- DOCX: helper gerou pacote de 2600 bytes; ZIP/CRC, cinco partes XML/HTML e XMLs conferidos. Download acionado na UI, mas captura do arquivo pelo navegador interrompida; abertura/renderização no Microsoft Word não foi verificada. Leitores sem suporte a altChunk podem ignorar o conteúdo; UI informa compatibilidade.
- Falhas de quota/armazenamento e bloqueio de saída foram revisados no código, sem simulação destrutiva em dados existentes. Nenhum documento preexistente excluído; suíte automatizada não executada.
- Comparação semântica em PT/EN/ES: seo, article, H1, perguntas do FAQ e WebApplication schema iguais a HEAD. Canonical/hreflang não alterados nesta spec.
- Reuse Assessment final: extend-existing nos controles, provider, biblioteca, persistência e primitivas; novo helper DOCX justificado na seção 3. Nenhuma dependência nova; package-lock.json preexistente preservado (11 adições/11 remoções).

A biblioteca continua usando local_documents e o rascunho post. Autosave grava após pausa de 1.5s e tenta gravar antes de abrir Zerus/biblioteca, ocultar aba ou sair. Horário e snapshot só avançam após gravação confirmada; biblioteca inválida impede sobrescrita. Reversão: arquivos permitidos na SPEC-010, preservando dados locais e a SPEC-009.
