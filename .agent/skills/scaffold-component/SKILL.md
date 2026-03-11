---
name: scaffold-component
description: Automatiza a criação de componentes React no padrão arquitetural do projeto (Next.js App Router, i18n, Tailwind + SCSS modules).
---

# Scaffold Component Skill

## Contexto e Padrões do Projeto
Este projeto (Editor de Texto) possui convenções cruciais para a consistência visual e técnica:
- **Design e UI/UX Minimalista**: O sistema segue um layout minimalista fortemente inspirado no padrão de design da Apple. Estilos e componentes devem sempre seguir esse padrão visual focado em elegância e clareza.
- **Performance Rigorosa (Score > 90)**: A performance é crítica e NUNCA deve abaixar de 90. Antes de iniciar qualquer implementação, deve-se avaliar previamente a abordagem de menor impacto na performance. Caso, após o build, o score caia para menos de 90, o usuário deve ser notificado *imediatamente* sobre o ocorrido.
- **Testes Unitários Necessários**: Sempre que for criada alguma funcionalidade nova que seja crucial para o funcionamento do sistema, devem ser gerados testes unitários para essa funcionalidade.
- **Diretórios**: Componentes genéricos ficam em `src/components/shared/` ou subdiretórios específicos. Componentes de rotas ficam em `src/app/[locale]/_components/`.
- **Estilização Híbrida**: O projeto usa Tailwind classes em conjunto com SCSS (`style.scss` ou `style.module.scss` importado via `clsx`).
- **i18n e Props**: Tipagem explícita com interfaces ex: `interface NomeProps` recebendo frequentemente `locale: Locale` (importado de `src/i18n-config` ou `../../../i18n-config`).
- **Exportação**: Deve-se utilizar exportação nomeada explícita (ex: `export const Component = ...`) ao invés de `export default`.

## Guia Passo a Passo de Execução
Sempre que ativada para criar um novo componente, a skill deve:

1. **Planejamento de Performance**: Avaliar primeiro a melhor forma de implementar o componente para garantir que a performance permaneça > 90.
2. **Definir a Rota/Diretório**: Determinar com o usuário se é um componente de UI global ou acoplado a uma página específica (mantendo em mente o design minimalista).
2. **Criar a Estrutura**:
   - Criar o arquivo do componente Ex: `src/components/shared/Nome/Nome.tsx`.
   - Se houver CSS customizado além do Tailwind, criar `src/components/shared/Nome/style.module.scss`.
3. **Injetar o Boilerplate**:
   ```tsx
   "use client"; // Retirar se for Server Component

   import React from "react";
   import clsx from "clsx";
   import { Locale } from "@/i18n-config";
   // import styles from "./style.module.scss";

   export interface NomeProps {
     locale?: Locale;
     className?: string;
   }

   export const Nome: React.FC<NomeProps> = ({ locale, className }) => {
     return (
       <div className={clsx("flex flex-col", className)}>
         {/* Conteúdo gerado */}
       </div>
     );
   };
   ```
4. **Acoplar Internacionalização (Se necessário)**: Consultar em `src/data/` se é preciso criar um novo dicionário (ex: `src/data/nome-componente/pt.ts`).
5. **Escrever Testes Unitários**: Se a funcionalidade gerada for crucial para o funcionamento do sistema, já deixar preparado o script de teste unitário focado nessa lógica.

## Scripts Bash/Python sugeridos para Validação
Ao finalizar a injeção do código, a skill pode rodar estas validações no terminal do usuário para garantir a conformidade:

1. **Validador de Exportação Nomeada (Bash)**:
   ```bash
   # Verifica se o componente não está usando 'export default' sem necessidade
   if grep -q "export default" "$FILE_PATH"; then
     echo "Aviso: O projeto prefere exportações nomeadas (export const Func) sobre export default, exceto em pages."
   fi
   ```

2. **Scanner de Classes CSS vs SCSS Modules (Python)**:
   ```python
   # Script para assegurar que imports styles não fiquem sem uso
   import re, sys
   with open(sys.argv[1], 'r') as f:
       content = f.read()
       has_styles_import = re.search(r'import styles from', content)
       has_styles_usage = re.search(r'styles\.', content)
       if has_styles_import and not has_styles_usage:
           print("❌ Erro de SCSS: styles importados mas não utilizados.")
   ```

3. **Validador de Props Locale (Bash)**:
   ```bash
   # Opcional: Para componentes em _components que devem ser traduzidos
   grep -q "locale:" "$FILE_PATH" || echo "Aviso: A prop locale não encontrada na interface de props deste componente de página."
   ```
