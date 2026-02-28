# Plano de Arquitetura e UX: Dashboard de Produtividade (IA)

## Contexto de Negócio
O foco primário deste dashboard é a **retenção de usuários e percepção de valor**. Em ferramentas de produtividade impulsionadas por IA, o usuário precisa visualizar de forma tangível o ROI (Return on Investment) do seu uso — seja investimento de tempo ou financeiro (assinatura). O dashboard materializará "horas devolvidas" ao usuário.

---

## Tarefa 1: Análise e Investigação de Dados

**Estrutura Atual (Prisma Schema):**
- Temos as entidades fundamentais: `User`, `Document`, `EditorSettings` e `AiUsage`.
- Atualmente, `AiUsage` guarda apenas o tipo de interação (`feature`) e custos básicos (`tokensUsed`). Faltam as métricas de esforço (tempo de processamento, tamanho do texto).
- As configurações de tons estão salvas em formato JSON dentro de `EditorSettings`, o que dificulta queries analíticas globais, mas funciona bem para o escopo individual do usuário.

**Novos Dados Necessários:**
1. **Métricas de Uso (Quotas):** Precisamos controlar o limite de uso do usuário (ex: reescritas restantes). Atualmente, não há um controle estrito de "créditos" nas tabelas `User` ou `Subscription` além dos `tokensUsed`.
2. **Preferências Globais:** Para exibir o gráfico "Tons mais utilizados", precisaremos salvar na tabela `AiUsage` qual foi o tom exato selecionado durante aquela execução de IA (remover essa responsabilidade apenas do payload JSON de logs).
3. **Métricas de Eficiência:** Para a matemática de tempo, precisaremos da quantidade de palavras enviadas no prompt (`wordCount`) e o tempo gasto para geração (`processingTimeMs`).

---

## Tarefa 2: Algoritmo de "Tempo Economizado"

O intuito desta métrica é traduzir a ação mecânica de reescrever em uma unidade universal de valor: **Tempo**.

**Fórmula Proposta:**
`Tempo Economizado = Tempo de Edição Manual - Tempo de Processamento da IA`

**Constantes Assumidas Realistas:**
- **Velocidade Média de Digitação/Edição Humana (VHE):** Cerca de *40 palavras por minuto* (WPM) para edição consciente/reescrita, o que equivale a ~`0.66 palavras por segundo`.
- **Tempo de Processamento da IA (TIA):** Capturado dinamicamente na resposta (estimado entre `2s` a `8s` dependendo do payload).

**Cálculo Algorítmico (Retorno em Segundos):**
```ts
const TIME_SAVED_SECONDS = (wordCount / 0.66) - (processingTimeMs / 1000);
// Posteriormente formatado na UI para "X horas e Y minutos".
```

> **Justificativa UX:** Se um usuário reescreve 5 parágrafos (aprox. 300 palavras), um humano levaria cerca de 7.5 minutos. A IA faz isso em 4 segundos. O ganho é altíssimo e exibi-lo consolida o valor do produto na mente do usuário.

---

## Tarefa 3: Design de Componentes do Dashboard

A hierarquia visual do Dashboard deve seguir o padrão: *Valor de Negócio (KPIs) -> Desdobramento Analítico (Gráficos) -> Ação Rápida (Widgets)*.

### 1. KPIs (Cards Superiores / "Glance Value")
- **Tempo Total Economizado:** O KPI herói. Tipografia grande e em negrito. Uso de cor primária ativa ou um gradiente vibrante.
- **Documentos Aprimorados:** Contagem total do sistema.
- **Status do Plano / Reescritas Restantes:** Um componente circular simples (Circular Progress) mostrando o limite da cota do mês atual (ex: 85/100 utilizadas).

### 2. Gráficos (Evolução de Produtividade)
- **Evolução de Tempo Economizado (Últimos 30 Dias):** Um *Area Chart* simples, suave e minimalista. As áreas abaixo da linha devem possuir opacidade leve para dar um tom moderno. Eixo Y em "Horas ou Minutos", Eixo X em "Dias da semana".
- **Top Tons de Reescrita (Distribuição):** Um *Donut Chart* (Gráfico de Rosca) ou um ranking de barras horizontais indicando os 3 tons preferidos (ex: 50% Conciso, 30% Formal, 20% Persuasivo).

### 3. Widgets de Acesso e Setup
- **Seus Documentos Recentes:** Lista contendo o título, data da última edição ("Há 2 horas") e um ícone rápido de `Abrir`. Reduz o atrito de navegação.
- **Atalho de Perfil/Configuração:** Um pequeno bloco no canto inferior indicando "Acesse as configurações do seu editor", conectando para os ajustes de `EditorSettings` (atalho rápido).

---

## Tarefa 4: Impacto no Banco de Dados

Para evitar redundância e manter o schema limpo, focaremos na evolução do modelo `AiUsage` (Eventos Analíticos) e uma leve alteração em `User`/`Subscription` (Governança de Quotas).

### Atualização do Schema (Migration Plan)

#### [MODIFICAR] Tabela `AiUsage`
Precisamos destas colunas adicionais para compor o BI do Dashboard e alimentar o algoritmo de Tempo Economizado:
- **`wordCount` (Int):** Quantidade de palavras processadas naquela requisição de IA. Essencial para o cálculo de tempo.
- **`processingTimeMs` (Int):** Latência/tempo da API da IA (OpenAI/Anthropic) em retornar a resposta.
- **`toneUsed` (String?):** Campo opcional armazenando o tom aplicado (ex: "formal", "friendly"). Necessário para o gráfico de tons favoritos.

#### [MODIFICAR] Tabela `User` ou modelo de Quotas Novo
Para viabilizar o contador de *Reescritas Restantes*, precisamos persistir um limite e consumo.
- **Abordagem sugerida:**
  - Adicionar `creditsRemaining` (Int) em `User` ou atrelá-lo diretamente à tabela `Subscription`.
  - Como `AiUsage` já loga o uso por evento, o contador no frontend pode ser derivado da conta `(Limite do Plano - Count() de AiUsage no mês atual)`, dispensando uma nova coluna se a performance de leitura da tabela `AiUsage` suportar. Caso haja alto volume, recomenda-se criar uma propriedade agregada (ex: `currentMonthAiUsageCount` (Int)) cacheada em `User`.

#### Exemplo de Atualização Prisma:
```prisma
model AiUsage {
  id               String   @id @default(cuid())
  createdAt        DateTime @default(now())
  userId           String
  feature          String
  tokensUsed       Int      @default(0)
  
  // -- NOVOS CAMPOS PARA O DASHBOARD --
  wordCount        Int      @default(0)      // Base para cáculo de tempo economizado
  processingTimeMs Int      @default(0)      // Base para cáculo de tempo economizado
  toneUsed         String?                   // Para Data Viz de Preferências
  
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, feature, createdAt])
  @@index([userId, createdAt])
  @@map("ai_usage")
}
```
