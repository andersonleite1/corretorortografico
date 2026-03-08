# Guia de Implantação e Integração: Solução Híbrida (Gotenberg + Mammoth.js)

Este guia detalha os passos para implementar a **Solução Híbrida Leve**, ideal para focar em **alta fidelidade na geração de PDFs (via Gotenberg)** e **rapidez na leitura de DOCX (via Mammoth.js nativo)** no seu editor de texto web (Next.js).

A grande vantagem dessa abordagem é que você **não precisa construir um microserviço Node.js na VPS**. O Gotenberg já fornece uma API rest pronta, robusta e encapsulada no Docker.

---

## Passo 1: Implantação do Gotenberg na VPS (Exportação em PDF/DOCX)

O Gotenberg é uma API REST "stateless" (sem estado) mantida em Docker. Ele usa motores reais (Chromium e LibreOffice) para converter HTML e documentos em PDF.

Na sua VPS, crie uma pasta para o serviço:

```bash
mkdir -p /opt/gotenberg
cd /opt/gotenberg
```

Crie o arquivo `docker-compose.yml`:

**`docker-compose.yml`**
```yaml
version: '3.8'

services:
  gotenberg:
    image: gotenberg/gotenberg:8
    container_name: gotenberg
    restart: unless-stopped
    ports:
      # Expor apenas para localhost se o seu Next.js estiver na MESMA VPS.
      # Se o Next.js estiver em outro lugar (Vercel, etc), altere para "8080:3000"
      # e configure um proxy reverso (Nginx) com HTTPS e autenticação básica (Basic Auth).
      - "127.0.0.1:8080:3000"
    command:
      # (Opcional) Aumentar o timeout se for gerar arquivos muito complexos
      - "gotenberg"
      - "--api-timeout=60s"
```

Suba o contêiner:
```bash
docker compose up -d
```
Verifique se está rodando:
```bash
curl http://127.0.0.1:8080/health
# Retorno esperado: {"status":"up"}
```

*Nota de Segurança:* Diferente do nosso microserviço Pandoc anterior, o Gotenberg não possui autenticação via "API Key" nativamente. Se a sua VPS e o seu Next.js estiverem em máquinas diferentes (ex: Vercel e VPS da DigitalOcean), você **deve** usar um Nginx na VPS rodando na frente do Gotenberg, configurado com HTTPS e *Basic Authentication* (ou verificando um cabeçalho customizado) para proteger o endpoint.

---

## Passo 2: Integração da Exportação de PDF no Next.js

No seu projeto Next.js, configure a URL do Gotenberg:

**`.env.local`**
```env
# URL base do Gotenberg na sua VPS (Ajustar com IP e porta correta via Nginx se necessário)
GOTENBERG_URL=http://localhost:8080
```

Crie a rota de API para enviar HTML e receber PDF:

**`src/app/api/export-import/export-pdf/route.ts`**
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { htmlContent } = await request.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'Conteúdo HTML ausente' }, { status: 400 });
    }

    // O Gotenberg exige uploads multipart/form-data. Mesmo para strings HTML, 
    // precisamos criá-las como arquivos anexados.
    const formData = new FormData();
    
    // Anexa o HTML como um arquivo 'index.html' virtual
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    formData.append('files', htmlBlob, 'index.html');
    
    // (Opcional) Pode enviar margens, formato da folha (A4, etc)
    formData.append('marginTop', '1');
    formData.append('marginBottom', '1');

    // Manda para o Gotenberg gerar PDF via Chromium
    const response = await fetch(\`\${process.env.GOTENBERG_URL}/forms/chromium/convert/html\`, {
      method: 'POST',
      body: formData,
      // Se configurou Nginx com Basic Auth na VPS, passe os headers de autorização aqui.
    });

    if (!response.ok) {
      throw new Error(\`Erro no Gotenberg: \${response.statusText}\`);
    }

    // Recebe o buffer do PDF gerado
    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="documento.pdf"',
      },
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json({ error: 'Falha ao exportar PDF' }, { status: 500 });
  }
}
```

No frontend (tela web do editor), quando o usuário clica em "Gerar PDF", um fetch é disparado enviando o conteúdo rico do editor de texto para essa rota, recebendo o blob e descarregando (download automático).

---

## Passo 3: Integração da Importação de DOCX com Mammoth.js

Para importar arquivos `.docx` e injetá-los no seu editor, não precisamos de VPS extra. Faremos isso puramente na Route API do Next.js via biblioteca `mammoth`.

No repositório do Next.js, instale:
```bash
npm install mammoth
npm install @types/mammoth -D
```

Crie a rota da API de importação:

**`src/app/api/editor/import-docx/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo DOCX não enviado' }, { status: 400 });
    }

    // Converte o arquivo recebido (File) para um Buffer compatível com NodeJS
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Usa Mammoth.js para converter o binário DOCX em HTML puro
    const result = await mammoth.convertToHtml({ buffer });

    // O result contém .value (o HTML) e .messages (avisos caso tenha tido algo não suportado)
    const htmlContent = result.value;

    return NextResponse.json({ 
      html: htmlContent,
      warnings: result.messages 
    });

  } catch (error) {
    console.error('Erro na conversão DOCX:', error);
    return NextResponse.json({ error: 'Falha ao processar o formato DOCX' }, { status: 500 });
  }
}
```

O *Mammoth* é fantástico pois foca em semântica, gerando marcações limpas como `<p>`, `<h1>`, e `<strong>`, deixando a cargo do CSS do seu site toda a estilização; o que é perfeito para carregar um conteúdo que fará parte do ambiente natural do seu editor WYSIWYG.

---

## Passo 4 (Bônus): Como exportar de HTML para DOCX puramente no Node.js?

Caso no futuro preveja querer exportar de volta para DOCX a partir do seu editor, antes de acionar a VPS pesada, considere o pacote leve `html-to-docx`.

```bash
npm install html-to-docx
```

Rota:
**`src/app/api/editor/export-docx/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import HTMLToDOCX from 'html-to-docx';

export async function POST(request: Request) {
  try {
    const { htmlContent } = await request.json();

    if (!htmlContent) return NextResponse.json({ error: 'HTML ausente' }, { status: 400 });

    const fileBuffer = await HTMLToDOCX(htmlContent, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="export.docx"',
      },
    });

  } catch (error) {
    console.error('Falha ao criar docx:', error);
    return NextResponse.json({ error: 'Falha na conversão' }, { status: 500 });
  }
}
```

## Resumo dos Arquivos

1. `docker-compose.yml` (Para o Gotenberg na VPS focado em PDF imaculado)
2. `import-docx/route.ts` (O Backend do Next.js lê arquivos via Mammoth enviando pro front)
3. `export-pdf/route.ts` (O Backend manda o HTML limpo pro Gotenberg gerar o layout super preciso)
4. (Opcional) Exportar o texto do editor para DOCX através do micro pacote Node local.
