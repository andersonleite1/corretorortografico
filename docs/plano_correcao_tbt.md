# Plano de Correção do TBT (Total Blocking Time)

Este documento foi gerado a partir da análise de tarefas longas (Long Tasks) identificadas via Lighthouse na página inicial. Embora o TBT geral já esteja relativamente otimizado (em torno de 110ms), ainda existem execuções isoladas na Main Thread (acima de 50ms) que causam atrasos na interatividade (INP e TBT).

## 1. As Tarefas Mais Pesadas (Long Tasks)

| Posição | Origem do Script | Tempo de Duração (ms) | Descrição do Bloqueio |
|---------|------------------|----------------------|------------------------|
| 1 | `http://localhost:3000/` (Main Bundle / React) | **262.00 ms** | Tempo principal de hidratação (Hydration) do React e inicialização do Next.js. Toda a árvore de componentes da página. |
| 2 | `@clerk/clerk-js` (via `clerk.accounts.dev`) | **159.00 ms** | Script de autenticação do Clerk inicializando os listeners de sessão e gerenciamento de estado no lado do cliente. |
| 3 | `Unattributable` (Geralmente Tarefas de Layout/Render) | **51.00 ms** | Trabalho interno do navegador (Recálculo de Estilo, Layout e Paint) gerado por injeção de CSS ou manipulação excessiva do DOM durante a hidratação. |

*Nota: Os scripts de Analytics, Clarity e GTM já estão utilizando a estratégia `lazyOnload` do Next.js, por isso não aparecem como piores ofensores bloqueantes do TBT na carga inicial. No entanto, sua execução tardia ainda consome processamento.*

## 2. Estratégias de Otimização

### A. Scripts Próprios (Code Splitting e Dynamic Imports)
O Bundle principal do React (`http://localhost:3000/`) é a maior Long Task (262ms). Para reduzi-la, componentes pesados que não são imediatamente visíveis (como Modais, Configurações Ocultas ou áreas abaixo da primeira rolagem da página) devem ser importados dinamicamente.

**Sugestão de Snippet (Dynamic Import no Next.js):**
```tsx
import dynamic from 'next/dynamic';

// Evita que o componente seja empacotado no bundle inicial e bloqueie a hidratação
const HeavyFeatureComponent = dynamic(
  () => import('@/components/HeavyFeature'),
  { ssr: false, loading: () => <p>Carregando...</p> }
);
```

### B. Scripts de Terceiros e Autenticação (Clerk e Analytics)
O `@clerk/clerk-js` é pesado (159ms). Como o Clerk é essencial para a autenticação, não podemos usar Partytown facilmente para ele. No entanto, para outros scripts como GTM ou Pixel, o uso do **Partytown** (via pacote `@next/third-parties/google`) executa esses códigos num Web Worker.

**Sugestão de Snippet (Web Workers via Partytown):**
Se for adotar o Partytown no Next.js para mover completamente a execução de terceiros (Analytics) da Main Thread:

```tsx
// Substituir a tag local <Script> tradicional por esta abordagem (se suportado pelo Next>13):
import { GoogleAnalytics } from '@next/third-parties/google';

export function Analytics() {
  return (
    <GoogleAnalytics gaId="G-XFE7CNSV4S" />
  );
}
```
*No `next.config.js` habilitar o Partytown: `experimental: { nextScriptWorkers: true }`.*

### C. Analisando Loops Pesados e "Idle Until Urgent"
Se existirem funções no código (ex: processamento de grandes blocos de texto no editor, cálculos de Word Count), elas bloqueiam a Main Thread caso o texto seja gigante.

Devemos aplicar o padrão **"Yield to Main"**. Se tivermos um processamento síncrono enorme, devemos fatiá-lo:

**Sugestão de Snippet (Refatoração com setTimeout):**
```ts
// Em vez de rodar um loop de 10.000 itens de uma só vez:
function processHeavyTask(items) {
  let i = 0;
  
  function processChunk() {
    // Processa apenas 50ms de cada vez para evitar "Long Tasks"
    const end = Math.min(i + 500, items.length);
    for (; i < end; i++) {
        // ... manipulação de cálculo ...
    }
    
    if (i < items.length) {
      // Yield (devolve) a Main Thread para o navegador respirar e agenda o resto
      setTimeout(processChunk, 0); 
      // Ou requestIdleCallback(processChunk) para baixa prioridade
    }
  }
  
  processChunk();
}
```

## 3. Conclusão para baixar TBT abaixo de 200ms
Através de (1) Code Splitting na Home (adiando componentes do editor/ferramentas para quando o usuário de fato interagir) e (2) migração completa dos GTM/Clarity para Web Workers (Partytown), o tempo de processamento contíguo é fracionado, extinguindo qualquer Long Task isolada maior que 50ms e levando o TBT a níveis irrelevantes no Lighthouse.
