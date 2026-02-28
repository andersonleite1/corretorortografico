# Implementação de Rascunhos (Drafts) com Histórico de Versões

Este documento detalha o plano e o passo a passo para implementar um sistema de rascunhos para os documentos do `editordetexto`, permitindo até 5 versões de rascunhos por documento e suporte a comparação de diferenças (diff) semelhante ao Git.

## 1. Modelagem do Banco de Dados (Prisma)

A melhor prática para manter um histórico simples de forma escalável e performática é armazenar "snapshots" (cópias) do conteúdo no momento em que o rascunho é salvo, ao invés de calcular e armazenar apenas os deltas (diffs) no banco de dados.

Isso simplifica a leitura, e o diff pode ser calculado pela aplicação de forma rápida quando o usuário solicitar a comparação.

**Passo 1: Atualizar o arquivo `prisma/schema.prisma`**

Adicione o model `Draft` e crie o relacionamento com o model `Document`.

```prisma
model Document {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  title       String   @default("Sem título")
  content     String
  slug        String?  @unique
  isPublished Boolean  @default(false)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Novo relacionamento
  drafts      Draft[]

  @@index([userId])
  @@map("documents")
}

model Draft {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt // Data/hora da última alteração neste rascunho
  documentId  String
  title       String              // Título no momento do rascunho
  content     String              // Conteúdo (JSON, HTML ou Markdown) no momento do rascunho

  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId, createdAt]) // Index para otimizar busca dos rascunhos mais recentes
  @@map("drafts")
}
```

**Passo 2: Gerar a migração e atualizar o Prisma Client**

No terminal do projeto, execute:

```bash
npx prisma migrate dev --name add_drafts_table
npx prisma generate
```

---

## 2. Regra de Negócio: Limite de 5 Rascunhos

Como o banco de dados relacional não limita diretamente a quantidade de registros por relacionamento, o limite exato de **5 rascunhos** deve ser garantido via código (Backend/API).

Sempre que a API de criação de um novo rascunho for chamada, deve-se implementar a seguinte lógica (como um serviço ou controller do Next.js/Server Action):

```typescript
// Exemplo de pseudo-código do Server Action / Rota de API

async function saveDraft(documentId: string, title: string, content: string) {
  // 1. Criar o novo rascunho
  const newDraft = await prisma.draft.create({
    data: { documentId, title, content },
  });

  // 2. Buscar os rascunhos atuais do documento, ordenados do mais recente pro mais antigo
  const drafts = await prisma.draft.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  // 3. Se houver mais de 5, remover os excedentes (os mais antigos)
  if (drafts.length > 5) {
    const idsToDelete = drafts.slice(5).map((d) => d.id);
    await prisma.draft.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }

  return newDraft;
}
```

_Dica de escalabilidade:_ Fazer o envio e a limpeza na mesma ação previne dados órfãos ou lixo no banco. A operação é muito rápida.

---

## 3. Comparação de Diferenças (Sistema Estilo Git)

Para construir a tela que mostra o que foi adicionado (verde) e removido (vermelho), é altamente recomendado realizar a comparação **dinamicamente no Frontend (ou Backend)** usando bibliotecas especializadas, comparando a string `content` do rascunho atual com o rascunho anterior (ou com o documento salvo oficial).

### Biblioteca Recomendada

A biblioteca mais utilizada para isso no ecossistema JavaScript é a **`diff`** (jsdiff).

**Instalação:**

```bash
npm install diff
npm install -D @types/diff
```

### Exemplo de Implementação do Diff

```typescript
import * as Diff from 'diff';

function compareDrafts(oldContent: string, newContent: string) {
  // Compara as duas strings com base em palavras ou caracteres
  const differences = Diff.diffWords(oldContent, newContent);

  // Exemplo de como renderizar no React Tiptap/UI
  return differences.map((part, index) => {
    // Verde para adição, Vermelho para remoção, Cor neutra para o que não mudou
    const color = part.added ? 'bg-green-200 text-green-900' :
                  part.removed ? 'bg-red-200 text-red-900 line-through' :
                  'text-gray-800';

    return <span key={index} className={color}>{part.value}</span>;
  });
}
```

_Observação para conteúdo Rich Text (Tiptap):_ Se o seu content for um JSON do Tiptap, pode ser mais complexo fazer o diff direto no JSON. A estratégia mais comum é fazer a conversão do JSON para Text antes de passar no `diffWords`, ou usar a própria documentação de "Collaboration/Histórico" do Tiptap (embora seja complexa) vs criar o próprio diff como acima focando em visualização de texto plano.

---

## 4. Dúvidas para alinharmos a Continuidade

Antes de começarmos a mexer no código, tenho as seguintes perguntas:

1. **Como o editor está salvando o `content` hoje?** Você salva como HTML (string), Markdown ou o formato JSON oficial do Tiptap?
   Resposta: Salve o objeto JSON do Tiptap na coluna content (tipo Json no Prisma ou String stringificada).
2. **Gatilho dos Rascunhos:** Os rascunhos devem ser salvos de forma automática (a cada X minutos/tempo após digitar) ou terão um botão "Salvar como Rascunho" explícito?
   Resposta: Crie uma nova entrada na tabela Draft apenas quando houver uma mudança de "estado" (ex: o usuário clicou em "Salvar Alterações" ou houve um autosave após 30 minutos sem interação ou se ele fechar a página). Se ele estiver apenas editando, dê um update no rascunho mais recente (o "trabalho em progresso").
3. **Padrão de Tela de Comparação:** Você quer uma modal com dois painéis ("O que era" x "Como ficou") ou prefere o diff na mesma tela de visualização do documento, colorindo as palavras?
   Resposta: Utilize a biblioteca diff comparando o texto plano (extraído do JSON do Tiptap) para mostrar as mudanças ao usuário de forma visual (verde/vermelho).
