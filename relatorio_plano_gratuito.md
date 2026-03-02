# Relatório de Análise: Plano Gratuito e Limites de IA

Este relatório detalha a análise do sistema de limites e renovação diária para usuários do plano gratuito no editor de texto.

## 1. Renovação Diária do Plano Gratuito
A renovação diária do limite para usuários do plano gratuito é implementada de forma **implícita**. 
- **Lógica:** O sistema não "reseta" um contador fixo no banco de dados. Em vez disso, a cada nova requisição, a função `checkAiRateLimit` (em `src/lib/ai-rate-limit.ts`) calcula o uso total do usuário desde o início do dia atual (`00:00:00` do horário do servidor).
- **Eficácia:** Isso garante que o limite seja renovado automaticamente a cada novo dia, sem a necessidade de processos em lote ou crons de limpeza para essa finalidade específica.

## 2. Limite de Cinco Reescritas Diárias
O limite de uso para o plano gratuito está definido no código como **5 utilizações**.
- **Localização:** `src/lib/ai-rate-limit.ts`, na constante `PLAN_LIMITS`.
- **Confirmação:** O sistema permite até 5 requisições de IA por dia para usuários identificados com o plano `free`. No entanto, é importante notar que este limite é **global para todas as funcionalidades de IA** (como reescrita e tradução).

## 3. Análise de Exceções e Restrições
A análise sobre a garantia de cinco reescritas diárias "sem exceções" revelou alguns pontos que podem atuar como barreiras ou exceções indiretas:

- **Uso Compartilhado:** O limite de 5 é compartilhado entre `reescrita` (`rewrite`) e `tradução` (`translate`). Se um usuário utilizar 3 traduções, ele só terá direito a 2 reescritas, o que pode ser visto como uma exceção ao direito de "cinco reescritas" isoladamente.
- **Rate Limit por IP:** Existe uma camada de proteção global baseada em IP (`ratelimit.ai.limit(ip)` em `src/lib/ratelimit.ts`). Um usuário pode ser bloqueado por excesso de requisições vindas de um mesmo IP antes mesmo de atingir seu limite individual de conta de 5 usos.
- **Restrição de Tons:** Para usuários gratuitos, a funcionalidade de reescrita está limitada aos primeiros 5 tons padrão ("formal", "casual", "academic", "creative", "simplified"). Caso tente usar outros, a requisição é negada com erro 403, independentemente de ter usado ou não as 5 reescritas.
- **Falha no Registro de Uso:** O registro de uso (`db.aiUsage.create`) ocorre após o término do streaming da IA. Se houver uma falha técnica no banco de dados nesse momento, o uso pode não ser contabilizado, permitindo tecnicamente mais usos do que o limite (embora seja um caso de erro, não uma lógica proposital).

## Conclusão
O sistema cumpre a promessa de oferecer um limite diário renovável de 5 usos para o plano gratuito, mas este limite é um teto compartilhado entre funcionalidades do assistente de IA e está sujeito a regras de segurança globais por IP e restrições de escopo de funcionalidade (tons permitidos).
