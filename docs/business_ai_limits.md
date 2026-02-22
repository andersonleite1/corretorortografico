# Análise de Custos e Limites de IA (Plano Pro)

Esta análise tem como objetivo definir os limites de uso da funcionalidade de reescrita com IA (`gpt-4o-mini`) para assinantes do Plano Pro, que custa **R$ 25,00/mês**, garantindo a viabilidade financeira do projeto.

---

## 1. Premissas de Custo e Receita

1. **Receita Bruta Mensal:** R$ 25,00
2. **Taxas (Stripe - Estimativa ~4% + R$0,39):** ~R$ 1,39
3. **Receita Líquida:** ~R$ 23,61 (Aprox. **$4,00 USD** considerando dólar a R$ 5,90)
4. **Margem de Segurança:** Para que o negócio seja saudável e cubra outros custos (Vercel, Supabase/Postgres, Cloudinary), recomendamos destinar no máximo **15% a 20% da receita líquida** para os custos da OpenAI. 
   - **Orçamento de IA por usuário/mês:** $0,60 a $0,80 USD.

## 2. Custos do Modelo `gpt-4o-mini`

A OpenAI cobra por tokens (1 token ≈ 4 caracteres ou 3/4 de uma palavra em português).
- **Input (Texto enviado):** $0.150 por 1 milhão de tokens.
- **Output (Texto gerado):** $0.600 por 1 milhão de tokens (4x mais caro que o input).

## 3. Proposta de Limites

### Limite A: Caracteres por Reescrita
**Recomendação:** **5.000 caracteres por requisição.**
- *Por quê?* 5.000 caracteres equivalem a aproximadamente 1.000 a 1.250 palavras (1 a 2 páginas de texto). É um limite generoso para a maioria dos casos de uso (parágrafos, emails, posts de blog curtos).
- No seu código atual (`src/app/api/ai/rewrite/route.ts`), o limite do `zod` já está configurado como `max(5000)`, o que é perfeito e já nos protege.

**Cálculo de Custo por Requisição Máxima (5.000 caracteres):**
- 5.000 caracteres ≈ 1.500 tokens (margem de segurança para português que gasta mais tokens).
- Tokens de Input: 1.500 (texto original + prompt de instrução).
- Tokens de Output: 1.500 (texto reescrito).
- Custo Input: `1500 * ($0.150 / 1.000.000)` = $0,000225 USD
- Custo Output: `1500 * ($0.600 / 1.000.000)` = $0,000900 USD
- **Custo Total Máximo por Requisição:** **~$0,001125 USD** (aprox. meio centavo de dólar).

### Limite B: Quantidade de Reescritas por Mês
Se o nosso orçamento por usuário é de ~$0,80 USD e cada requisição máxima custa ~$0,001125 USD:
`$0,80 / $0,001125 = 711 requisições máximas.`

Vale lembrar que a maioria dos usuários não vai mandar textos de 5.000 caracteres em *todas* as requisições. A média de uma requisição comum (ex: um parágrafo de 500 caracteres) custa um décimo disso.

**Recomendação de Limite:** **500 reescritas por mês para o Plano Pro** (aprox. 16 reescritas por dia).
- *Cenário de uso extremo (usuário bate o limite sempre com 5000 chars):* Custo de $0,56 USD (R$ ~3,30). Lucro ainda está seguro.
- *Cenário de uso médio (usuário usa as 500 vezes com textos curtos):* Custo de $0,10 USD.
- Isso permite apresentar o limite na interface como algo generoso ("500 reescritas/mês"), mas limitando seu risco financeiro a no máximo R$ 3,30 a R$ 4,00 por usuário abusivo.

---

## 4. Decisões Consolidadas

Com base na aprovação ("LGTM") da proposta original, as seguintes regras estão implementadas:

1. **Limite Físico por Requisição:** 
   O tamanho máximo do payload enviado pelo usuário (campo `content`) foi travado em **5.000 caracteres** nas rotas `/api/ai/rewrite`, `/api/ai/translate` e `/api/ai/seo`.

2. **Cota Mensal Global (Plano Pro/Team):**
   Usuários pagantes possuem um teto de **500 requisições de IA mensais**. Essa cota é **global** (soma o uso das funcionalidades de reescrita, tradução e SEO juntas). A renovação da cota ocorre no primeiro dia de cada mês no calendário.

3. **Cota Diária Global (Plano Free):**
   Aos usuários do plano gratuito é permitida uma cota muito estrita de **5 requisições por dia** para experimentação das ferramentas de inteligência artificial.

4. **Tratamento de Exaustão (Hard Limit):**
   Ao atingir as cotas (5/dia ou 500/mês), os endpoints passam a retornar HTTP 429 (`Too Many Requests`), sendo o usuário notificado na interface de que seu limite foi atingido.

---
*Análise documentada e aplicada ao código-fonte.*
