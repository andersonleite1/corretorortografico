# CorretorOrtografico.online

Landing page em português brasileiro com um editor de texto online integrado ao LanguageTool. A correção, as sugestões de gramática e a revisão de estilo são o foco principal do produto.

## Escopo da versão atual

- Editor Tiptap com sugestões do LanguageTool para português, inglês e espanhol.
- Rascunhos guardados localmente no navegador; sem login e sem sincronização em nuvem.
- Sem banco de dados, documentos na nuvem, dashboard, pagamentos ou recursos de IA.
- A rota `/api/languagetool` encaminha as análises para o serviço configurado.
- A exportação em PDF usa o serviço de conversão configurado em `GOTENBERG_URL`.

## Desenvolvimento

Requer Node.js `>=20.18.1` e npm.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Configuração opcional

- `NEXT_PUBLIC_APP_URL`: URL da aplicação usada na validação de origem da API.
- `LANGUAGETOOL_ENDPOINTS`: lista de endpoints `/v2/check` separados por vírgula. Se omitido, usa os endpoints configurados no código.
- `GOTENBERG_URL`: serviço usado para exportação de PDF.

Não configure `DATABASE_URL`: a aplicação não precisa de banco de dados.
